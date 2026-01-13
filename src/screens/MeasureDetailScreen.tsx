import React, { useEffect, useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Measure } from "../types";
import { Screen } from "../ui/layout/Screen";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { colors, spacing, typography } from "../ui/theme";

type TabKey = "about" | "docs" | "where";

function tabLabel(k: TabKey) {
  switch (k) {
    case "about":
      return "Описание";
    case "docs":
      return "Документы";
    case "where":
      return "Где получить";
  }
}

function ctaLabel(url: string) {
  const u = url.toLowerCase();
  if (u.includes("gosuslugi")) return "Перейти на Госуслуги";
  if (u.includes("nalog") || u.includes("fns")) return "Открыть сайт ФНС";
  return "Открыть сайт";
}

function docKey(measureId: string) {
  return `bn_docs_checked_v1_${measureId}`;
}

export function MeasureDetailScreen({ route }: any) {
  const { measure } = route.params as { measure: Measure };
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<TabKey>("about");
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const primaryUrl = measure.sources?.find((s) => !!s.url)?.url;
  const stickyCtaHeight = 64 + insets.bottom;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(docKey(measure.id));
        if (!raw) return;
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        if (mounted) setCheckedDocs(parsed || {});
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [measure.id]);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(docKey(measure.id), JSON.stringify(checkedDocs));
      } catch {
        // ignore
      }
    })();
  }, [checkedDocs, measure.id]);

  const docs = useMemo(() => measure.documents ?? [], [measure.documents]);
  const where = useMemo(() => measure.whereToApply ?? [], [measure.whereToApply]);

  const toggleDoc = (name: string) => {
    setCheckedDocs((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const openUrl = async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <Screen title={measure.title}>
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: stickyCtaHeight + spacing.lg },
          ]}
        >
          <View style={styles.tabs}>
            {(["about", "docs", "where"] as TabKey[]).map((k) => (
              <Pressable
                key={k}
                onPress={() => setTab(k)}
                style={[styles.tab, tab === k && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === k && styles.tabTextActive,
                  ]}
                >
                  {tabLabel(k)}
                </Text>
              </Pressable>
            ))}
          </View>

          {tab === "about" && (
            <>
              <Card style={styles.card}>
                <Text style={styles.h2}>Что вы получаете</Text>
                <Text style={styles.p}>{measure.whatYouGet}</Text>

                {measure.steps?.length ? (
                  <>
                    <Text style={[styles.h2, { marginTop: spacing.md }]}>
                      Как оформить
                    </Text>
                    {measure.steps.map((s, idx) => (
                      <Text key={idx} style={styles.li}>
                        {idx + 1}. {s}
                      </Text>
                    ))}
                  </>
                ) : null}
              </Card>

              {measure.sources?.length ? (
                <Card style={styles.card}>
                  <Text style={styles.h2}>Официальные источники</Text>
                  {measure.sources.map((s, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => s.url && openUrl(s.url)}
                      style={styles.linkRow}
                    >
                      <Text style={styles.linkTitle}>{s.title}</Text>
                      {s.url ? (
                        <Text numberOfLines={1} style={styles.linkUrl}>
                          {s.url}
                        </Text>
                      ) : null}
                    </Pressable>
                  ))}
                </Card>
              ) : null}
            </>
          )}

          {tab === "docs" && (
            <Card style={styles.card}>
              <Text style={styles.h2}>Подготовьте документы</Text>
              {docs.length ? (
                docs.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => toggleDoc(d)}
                    style={styles.docRow}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        checkedDocs[d] && styles.checkboxChecked,
                      ]}
                    />
                    <Text style={styles.docText}>{d}</Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.p}>
                  В описании меры нет списка документов. Проверьте официальный источник.
                </Text>
              )}
            </Card>
          )}

          {tab === "where" && (
            <Card style={styles.card}>
              <Text style={styles.h2}>Где получить</Text>
              {where.length ? (
                where.map((w, idx) => (
                  <Text key={idx} style={styles.li}>
                    • {w}
                  </Text>
                ))
              ) : (
                <Text style={styles.p}>
                  В описании меры не указано, где оформить. Обычно это Госуслуги или МФЦ.
                </Text>
              )}

              {primaryUrl ? (
                <Pressable onPress={() => openUrl(primaryUrl)} style={styles.bigLink}>
                  <Text style={styles.bigLinkText}>Открыть официальный сайт</Text>
                </Pressable>
              ) : null}
            </Card>
          )}
        </ScrollView>

        {/* Sticky CTA */}
        {primaryUrl ? (
          <View
            style={[
              styles.sticky,
              { paddingBottom: insets.bottom ? insets.bottom : spacing.sm },
            ]}
          >
            <Button
              title={ctaLabel(primaryUrl)}
              onPress={() => openUrl(primaryUrl)}
            />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
  },
  tabs: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.small,
    color: colors.text,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "white",
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  h2: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  p: {
    ...typography.body,
    color: colors.text,
  },
  li: {
    ...typography.body,
    color: colors.text,
    marginBottom: 6,
  },
  linkRow: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  linkTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  linkUrl: {
    ...typography.small,
    color: colors.muted,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  docText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  bigLink: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  bigLinkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "700",
  },
  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
