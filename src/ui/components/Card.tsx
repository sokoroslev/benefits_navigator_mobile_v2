import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";

export function Card(props: React.PropsWithChildren<{ title?: string }>) {
  return (
    <View style={styles.card}>
      {props.title ? <Text style={styles.title}>{props.title}</Text> : null}
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
  },
  title: { fontSize: 14, fontWeight: "800", marginBottom: 10, color: colors.text },
});
