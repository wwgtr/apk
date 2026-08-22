import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ActionRow, BackButton, MetaPill, ScreenHeading, SectionTitle, sirajColors } from "@/components/siraj-ui";
import { ScreenContainer } from "@/components/screen-container";
import { calendar, heritageEntries } from "@/lib/siraj-data";
import { defaultReaderSettings, getReaderSettings, ReaderSettings, saveReaderSettings } from "@/lib/siraj-reading-settings";

export default function SettingsScreen() {
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(defaultReaderSettings);
  useEffect(() => { getReaderSettings().then(setReaderSettings); }, []);
  const updateReader = (partial: Partial<ReaderSettings>) => { const next = { ...readerSettings, ...partial }; setReaderSettings(next); saveReaderSettings(next).catch(() => undefined); };
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />
        <ScreenHeading eyebrow="محلي · بلا حساب · بلا ذكاء اصطناعي" title="حول البيانات" body="سراج الولاية قارئ محلي للتراث والتقويم. تبقى المفضلة على جهازك." />
        <View style={styles.statRow}><View style={styles.statCard}><Text style={styles.statValue}>{heritageEntries.length}</Text><Text style={styles.statLabel}>مادة تراثية</Text></View><View style={styles.statCard}><Text style={styles.statValue}>354</Text><Text style={styles.statLabel}>يومًا في 1448هـ</Text></View></View>
        <SectionTitle title="تفضيلات القراءة" />
        <View style={styles.readerCard}><Text style={styles.readerTitle}>حجم المتن</Text><View style={styles.sizeRow}>{[20, 23, 27].map((size) => <Pressable key={size} onPress={() => updateReader({ textSize: size })} style={({ pressed }) => [styles.sizeChip, readerSettings.textSize === size && styles.sizeChipActive, pressed && styles.pressed]}><Text style={[styles.sizeChipText, readerSettings.textSize === size && styles.sizeChipTextActive]}>{size === 20 ? "مريح" : size === 23 ? "كبير" : "كبير جدًا"}</Text></Pressable>)}</View><View style={styles.settingRow}><Text style={styles.settingLabel}>خط المتن التقليدي</Text><Switch value={readerSettings.fontStyle === "naskh"} onValueChange={(value) => updateReader({ fontStyle: value ? "naskh" : "system" })} trackColor={{ false: "#D9D3C6", true: "#91B8AE" }} thumbColor="#FFFFFF" /></View><View style={styles.settingRow}><Text style={styles.settingLabel}>إبقاء الشاشة مضيئة أثناء القراءة</Text><Switch value={readerSettings.keepScreenAwake} onValueChange={(value) => updateReader({ keepScreenAwake: value })} trackColor={{ false: "#D9D3C6", true: "#91B8AE" }} thumbColor="#FFFFFF" /></View><View style={styles.settingRow}><Text style={styles.settingLabel}>تقليل الحركة والانتقالات</Text><Switch value={readerSettings.reduceMotion} onValueChange={(value) => updateReader({ reduceMotion: value })} trackColor={{ false: "#D9D3C6", true: "#91B8AE" }} thumbColor="#FFFFFF" /></View></View>
        <SectionTitle title="شفافية المصدر" />
        <View style={styles.transparencyCard}><MaterialIcons name="fact-check" size={24} color={sirajColors.jade} /><Text style={styles.transparencyText}>تظهر كل مادة باسم الكتاب والموضع وحالة النسبة. لا يعني ورود المادة في مصدر إمامي أن التطبيق صحح سندها أو أثبتها تاريخيًا.</Text></View>
        <SectionTitle title="التقويم" />
        <View style={styles.calendarCard}><Text style={styles.calendarTitle}>{calendar.title}</Text><Text style={styles.calendarText}>المصدر: {calendar.source}</Text><MetaPill label="توقعات الرؤية ليست ثبوتًا شرعيًا" tone="gold" /></View>
        <SectionTitle title="معلومات التطبيق" />
        <View style={styles.rows}><ActionRow icon="auto-stories" label="خارطة الميزات الخمسين" onPress={() => {}} trailing={<MetaPill label="قريبًا" tone="muted" />} /><ActionRow icon="privacy-tip" label="الخصوصية المحلية" onPress={() => {}} /></View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: sirajColors.paper, gap: 10, paddingBottom: 34, paddingHorizontal: 18, paddingTop: 12 },
  statRow: { flexDirection: "row-reverse", gap: 10 }, statCard: { alignItems: "flex-end", backgroundColor: "#FFFFFF", borderColor: sirajColors.mist, borderRadius: 18, borderWidth: 1, flex: 1, padding: 15 }, statValue: { color: sirajColors.jade, fontSize: 24, fontWeight: "900" }, statLabel: { color: sirajColors.muted, fontSize: 11, marginTop: 4, textAlign: "right", writingDirection: "rtl" },
  readerCard: { backgroundColor: "#FFFFFF", borderColor: sirajColors.mist, borderRadius: 19, borderWidth: 1, gap: 12, padding: 15 }, readerTitle: { color: sirajColors.ink, fontSize: 14, fontWeight: "900", textAlign: "right", writingDirection: "rtl" }, sizeRow: { flexDirection: "row-reverse", gap: 8 }, sizeChip: { backgroundColor: "#F2EEE5", borderRadius: 12, flex: 1, paddingVertical: 10 }, sizeChipActive: { backgroundColor: sirajColors.jade }, sizeChipText: { color: sirajColors.ink, fontSize: 12, fontWeight: "800", textAlign: "center", writingDirection: "rtl" }, sizeChipTextActive: { color: "#FFFFFF" }, settingRow: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" }, settingLabel: { color: sirajColors.ink, flex: 1, fontSize: 13, lineHeight: 20, textAlign: "right", writingDirection: "rtl" }, pressed: { opacity: 0.72 },
  transparencyCard: { alignItems: "flex-start", backgroundColor: "#E3F0EC", borderRadius: 19, flexDirection: "row-reverse", gap: 11, padding: 15 }, transparencyText: { color: "#315A52", flex: 1, fontSize: 13, lineHeight: 22, textAlign: "right", writingDirection: "rtl" },
  calendarCard: { alignItems: "flex-end", backgroundColor: "#F5EBD9", borderRadius: 19, gap: 7, padding: 15 }, calendarTitle: { color: "#5B481F", fontSize: 14, fontWeight: "800", lineHeight: 22, textAlign: "right", writingDirection: "rtl" }, calendarText: { color: "#725F35", fontSize: 12, lineHeight: 19, textAlign: "right", writingDirection: "rtl" }, rows: { gap: 8 },
});
