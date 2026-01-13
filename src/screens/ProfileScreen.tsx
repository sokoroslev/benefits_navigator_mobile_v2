import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useStore } from "../store/store";
import { Card, Button, colors } from "../ui";
import { SelectField, SwitchField, TextField } from "../ui/form";
import { clamp, isISODate, safeNumber } from "../utils/util";
import { DisabilityGroup, UserProfile } from "../types";

const employmentOptions = [
  { value: "employed", label: "Работаю по найму" },
  { value: "self_employed", label: "Самозанятый" },
  { value: "ip", label: "ИП" },
  { value: "unemployed", label: "Не работаю" },
  { value: "pensioner", label: "Пенсионер" },
  { value: "mixed", label: "Смешанный" },
] as const;

const disabilityOptions = [
  { value: "none", label: "Нет" },
  { value: "I", label: "I группа" },
  { value: "II", label: "II группа" },
  { value: "III", label: "III группа" },
  { value: "child", label: "Ребёнок-инвалид (опекун)" },
] as const;

const housingOptions = [
  { value: "own", label: "Собственность" },
  { value: "rent", label: "Аренда" },
  { value: "social", label: "Соцнайм" },
  { value: "other", label: "Другое" },
] as const;

export function ProfileScreen() {
  const { state, setProfile } = useStore();
  const p = state.profile;

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile({ ...p, [key]: value });
  }

  function setChildDate(i: number, dateISO: string) {
    const next = [...p.children];
    next[i] = { ...next[i], birthDateISO: dateISO };
    setProfile({ ...p, children: next });
  }

  function addChild() {
    setProfile({ ...p, children: [...p.children, { birthDateISO: "2025-01-01" }] });
  }

  function removeChild() {
    if (p.children.length <= 0) return;
    setProfile({ ...p, children: p.children.slice(0, -1) });
  }

  const childCount = p.children.length;

  const invalidDates = useMemo(() => p.children.some((c) => c.birthDateISO && !isISODate(c.birthDateISO)), [p.children]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Профиль</Text>
      <Text style={styles.muted}>Профиль используется для расчёта статуса “подходит/уточнить/не подходит”.</Text>

      <Card title="Регион">
        <View style={{ gap: 12 }}>
          <TextField
            label="Регион (код)"
            hint='Пока вручную, например "RU-MOW". Позже — список субъектов.'
            value={p.region}
            onChangeText={(v) => set("region", v)}
          />
          <SwitchField
            label="Есть регистрация в регионе"
            value={p.hasRegionalRegistration}
            onValueChange={(v) => set("hasRegionalRegistration", v)}
          />
        </View>
      </Card>

      <Card title="Состав семьи">
        <View style={{ gap: 12 }}>
          <TextField
            label="Взрослых в семье"
            value={String(p.householdAdults)}
            onChangeText={(v) => set("householdAdults", clamp(safeNumber(v, 1), 1, 20) as any)}
            keyboardType="numeric"
          />

          <View style={styles.counterRow}>
            <Text style={styles.counterLabel}>Детей:</Text>
            <Pressable onPress={removeChild} style={styles.counterBtn}><Text style={styles.counterBtnText}>−</Text></Pressable>
            <Text style={styles.counterValue}>{childCount}</Text>
            <Pressable onPress={addChild} style={styles.counterBtn}><Text style={styles.counterBtnText}>+</Text></Pressable>
          </View>

          {invalidDates ? <Text style={styles.warn}>Проверьте даты рождения: формат YYYY-MM-DD.</Text> : null}

          <View style={{ gap: 10 }}>
            {p.children.map((c, i) => (
              <TextField
                key={i}
                label={`Ребёнок #${i + 1} — дата рождения`}
                hint="Формат: YYYY-MM-DD"
                value={c.birthDateISO}
                onChangeText={(v) => setChildDate(i, v)}
                placeholder="2022-01-01"
              />
            ))}
          </View>
        </View>
      </Card>

      <Card title="Доход и занятость">
        <View style={{ gap: 12 }}>
          <TextField
            label="Доход семьи в месяц (₽)"
            value={String(p.monthlyHouseholdIncomeRub)}
            onChangeText={(v) => set("monthlyHouseholdIncomeRub", clamp(safeNumber(v, 0), 0, 10_000_000) as any)}
            keyboardType="numeric"
          />
          <SelectField
            label="Занятость"
            value={p.employment}
            onChange={(v) => set("employment", v as any)}
            options={employmentOptions as any}
          />
          <SwitchField label="Официально безработный" value={p.isOfficiallyUnemployed} onValueChange={(v) => set("isOfficiallyUnemployed", v)} />
          <SwitchField label="Плачу НДФЛ 13% (есть официальная ЗП)" value={p.paysNDFL13} onValueChange={(v) => set("paysNDFL13", v)} />
        </View>
      </Card>

      <Card title="Инвалидность и уход">
        <View style={{ gap: 12 }}>
          <SelectField
            label="Инвалидность"
            value={p.disability}
            onChange={(v) => set("disability", v as DisabilityGroup)}
            options={disabilityOptions as any}
          />
          <SwitchField label="Ухаживаю за инвалидом/ребёнком-инвалидом" value={p.caringForDisabledOrChild} onValueChange={(v) => set("caringForDisabledOrChild", v)} />
        </View>
      </Card>

      <Card title="Жильё и ипотека">
        <View style={{ gap: 12 }}>
          <SelectField label="Тип жилья" value={p.housing} onChange={(v) => set("housing", v as any)} options={housingOptions as any} />
          <SwitchField label="Есть ипотека" value={p.hasMortgage} onValueChange={(v) => set("hasMortgage", v)} />
        </View>
      </Card>

      <Card title="Расходы для налоговых вычетов">
        <View style={{ gap: 12 }}>
          <SwitchField label="Расходы на лечение" value={p.hasMedicalExpenses} onValueChange={(v) => set("hasMedicalExpenses", v)} />
          <SwitchField label="Лекарства по рецепту" value={p.hasPrescriptionDrugsExpenses} onValueChange={(v) => set("hasPrescriptionDrugsExpenses", v)} />
          <SwitchField label="Спорт/фитнес" value={p.hasSportExpenses} onValueChange={(v) => set("hasSportExpenses", v)} />
          <SwitchField label="Обучение" value={p.hasEducationExpenses} onValueChange={(v) => set("hasEducationExpenses", v)} />
          <SwitchField label="Ипотечные проценты" value={p.hasMortgageInterestExpenses} onValueChange={(v) => set("hasMortgageInterestExpenses", v)} />
        </View>
      </Card>

      <Text style={styles.footerNote}>Сохранение профиля происходит автоматически на устройстве.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, backgroundColor: colors.bg },
  h1: { fontSize: 22, fontWeight: "900", color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  warn: { color: colors.no, fontSize: 13, fontWeight: "800" },
  footerNote: { color: colors.muted, fontSize: 12, marginTop: 6 },

  counterRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  counterLabel: { fontWeight: "900", color: colors.text },
  counterBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  counterBtnText: { fontSize: 16, fontWeight: "900", color: colors.text },
  counterValue: { minWidth: 34, textAlign: "center", fontWeight: "900", color: colors.text },
});
