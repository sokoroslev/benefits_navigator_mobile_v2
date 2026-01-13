import React, { useMemo } from "react";
import { Linking, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { measures } from "../data/measures";
import { evaluateMeasures } from "../engine/eligibility";
import { Button, Card, colors } from "../ui";
import { useStore } from "../store/store";

type R = RouteProp<RootStackParamList, "MeasureDetail">;

export function MeasureDetailScreen() {
  const route = useRoute<R>();
  const { state, toggleFavorite, isFavorite } = useStore();
  const id = route.params.id;

  const m = useMemo(() => measures.find((x) => x.id === id), [id]);
  const results = useMemo(() => evaluateMeasures(state.profile, measures), [state.profile]);
  const r = useMemo(() => results.find((x) => x.measureId === id), [results, id]);

  if (!m) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>Не найдено</Text>
        <Text style={styles.muted}>Мера не найдена (id: {id}).</Text>
      </ScrollView>
    );
  }

  const fav = isFavorite(m.id);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable onPress={() => toggleFavorite(m.id)} hitSlop={10}>
          <Text style={[styles.star, fav ? { color: colors.primary } : { color: colors.muted }]}>{fav ? "★" : "☆"}</Text>
        </Pressable>
        <Text style={styles.meta}>{m.level.toUpperCase()} • {m.type}</Text>
      </View>

      <Text style={styles.h1}>{m.title}</Text>
      <Text style={styles.muted}>{m.short}</Text>

      <Card title="Что вы получите">
        <Text>{m.whatYouGet}</Text>
      </Card>

      <Card title="Куда подавать">
        {m.whereToApply.map((x, i) => <Text key={i}>• {x}</Text>)}
      </Card>

      <Card title="Документы">
        {m.documents.map((x, i) => <Text key={i}>• {x}</Text>)}
      </Card>

      <Card title="Шаги">
        {m.steps.map((x, i) => <Text key={i}>{i + 1}. {x}</Text>)}
      </Card>

      {r?.reasons?.length ? (
        <Card title={r.eligibility === "maybe" ? "Что уточнить" : "Почему не подходит"}>
          {r.reasons.map((x, i) => <Text key={i}>• {x}</Text>)}
        </Card>
      ) : null}

      <Card title="Официальные источники">
        {m.sources.map((s, i) => (
          <Pressable key={i} onPress={() => Linking.openURL(s.url)} hitSlop={10}>
            <Text style={styles.link}>↗ {s.title}</Text>
          </Pressable>
        ))}
      </Card>

      <Text style={styles.footerNote}>Демо-данные. В продакшене нужно показывать точные условия и источники по региону.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, backgroundColor: colors.bg },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  star: { fontSize: 26, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 12, fontWeight: "900" },
  h1: { fontSize: 22, fontWeight: "900", color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  link: { color: colors.primary, fontWeight: "900", marginTop: 6 },
  footerNote: { color: colors.muted, fontSize: 12, marginTop: 6 },
});
