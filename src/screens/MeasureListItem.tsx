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
      ? { kind: "ok" as const, label: `Подходит ${evalResult.fitPercent ?? 100}%` }
      : evalResult?.eligibility === "maybe"
      ? { kind: "maybe" as const, label: `Возможно ${evalResult.fitPercent ?? 75}%` }
      : evalResult?.eligibility === "not_eligible"
      ? { kind: "no" as const, label: "Не подходит" }
      : null;

  const levelLabel =
    measure.level === "federal"
      ? "Федеральная"
      : measure.level === "regional"
      ? "Региональная"
      : "Муниципальная";

  const oneReason = evalResult?.reasonOneLine ?? evalResult?.reasons?.[0];

  return (
    <Pressable onPress={onOpen}>
      <Card>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.title}>{measure.title}</Text>
            <Text style={styles.muted}>{measure.short}</Text>
            <View style={styles.tagsRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{levelLabel}</Text>
              </View>
            </View>
          </View>
          <View style={{ alignItems: "flex-end", gap: 10 }}>
            {badge ? <Badge kind={badge.kind} label={badge.label} /> : null}
            <Pressable onPress={() => toggleFavorite(measure.id)} hitSlop={10}>
              <Text style={[styles.star, fav ? { color: colors.primary } : { color: colors.muted }]}>{fav ? "★" : "☆"}</Text>
            </Pressable>
          </View>
        </View>

        {oneReason ? (
          <Text style={styles.reasonLine} numberOfLines={1} ellipsizeMode="tail">
            {oneReason}
          </Text>
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
  tagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 2 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  tagText: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  reasonLine: { marginTop: 10, color: colors.muted, fontSize: 12 },
  link: { marginTop: 10, color: colors.primary, fontWeight: "900" },
  star: { fontSize: 22, fontWeight: "900" },
});
