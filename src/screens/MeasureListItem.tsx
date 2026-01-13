import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Measure, EvaluationResult } from "../types";
import { Badge, Card, colors } from "../ui";
import { useStore } from "../store/store";

export function MeasureListItem({
  measure,
  evalResult,
  onOpen,
}: {
  measure: Measure;
  evalResult?: EvaluationResult;
  onOpen: () => void;
}) {
  const { toggleFavorite, isFavorite } = useStore();
  const fav = isFavorite(measure.id);

  const badge =
    evalResult?.eligibility === "eligible"
      ? { kind: "ok" as const, label: "Подходит" }
      : evalResult?.eligibility === "maybe"
      ? { kind: "maybe" as const, label: "Уточнить" }
      : evalResult?.eligibility === "not_eligible"
      ? { kind: "no" as const, label: "Не подходит" }
      : null;

  return (
    <Pressable onPress={onOpen}>
      <Card>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.title}>{measure.title}</Text>
            <Text style={styles.muted}>{measure.short}</Text>
            <Text style={styles.meta}>
              {measure.level === "federal" ? "Федеральная" : measure.level === "regional" ? "Региональная" : "Муниципальная"} • {measure.type}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 10 }}>
            {badge ? <Badge kind={badge.kind} label={badge.label} /> : null}
            <Pressable onPress={() => toggleFavorite(measure.id)} hitSlop={10}>
              <Text style={[styles.star, fav ? { color: colors.primary } : { color: colors.muted }]}>{fav ? "★" : "☆"}</Text>
            </Pressable>
          </View>
        </View>

        {evalResult?.reasons?.length ? (
          <View style={{ marginTop: 10, gap: 4 }}>
            {evalResult.reasons.slice(0, 2).map((x, i) => (
              <Text key={i} style={styles.reason}>• {x}</Text>
            ))}
          </View>
        ) : null}

        <Text style={styles.link}>Подробнее →</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  title: { fontSize: 15, fontWeight: "900", color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  reason: { color: colors.muted, fontSize: 12 },
  link: { marginTop: 10, color: colors.primary, fontWeight: "900" },
  star: { fontSize: 22, fontWeight: "900" },
});
