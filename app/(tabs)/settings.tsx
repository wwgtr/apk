import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ActionRow, BackButton, MetaPill, ScreenHeading, SectionTitle, sirajColors } from "@/components/siraj-ui";
import { ScreenContainer } from "@/components/screen-container";
import { calendar, heritageEntries } from "@/lib/siraj-data";

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />
        <ScreenHeading eyebrow="محلي · بلا حساب · بلا ذكاء اصطناعي" title="حول البيانات" body="سراج الولاية قارئ محلي للتراث والتقويم. تبقى المفضلة على جهازك." />
        <View style={styles.statRow}><View style={styles.statCard}><Text style={styles.statValue}>{heritageEntries.length}</Text><Text style={styles.statLabel}>مادة تراثية</Text></View><View style={styles.statCard}><Text style={styles.statValue}>354</Text><Text style={styles.statLabel}>يومًا في 1448هـ</Text></View></View>
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
  transparencyCard: { alignItems: "flex-start", backgroundColor: "#E3F0EC", borderRadius: 19, flexDirection: "row-reverse", gap: 11, padding: 15 }, transparencyText: { color: "#315A52", flex: 1, fontSize: 13, lineHeight: 22, textAlign: "right", writingDirection: "rtl" },
  calendarCard: { alignItems: "flex-end", backgroundColor: "#F5EBD9", borderRadius: 19, gap: 7, padding: 15 }, calendarTitle: { color: "#5B481F", fontSize: 14, fontWeight: "800", lineHeight: 22, textAlign: "right", writingDirection: "rtl" }, calendarText: { color: "#725F35", fontSize: 12, lineHeight: 19, textAlign: "right", writingDirection: "rtl" }, rows: { gap: 8 },
});
