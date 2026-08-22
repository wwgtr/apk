import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

import { BackButton, EmptyState, ScreenHeading, SectionTitle, sirajColors } from "@/components/siraj-ui";
import { ScreenContainer } from "@/components/screen-container";
import { getCalendarDay } from "@/lib/siraj-data";

export default function CalendarDetailScreen() {
  const { isoDate } = useLocalSearchParams<{ isoDate: string }>();
  const day = getCalendarDay(isoDate);
  if (!day) return <ScreenContainer><View style={styles.notFound}><EmptyState icon="event-busy" title="اليوم غير متاح" body="لم نجد هذا اليوم في تقويم 1448هـ المحمل." /><BackButton onPress={() => router.back()} /></View></ScreenContainer>;
  return <ScreenContainer><ScrollView contentContainerStyle={styles.content}><View style={styles.nav}><BackButton onPress={() => router.back()} /><MaterialIcons name="event-note" size={23} color={sirajColors.gold} /></View><ScreenHeading eyebrow={day.gregorian_date} title={`${day.hijri_day} ${day.monthName}`} body={day.day_of_week} /><View style={styles.eventsCard}><SectionTitle title="أحداث اليوم" />{day.events.length ? day.events.map((event, index) => <View key={`${event}-${index}`} style={styles.eventRow}><View style={styles.dot} /><Text style={styles.eventText}>{event}</Text></View>) : <Text style={styles.emptyText}>لا توجد أحداث مسجلة لهذا اليوم في ملف التقويم.</Text>}</View><Pressable onPress={() => router.push("/library?section=works")} style={({ pressed }) => [styles.workButton, pressed && styles.pressed]}><Text style={styles.workButtonText}>استعرض الأعمال والزيارات</Text><MaterialIcons name="menu-book" size={20} color="#FFFFFF" /></Pressable><Text style={styles.disclaimer}>المصدر: تقويم 1448هـ المرفق، وفق أفق النجف الأشرف. توقعات الرؤية الفلكية ليست ثبوتًا شرعيًا.</Text></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { backgroundColor: sirajColors.paper, flexGrow: 1, gap: 14, paddingBottom: 35, paddingHorizontal: 18, paddingTop: 12 }, nav: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  eventsCard: { backgroundColor: "#FFFFFF", borderColor: sirajColors.mist, borderRadius: 22, borderWidth: 1, padding: 16 }, eventRow: { alignItems: "flex-start", flexDirection: "row-reverse", gap: 10, paddingVertical: 10 }, dot: { backgroundColor: sirajColors.gold, borderRadius: 99, height: 8, marginTop: 7, width: 8 }, eventText: { color: sirajColors.ink, flex: 1, fontSize: 15, lineHeight: 24, textAlign: "right", writingDirection: "rtl" }, emptyText: { color: sirajColors.muted, fontSize: 14, lineHeight: 22, textAlign: "right", writingDirection: "rtl" },
  workButton: { alignItems: "center", backgroundColor: sirajColors.jade, borderRadius: 17, flexDirection: "row-reverse", gap: 9, justifyContent: "center", minHeight: 54 }, workButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", writingDirection: "rtl" }, disclaimer: { color: sirajColors.muted, fontSize: 11, lineHeight: 18, textAlign: "right", writingDirection: "rtl" }, notFound: { backgroundColor: sirajColors.paper, flex: 1, paddingHorizontal: 18, paddingTop: 15 }, pressed: { opacity: 0.72 },
});
