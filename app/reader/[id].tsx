import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";

import { BackButton, MetaPill, EmptyState, sirajColors } from "@/components/siraj-ui";
import { ScreenContainer } from "@/components/screen-container";
import { displayAttribution, getEntryById, getSectionMeta } from "@/lib/siraj-data";
import { getSavedEntryIds, toggleSavedEntry } from "@/lib/siraj-store";
import { defaultReaderSettings, getReaderSettings, ReaderSettings, saveReaderSettings } from "@/lib/siraj-reading-settings";

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = getEntryById(id);
  const [saved, setSaved] = useState(false);
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(defaultReaderSettings);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => { if (entry) getSavedEntryIds().then((ids) => setSaved(ids.includes(entry.id))); }, [entry]);
  useEffect(() => { getReaderSettings().then(setReaderSettings); }, []);
  useEffect(() => {
    if (!readerSettings.keepScreenAwake) return;
    activateKeepAwakeAsync("siraj-reader").catch(() => undefined);
    return () => { deactivateKeepAwake("siraj-reader").catch(() => undefined); };
  }, [readerSettings.keepScreenAwake]);
  if (!entry) return <ScreenContainer><View style={styles.notFound}><EmptyState icon="error-outline" title="المادة غير متاحة" body="قد يكون الرابط غير صحيح أو أن بيانات التطبيق تغيّرت." /><BackButton onPress={() => router.back()} /></View></ScreenContainer>;
  const section = getSectionMeta(entry.section);
  const toggle = async () => { const next = await toggleSavedEntry(entry.id); setSaved(next.includes(entry.id)); };
  const showSource = () => Alert.alert("بيانات المصدر", `${entry.sourceName}\n${entry.authorOrCompiler ? `${entry.authorOrCompiler}\n` : ""}${entry.sourceLocator}\n\n${entry.verificationNote || "لا توجد ملاحظة إضافية."}`);
  const updateReader = (partial: Partial<ReaderSettings>) => {
    const next = { ...readerSettings, ...partial };
    setReaderSettings(next);
    saveReaderSettings(next).catch(() => undefined);
  };
  const stepSize = (amount: number) => updateReader({ textSize: Math.max(19, Math.min(30, readerSettings.textSize + amount)) });

  return <ScreenContainer><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} scrollEventThrottle={16} onScroll={({ nativeEvent }) => { const total = nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height; setProgress(total > 0 ? Math.min(100, Math.round((nativeEvent.contentOffset.y / total) * 100)) : 0); }}>
    <View style={styles.nav}><BackButton onPress={() => router.back()} /><Pressable onPress={toggle} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><MaterialIcons name={saved ? "bookmark" : "bookmark-border"} size={22} color={saved ? sirajColors.gold : sirajColors.jade} /></Pressable></View>
    <View style={styles.heading}><MetaPill label={section.title} tone="gold" /><Text style={styles.title}>{entry.title}</Text><Text style={styles.speaker}>{entry.speaker}</Text></View>
    <View style={styles.readerControls}><Pressable onPress={() => stepSize(-1)} style={({ pressed }) => [styles.controlButton, pressed && styles.pressed]}><Text style={styles.controlText}>A−</Text></Pressable><Text style={styles.progressLabel}>{progress}% · وضع القراءة</Text><Pressable onPress={() => stepSize(1)} style={({ pressed }) => [styles.controlButton, pressed && styles.pressed]}><Text style={styles.controlText}>A+</Text></Pressable></View>
    <View style={styles.textCard}><Text style={[styles.readerText, { fontFamily: readerSettings.fontStyle === "naskh" ? "serif" : undefined, fontSize: readerSettings.textSize, lineHeight: Math.round(readerSettings.textSize * readerSettings.lineHeightMultiplier) }]}>{entry.text}</Text></View>
    <View style={styles.metaCard}><View style={styles.metaRow}><Text style={styles.metaValue}>{entry.sourceName}</Text><Text style={styles.metaLabel}>الكتاب</Text></View><View style={styles.divider} /><View style={styles.metaRow}><Text style={styles.metaValue}>{entry.sourceLocator}</Text><Text style={styles.metaLabel}>الموضع</Text></View><View style={styles.divider} /><View style={styles.metaRow}><MetaPill label={displayAttribution(entry.attributionStatus)} tone="jade" /><Text style={styles.metaLabel}>الحالة</Text></View></View>
    <Pressable onPress={showSource} style={({ pressed }) => [styles.sourceButton, pressed && styles.pressed]}><Text style={styles.sourceButtonText}>عرض ملاحظة المصدر</Text><MaterialIcons name="fact-check" size={19} color={sirajColors.jade} /></Pressable>
    {entry.tags.length ? <View style={styles.tags}>{entry.tags.map((tag) => <MetaPill key={tag} label={tag} tone="muted" />)}</View> : null}
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { backgroundColor: sirajColors.paper, gap: 14, paddingBottom: 35, paddingHorizontal: 18, paddingTop: 12 }, nav: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  saveButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: sirajColors.mist, borderRadius: 14, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  heading: { alignItems: "flex-end", gap: 8 }, title: { color: sirajColors.ink, fontSize: 26, fontWeight: "900", lineHeight: 38, textAlign: "right", writingDirection: "rtl" }, speaker: { color: sirajColors.muted, fontSize: 14, textAlign: "right", writingDirection: "rtl" },
  progressTrack: { backgroundColor: "#E8E2D6", height: 3 }, progressFill: { backgroundColor: sirajColors.gold, height: 3 }, readerControls: { alignItems: "center", backgroundColor: "#F2EEE5", borderRadius: 16, flexDirection: "row", justifyContent: "space-between", padding: 8 }, controlButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 10, justifyContent: "center", minHeight: 34, minWidth: 43 }, controlText: { color: sirajColors.jade, fontSize: 14, fontWeight: "900" }, progressLabel: { color: sirajColors.muted, fontSize: 12, fontWeight: "700", writingDirection: "rtl" },
  textCard: { backgroundColor: "#FFFEFB", borderColor: sirajColors.mist, borderRadius: 24, borderWidth: 1, padding: 20 }, readerText: { color: "#243A35", textAlign: "right", writingDirection: "rtl" },
  metaCard: { backgroundColor: "#F2EEE5", borderRadius: 18, padding: 14 }, metaRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 }, metaLabel: { color: sirajColors.muted, fontSize: 12, fontWeight: "800", textAlign: "right", writingDirection: "rtl" }, metaValue: { color: sirajColors.ink, flex: 1, fontSize: 12, lineHeight: 19, textAlign: "right", writingDirection: "rtl" }, divider: { backgroundColor: "#DED5C5", height: 1, marginVertical: 10 },
  sourceButton: { alignItems: "center", backgroundColor: "#E3F0EC", borderRadius: 15, flexDirection: "row-reverse", gap: 8, justifyContent: "center", minHeight: 49 }, sourceButtonText: { color: sirajColors.jade, fontSize: 14, fontWeight: "800", writingDirection: "rtl" }, tags: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 6, justifyContent: "flex-start" },
  notFound: { backgroundColor: sirajColors.paper, flex: 1, paddingHorizontal: 18, paddingTop: 15 }, pressed: { opacity: 0.72 },
});
