import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius } from "../theme";

export function Skeleton({ height = 14, width = "100%", radiusPx = 10 }: { height?: number; width?: number | string; radiusPx?: number }) {
  const style = useMemo(() => ({ height, width, borderRadius: radiusPx }), [height, width, radiusPx]);
  return <View style={[styles.base, style]} />;
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton height={16} width="75%" radiusPx={10} />
      <View style={{ height: 10 }} />
      <Skeleton height={12} width="95%" radiusPx={10} />
      <View style={{ height: 6 }} />
      <Skeleton height={12} width="85%" radiusPx={10} />
      <View style={{ height: 12 }} />
      <Skeleton height={12} width="40%" radiusPx={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.border, opacity: 0.75 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14 },
});
