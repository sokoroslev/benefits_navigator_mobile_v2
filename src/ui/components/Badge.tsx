import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";

export function Badge({ kind, label }: { kind: "ok" | "maybe" | "no"; label: string }) {
  const s = kind === "ok" ? styles.ok : kind === "maybe" ? styles.maybe : styles.no;
  const c = kind === "ok" ? colors.ok : kind === "maybe" ? colors.maybe : colors.no;
  return (
    <View style={[styles.base, s]}>
      <Text style={[styles.text, { color: c }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, alignSelf: "flex-start" },
  text: { fontSize: 12, fontWeight: "900" },
  ok: { backgroundColor: "rgba(22,163,74,0.12)", borderColor: "rgba(22,163,74,0.35)" },
  maybe: { backgroundColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.35)" },
  no: { backgroundColor: "rgba(220,38,38,0.12)", borderColor: "rgba(220,38,38,0.35)" },
});
