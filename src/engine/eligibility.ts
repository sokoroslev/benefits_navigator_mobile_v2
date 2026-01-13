import { Measure, UserProfile, RuleNode, Condition, EvaluationResult, Eligibility } from "../types";
import { clamp } from "../utils/util";

export function deriveComputed(profile: UserProfile) {
  const now = new Date();
  const childrenCount = profile.children.length;

  const ages = profile.children.map((c) => {
    const bd = new Date(c.birthDateISO);
    const years = Math.floor((now.getTime() - bd.getTime()) / (365.25 * 24 * 3600 * 1000));
    return years;
  });

  const hasChildUnder3 = ages.some((a) => a < 3);
  const hasChildUnder7 = ages.some((a) => a < 7);
  const hasChildUnder18 = ages.some((a) => a < 18);

  return { childrenCount, childAges: ages, hasChildUnder3, hasChildUnder7, hasChildUnder18 };
}

function getByPath(profile: UserProfile, path: string): any {
  const computed = deriveComputed(profile);
  if ((computed as any)[path] !== undefined) return (computed as any)[path];
  if (path === "childrenCount") return computed.childrenCount;

  const parts = path.split(".");
  let cur: any = profile;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

type EvalScore = {
  ok: boolean;
  reasons: string[];
  total: number;
  failedWeight: number;
  missingCount: number;
  hardFailCount: number;
};

function humanMissingReason(path: string): string {
  // Небольшая «человечность» для UI.
  if (path.includes("income")) return "Нужна справка о доходах";
  if (path.includes("children")) return "Укажите количество детей";
  if (path.includes("age")) return "Укажите возраст";
  if (path.includes("disability")) return "Нужно подтвердить инвалидность";
  if (path.includes("student")) return "Нужно подтвердить статус студента";
  return `Нет значения для ${path}`;
}

function humanMismatchReason(cond: Condition): string {
  // Сохраняем точность, но короче и без «технички».
  const p = cond.path;
  switch (cond.op) {
    case "eq": return `Не подходит по условию: ${p}`;
    case "neq": return `Не подходит по условию: ${p}`;
    case "gt":
    case "gte":
    case "lt":
    case "lte":
      return `Не подходит по порогу: ${p}`;
    case "in": return `Не подходит по списку: ${p}`;
    case "exists": return humanMissingReason(p);
    default: return `Не подходит: ${p}`;
  }
}

function evalCondScored(profile: UserProfile, cond: Condition): EvalScore {
  const actual = getByPath(profile, cond.path);
  const op = cond.op;

  // exists — отдельный быстрый путь
  if (op === "exists") {
    const ok = actual !== undefined && actual !== null && actual !== "";
    return {
      ok,
      reasons: ok ? [] : [humanMissingReason(cond.path)],
      total: 1,
      failedWeight: ok ? 0 : 0.5,
      missingCount: ok ? 0 : 1,
      hardFailCount: 0,
    };
  }

  // Для любых сравнений: если значения нет — считаем «missing»
  if (actual === undefined || actual === null || actual === "") {
    return {
      ok: false,
      reasons: [humanMissingReason(cond.path)],
      total: 1,
      failedWeight: 0.5,
      missingCount: 1,
      hardFailCount: 0,
    };
  }

  const expected = cond.value;
  let ok = false;

  switch (op) {
    case "eq": ok = actual === expected; break;
    case "neq": ok = actual !== expected; break;
    case "gt": ok = Number(actual) > Number(expected); break;
    case "gte": ok = Number(actual) >= Number(expected); break;
    case "lt": ok = Number(actual) < Number(expected); break;
    case "lte": ok = Number(actual) <= Number(expected); break;
    case "in": ok = Array.isArray(expected) ? expected.includes(actual) : false; break;
    default: ok = false; break;
  }

  return {
    ok,
    reasons: ok ? [] : [humanMismatchReason(cond)],
    total: 1,
    failedWeight: ok ? 0 : 1,
    missingCount: 0,
    hardFailCount: ok ? 0 : 1,
  };
}

function mergeAll(results: EvalScore[]): EvalScore {
  const reasons: string[] = [];
  let total = 0;
  let failedWeight = 0;
  let missingCount = 0;
  let hardFailCount = 0;
  for (const r of results) {
    total += r.total;
    failedWeight += r.failedWeight;
    missingCount += r.missingCount;
    hardFailCount += r.hardFailCount;
    if (!r.ok) reasons.push(...r.reasons);
  }
  return {
    ok: results.every((r) => r.ok),
    reasons,
    total,
    failedWeight,
    missingCount,
    hardFailCount,
  };
}

function bestOfAny(results: EvalScore[]): EvalScore {
  // Если хотя бы один ok — всё ok.
  const okOne = results.find((r) => r.ok);
  if (okOne) {
    return { ...okOne, reasons: [] };
  }
  // Иначе выбираем ветку с лучшим скором.
  let best = results[0];
  let bestScore = best.total ? (1 - best.failedWeight / best.total) : 0;
  for (const r of results.slice(1)) {
    const s = r.total ? (1 - r.failedWeight / r.total) : 0;
    if (s > bestScore) {
      best = r;
      bestScore = s;
    }
  }
  return { ...best, reasons: best.reasons.slice(0, 3) };
}

function evalRuleScored(profile: UserProfile, node: RuleNode): EvalScore {
  if ("cond" in node) return evalCondScored(profile, node.cond);
  if ("all" in node) return mergeAll(node.all.map((c) => evalRuleScored(profile, c)));
  if ("any" in node) return bestOfAny(node.any.map((c) => evalRuleScored(profile, c)));
  if ("not" in node) {
    const r = evalRuleScored(profile, node.not);
    const ok = !r.ok;
    return {
      ok,
      reasons: ok ? [] : ["Условие не должно выполняться"],
      total: r.total || 1,
      failedWeight: ok ? 0 : (r.total || 1),
      missingCount: 0,
      hardFailCount: ok ? 0 : 1,
    };
  }
  return { ok: false, reasons: ["Неподдерживаемое правило"], total: 1, failedWeight: 1, missingCount: 0, hardFailCount: 1 };
}

function pickOneLineReason(reasons: string[]): string {
  const r = reasons.find(Boolean);
  if (!r) return "";
  // 1 строка для карточки
  return r.replace(/\s+/g, " ").trim();
}

export function evaluateMeasures(profile: UserProfile, measures: Measure[]): EvaluationResult[] {
  return measures
    .filter((m) => m.regions[0] === "*" || (m.regions as string[]).includes(profile.region))
    .map((m) => {
      const r = evalRuleScored(profile, m.rule);
      const rawScore = r.total ? 1 - r.failedWeight / r.total : (r.ok ? 1 : 0);
      const fitScore = clamp(rawScore, 0, 1);
      const fitPercent = Math.round(fitScore * 100);

      let eligibility: Eligibility = "not_eligible";
      if (r.ok) eligibility = "eligible";
      else if (r.hardFailCount === 0 && r.missingCount > 0) eligibility = "maybe";

      const reasons = r.ok ? [] : r.reasons;
      return {
        measureId: m.id,
        eligibility,
        reasons,
        fitScore,
        fitPercent,
        reasonOneLine: pickOneLineReason(reasons),
      };
    });
}
