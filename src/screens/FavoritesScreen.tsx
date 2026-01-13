import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { measures } from "../data/measures";
import { evaluateMeasures } from "../engine/eligibility";
import { SearchInput, SkeletonCard, colors } from "../ui";
import { useStore } from "../store/store";
import { RootStackParamList } from "../navigation/types";
import { MeasureListItem } from "./MeasureListItem";
import { containsCI } from "../utils/util";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function FavoritesScreen() {
  const nav = useNavigation<Nav>();
  const { state } = useStore();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [state.favorites.length]);

  const results = useMemo(() => evaluateMeasures(state.profile, measures), [state.profile]);
  const byResult = useMemo(() => new Map(results.map((r) => [r.measureId, r])), [results]);

  const favMeasures = useMemo(() => {
    const set = new Set(state.favorites);
    return measures.filter((m) => set.has(m.id));
  }, [state.favorites]);

  const filtered = useMemo(() => {
    if (!q.trim()) return favMeasures;
    return favMeasures.filter((m) => containsCI(`${m.title} ${m.short}`, q.trim()));
  }, [favMeasures, q]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Избранное</Text>
      <Text style={styles.muted}>Отмечайте ★ в каталоге или на странице меры.</Text>

      <SearchInput value={q} onChange={setQ} placeholder="Поиск по избранному…" />

      {loading ? (
        <View style={{ gap: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {filtered.length === 0 ? (
            <Text style={styles.muted}>Пока пусто. Добавьте меры в избранное (★).</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, backgroundColor: colors.bg },
  h1: { fontSize: 22, fontWeight: "900", color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
});
