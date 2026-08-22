import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

import { BackButton, MetaPill, EmptyState, sirajColors } from "@/components/siraj-ui";
import { ScreenContainer } from "@/components/screen-container";
import { displayAttribution, getEntryById, getSectionMeta } from "@/lib/siraj-data";
import { getSavedEntryIds, toggleSavedEntry } from "@/lib/siraj-store";

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = getEntryById(id);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (entry) getSavedEntryIds().then((ids) => setSaved(ids.includes(entry.id))); }, [entry]);
  if (!entry) return <ScreenContainer><View style={styles.notFound}><EmptyState icon="error-outline" title="المادة غير متاحة" body="قد يكون الرابط غير صحيح أو أن بيانات التطبيق تغيّرت." /><BackButton onPress={() => router.back()} /></View></ScreenContainer>;
  const section = getSectionMeta(entry.section);
  const toggle = async () => { const next = await toggleSavedEntry(entry.id); setSaved(next.includes(entry.id)); };
  const showSource = () => Alert.alert("بيانات المصدر", `${entry.sourceName}\n${entry.authorOrCompiler ? `${entry.authorOrCompiler}\n` : ""}${entry.sourceLocator}\n\n${entry.verificationNote || "لا توجد ملاحظة إضافية."}`);

  return <ScreenContainer><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.nav}><BackButton onPress={() => router.back()} /><Pressable onPress={toggle} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><MaterialIcons name={saved ? "bookmark" : "bookmark-border"} size={22} color={saved ? sirajColors.gold : sirajColors.jade} /></Pressable></View>
    <View style={styles.heading}><MetaPill label={section.title} tone="gold" /><Text style={styles.title}>{entry.title}</Text><Text style={styles.speaker}>{entry.speaker}</Text></View>
    <View style={styles.textCard}><Text style={styles.readerText}>{entry.text}</Text></View>
    <View style={styles.metaCard}><View style={styles.metaRow}><Text style={styles.metaValue}>{entry.sourceName}</Text><Text style={styles.metaLabel}>الكتاب</Text></View><View style={styles.divider} /><View style={styles.metaRow}><Text style={styles.metaValue}>{entry.sourceLocator}</Text><Text style={styles.metaLabel}>الموضع</Text></View><View style={styles.divider} /><View style={styles.metaRow}><MetaPill label={displayAttribution(entry.attributionStatus)} tone="jade" /><Text style={styles.metaLabel}>الحالة</Text></View></View>
    <Pressable onPress={showSource} style={({ pressed }) => [styles.sourceButton, pressed && styles.pressed]}><Text style={styles.sourceButtonText}>عرض ملاحظة المصدر</Text><MaterialIcons name="fact-check" size={19} color={sirajColors.jade} /></Pressable>
    {entry.tags.length ? <View style={styles.tags}>{entry.tags.map((tag) => <MetaPill key={tag} label={tag} tone="muted" />)}</View> : null}
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { backgroundColor: sirajColors.paper, gap: 14, paddingBottom: 35, paddingHorizontal: 18, paddingTop: 12 }, nav: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  saveButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: sirajColors.mist, borderRadius: 14, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  heading: { alignItems: "flex-end", gap: 8 }, title: { color: sirajColors.ink, fontSize: 26, fontWeight: "900", lineHeight: 38, textAlign: "right", writingDirection: "rtl" }, speaker: { color: sirajColors.muted, fontSize: 14, textAlign: "right", writingDirection: "rtl" },
  textCard: { backgroundColor: "#FFFEFB", borderColor: sirajColors.mist, borderRadius: 24, borderWidth: 1, padding: 20 }, readerText: { color: "#243A35", fontSize: 18, lineHeight: 34, textAlign: "right", writingDirection: "rtl" },
  metaCard: { backgroundColor: "#F2EEE5", borderRadius: 18, padding: 14 }, metaRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 }, metaLabel: { color: sirajColors.muted, fontSize: 12, fontWeight: "800", textAlign: "right", writingDirection: "rtl" }, metaValue: { color: sirajColors.ink, flex: 1, fontSize: 12, lineHeight: 19, textAlign: "right", writingDirection: "rtl" }, divider: { backgroundColor: "#DED5C5", height: 1, marginVertical: 10 },
  sourceButton: { alignItems: "center", backgroundColor: "#E3F0EC", borderRadius: 15, flexDirection: "row-reverse", gap: 8, justifyContent: "center", minHeight: 49 }, sourceButtonText: { color: sirajColors.jade, fontSize: 14, fontWeight: "800", writingDirection: "rtl" }, tags: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 6, justifyContent: "flex-start" },
  notFound: { backgroundColor: sirajColors.paper, flex: 1, paddingHorizontal: 18, paddingTop: 15 }, pressed: { opacity: 0.72 },
});
