import React from "react";
import { Platform, StyleSheet, Text, TextInput, View, Switch } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors, radius } from "./theme";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "default" | "numeric";
  placeholder?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </Field>
  );
}

export function SwitchField({
  label,
  value,
  onValueChange,
  hint,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <View style={styles.switchRow}>
        <Switch value={value} onValueChange={onValueChange} />
        <Text style={styles.switchText}>{value ? "Да" : "Нет"}</Text>
      </View>
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={value} onValueChange={(v) => onChange(v as T)}>
          {options.map((o) => (
            <Picker.Item key={o.value} label={o.label} value={o.value} />
          ))}
        </Picker>
      </View>
    </Field>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "800", color: colors.text },
  hint: { fontSize: 12, color: colors.muted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 15,
    color: colors.text,
  },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  switchText: { fontSize: 13, fontWeight: "800", color: colors.muted },
  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
  },
});
