import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Fuse from "fuse.js";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { measures } from "../data/measures";
import { evaluateMeasures } from "../engine/eligibility";
import { Eligibility, Measure, MeasureLevel, MeasureType } from "../types";
import { Chip, SearchInput, SkeletonCard, colors } from "../ui";
import { useStore } from "../store/store";
import { RootStackParamList } from "../navigation/types";
import { MeasureListItem } from "./MeasureListItem";

const CATEGORY_LABELS: Record<Measure["category"], string> = {
  family: "Семья",
  health: "Здоровье",
  business: "Бизнес",
  education: "Образование",
  housing: "Жильё",
  employment: "Работа",
  disability: "Инвалидность",
  tax: "Налоги",
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

const levelOptions: { value: MeasureLevel | "all"; label: string }[] = [
  { value: "all", label: "Все уровни" },
  { value: "federal", label: "Федеральные" },
  { value: "regional", label: "Региональные" },
  { value: "municipal", label: "Муниципальные" },
];

const typeOptions: { value: MeasureType | "all"; label: string }[] = [
  { value: "all", label: "Все типы" },
  { value: "payment", label: "Выплаты" },
  { value: "benefit", label: "Льготы" },
  { value: "service", label: "Услуги" },
  { value: "tax_deduction", label: "Вычеты" },
];

const statusOptions: { value: Eligibility | "all"; label: string }[] = [
  { value: "all", label: "Все статусы" },
  { value: "eligible", label: "Подходит" },
  { value: "maybe", label: "Уточнить" },
  { value: "not_eligible", label: "Не подходит" },
];

export function BrowseScreen() {
  const nav = useNavigation<Nav>();
  const { state } = useStore();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Measure["category"] | "all">("all");
  const [level, setLevel] = useState<MeasureLevel | "all">("all");
  const [type, setType] = useState<MeasureType | "all">("all");
  const [status, setStatus] = useState<Eligibility | "all">("all");
  const [onlyMyRegion, setOnlyMyRegion] = useState(false);

  // skeleton loading
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, [state.profile.region]);

  const results = useMemo(() => evaluateMeasures(state.profile, measures), [state.profile]);
  const byResult = useMemo(() => new Map(results.map((r) => [r.measureId, r])), [results]);

  const categoryOptions = useMemo(() => {
    const uniq = Array.from(new Set(measures.map((m) => m.category)));
    // stable order: use the label map
    uniq.sort((a, b) => CATEGORY_LABELS[a].localeCompare(CATEGORY_LABELS[b], "ru"));
    return [{ value: "all" as const, label: "Все категории" }].concat(
      uniq.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))
    );
  }, []);

  const filtered = useMemo(() => {
    const region = state.profile.region;

    const base = measures
      .filter((m) => (category === "all" ? true : m.category === category))
      .filter((m) =>
        onlyMyRegion ? (m.regions[0] === "*" ? false : (m.regions as string[]).includes(region)) : true
      )
      .filter((m) => (level === "all" ? true : m.level === level))
      .filter((m) => (type === "all" ? true : m.type === type))
      .filter((m) => {
        if (status === "all") return true;
        const r = byResult.get(m.id);
        return r?.eligibility === status;
      });

    const query = q.trim();
    if (!query) return base;

    const fuse = new Fuse(base, {
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: "title", weight: 0.5 },
        { name: "summary", weight: 0.3 },
        { name: "whatYouGet", weight: 0.2 },
        { name: "documents", weight: 0.2 },
        { name: "whereToApply", weight: 0.2 },
      ],
    });

    return fuse.search(query).map((r) => r.item);
  }, [q, category, level, type, status, onlyMyRegion, state.profile.region, byResult]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Каталог мер</Text>
      <Text style={styles.muted}>Поиск + фильтры. Статус “подходит/уточнить/не подходит” считается по вашему профилю.</Text>

      <SearchInput value={q} onChange={setQ} placeholder="Поиск по мерам, документам, куда подавать…" />

      <View style={styles.filterBlock}>
        <Text style={styles.blockTitle}>Фильтры</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categoryOptions.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              selected={category === o.value}
              onPress={() => setCategory(o.value)}
            />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {levelOptions.map((o) => (
            <Chip key={o.value} label={o.label} selected={level === o.value} onPress={() => setLevel(o.value)} />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {typeOptions.map((o) => (
            <Chip key={o.value} label={o.label} selected={type === o.value} onPress={() => setType(o.value)} />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {statusOptions.map((o) => (
            <Chip key={o.value} label={o.label} selected={status === o.value} onPress={() => setStatus(o.value)} />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip
            label={onlyMyRegion ? "Только мой регион: да" : "Только мой регион: нет"}
            selected={onlyMyRegion}
            onPress={() => setOnlyMyRegion((x) => !x)}
          />
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ gap: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {filtered.length === 0 ? (
            <Text style={styles.muted}>Ничего не найдено. Попробуйте снять фильтры или изменить запрос.</Text>
          ) : (
            filtered.map((m) => (
              <MeasureListItem
                key={m.id}
                measure={m}
                evalResult={byResult.get(m.id)}
                onOpen={() => nav.navigate("MeasureDetail", { id: m.id })}
              />
            ))
          )}
        </View>
      )}

      <Text style={styles.footerNote}>Демо-данные. Для продакшена нужен реестр мер + обновления по регионам.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, backgroundColor: colors.bg },
  h1: { fontSize: 22, fontWeight: "900", color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  filterBlock: { gap: 10, paddingTop: 4 },
  blockTitle: { fontSize: 14, fontWeight: "900", color: colors.text },
  chips: { gap: 8, paddingVertical: 2 },
  footerNote: { marginTop: 6, color: colors.muted, fontSize: 12 },
});
