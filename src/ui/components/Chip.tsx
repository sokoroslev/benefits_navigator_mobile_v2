import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../theme";

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.base, selected ? styles.selected : styles.normal]}>
      <Text style={[styles.text, selected ? { color: colors.primary } : { color: colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1 },
  normal: { backgroundColor: colors.surface, borderColor: colors.border },
  selected: { backgroundColor: "rgba(29,78,216,0.06)", borderColor: "rgba(29,78,216,0.35)" },
  text: { fontSize: 13, fontWeight: "800" },
});
