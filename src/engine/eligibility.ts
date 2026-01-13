import { Measure, UserProfile, RuleNode, Condition, EvaluationResult, Eligibility } from "../types";

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

function evalCond(profile: UserProfile, cond: Condition): { ok: boolean; reason: string } {
  const actual = getByPath(profile, cond.path);
  const op = cond.op;

  if (op === "exists") {
    const ok = actual !== undefined && actual !== null && actual !== "";
    return { ok, reason: ok ? "" : `Нет значения для ${cond.path}` };
  }

  const expected = cond.value;

  switch (op) {
    case "eq": return { ok: actual === expected, reason: actual === expected ? "" : `${cond.path} должно быть равно ${expected}` };
    case "neq": return { ok: actual !== expected, reason: actual !== expected ? "" : `${cond.path} не должно быть равно ${expected}` };
    case "gt": return { ok: Number(actual) > Number(expected), reason: Number(actual) > Number(expected) ? "" : `${cond.path} должно быть > ${expected}` };
    case "gte": return { ok: Number(actual) >= Number(expected), reason: Number(actual) >= Number(expected) ? "" : `${cond.path} должно быть ≥ ${expected}` };
    case "lt": return { ok: Number(actual) < Number(expected), reason: Number(actual) < Number(expected) ? "" : `${cond.path} должно быть < ${expected}` };
    case "lte": return { ok: Number(actual) <= Number(expected), reason: Number(actual) <= Number(expected) ? "" : `${cond.path} должно быть ≤ ${expected}` };
    case "in": {
      const ok = Array.isArray(expected) ? expected.includes(actual) : false;
      return { ok, reason: ok ? "" : `${cond.path} должно входить в список` };
    }
    default:
      return { ok: false, reason: `Неизвестный оператор: ${(op as any)}` };
  }
}

function evalRule(profile: UserProfile, node: RuleNode): { ok: boolean; reasons: string[] } {
  if ("cond" in node) {
    const r = evalCond(profile, node.cond);
    return { ok: r.ok, reasons: r.ok ? [] : [r.reason] };
  }
  if ("all" in node) {
    const reasons: string[] = [];
    for (const child of node.all) {
      const r = evalRule(profile, child);
      if (!r.ok) reasons.push(...r.reasons);
    }
    return { ok: reasons.length === 0, reasons };
  }
  if ("any" in node) {
    const collected: string[] = [];
    for (const child of node.any) {
      const r = evalRule(profile, child);
      if (r.ok) return { ok: true, reasons: [] };
      collected.push(...r.reasons);
    }
    return { ok: false, reasons: collected.slice(0, 3) };
  }
  if ("not" in node) {
    const r = evalRule(profile, node.not);
    return { ok: !r.ok, reasons: r.ok ? [`Условие не должно выполняться`] : [] };
  }
  return { ok: false, reasons: ["Неподдерживаемое правило"] };
}

export function evaluateMeasures(profile: UserProfile, measures: Measure[]): EvaluationResult[] {
  return measures
    .filter((m) => m.regions[0] === "*" || (m.regions as string[]).includes(profile.region))
    .map((m) => {
      const { ok, reasons } = evalRule(profile, m.rule);
      if (ok) return { measureId: m.id, eligibility: "eligible" as Eligibility, reasons: [] };
      const missingOnly = reasons.every((x) => x.startsWith("Нет значения"));
      return { measureId: m.id, eligibility: (missingOnly ? "maybe" : "not_eligible") as Eligibility, reasons };
    });
}
