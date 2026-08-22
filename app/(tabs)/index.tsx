import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ActionRow, EntryCard, MetaPill, ScreenHeading, SectionTitle, sirajColors } from "@/components/siraj-ui";
import { ScreenContainer } from "@/components/screen-container";
import { calendar, calendarDays, heritageEntries, heritageSections } from "@/lib/siraj-data";

export default function HomeScreen() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const today = calendarDays.find((day) => day.iso_date === todayIso) ?? calendarDays.find((day) => day.events.length > 0) ?? calendarDays[0];
  const highlight = heritageEntries.find((entry) => entry.isOriginalQuote && entry.text.length > 30) ?? heritageEntries[0];
  const nextEvent = calendarDays.find((day) => day.iso_date >= todayIso && day.events.length > 0) ?? today;

  return (
    <ScreenContainer className="" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <Pressable onPress={() => router.push("/(tabs)/settings" as never)} style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}><MaterialIcons name="tune" size={20} color={sirajColors.jade} /></Pressable>
          <View style={styles.brandMark}><MaterialIcons name="wb-sunny" size={20} color={sirajColors.gold} /></View>
          <View style={styles.brandText}><Text style={styles.brandTitle}>سراج الولاية</Text><Text style={styles.brandCaption}>مكتبة وتراث وتـقويم</Text></View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}><MetaPill label="1448 هـ · أفق النجف" tone="gold" /><MaterialIcons name="calendar-month" size={28} color="#F9E2B0" /></View>
          <Text style={styles.heroDay}>{today?.hijri_day ?? "—"}</Text>
          <Text style={styles.heroMonth}>{today?.monthName ?? calendar.months[0].name}</Text>
          <Text style={styles.heroDate}>{today?.day_of_week} · {today?.gregorian_date}</Text>
          <Text style={styles.heroEvent} numberOfLines={2}>{today?.events[0] ?? "يوم هادئ في التقويم"}</Text>
        </View>

        <SectionTitle title="نافذتك اليوم" />
        <View style={styles.quickGrid}>
          <ActionRow icon="event-note" label="تفاصيل اليوم" onPress={() => today && router.push(`/calendar/${today.iso_date}` as never)} style={styles.quickRow} />
          <ActionRow icon="menu-book" label="المكتبة" onPress={() => router.push("/(tabs)/library" as never)} style={styles.quickRow} />
        </View>

        <SectionTitle title="الأقرب في التقويم" action="عرض التقويم" onAction={() => router.push("/(tabs)/calendar" as never)} />
        <View style={styles.nextCard}>
          <View style={styles.nextDate}><Text style={styles.nextDay}>{nextEvent?.hijri_day}</Text><Text style={styles.nextMonth}>{nextEvent?.monthName}</Text></View>
          <View style={styles.nextBody}><Text style={styles.nextTitle} numberOfLines={2}>{nextEvent?.events[0] ?? "مناسبة قادمة"}</Text><Text style={styles.nextSub}>{nextEvent?.gregorian_date}</Text></View>
        </View>

        <SectionTitle title="من المكتبة" action="كل الأقسام" onAction={() => router.push("/(tabs)/library" as never)} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionScroller}>
          {heritageSections.map((section) => (
            <Pressable key={section.key} onPress={() => router.push(`/(tabs)/library?section=${section.key}` as never)} style={({ pressed }) => [styles.sectionCard, pressed && styles.pressed]}>
              <View style={[styles.sectionIcon, { backgroundColor: section.color }]}><MaterialIcons name={section.icon as never} size={22} color="#FFFFFF" /></View>
              <Text style={styles.sectionName}>{section.title}</Text>
              <Text style={styles.sectionCount}>{section.count} مادة</Text>
            </Pressable>
          ))}
        </ScrollView>

        {highlight ? <><SectionTitle title="نص مختار" /><EntryCard entry={highlight} onPress={() => router.push(`/reader/${highlight.id}` as never)} /></> : null}
        <Text style={styles.disclaimer}>يعرض التطبيق بيانات محلية مصدرية. لا يعني ورود المادة في مصدرٍ ما تصحيح سندها؛ راجع حالة النسبة والموضع.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: sirajColors.paper, gap: 8, paddingBottom: 32, paddingHorizontal: 18, paddingTop: 16 },
  pressed: { opacity: 0.72 },
  brandRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  settingsButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: sirajColors.mist, borderRadius: 14, borderWidth: 1, height: 40, justifyContent: "center", width: 40 },
  brandMark: { alignItems: "center", backgroundColor: sirajColors.ink, borderRadius: 16, height: 40, justifyContent: "center", marginLeft: 10, width: 40 },
  brandText: { alignItems: "flex-end" },
  brandTitle: { color: sirajColors.ink, fontSize: 20, fontWeight: "900", writingDirection: "rtl" },
  brandCaption: { color: sirajColors.muted, fontSize: 11, marginTop: 1, writingDirection: "rtl" },
  heroCard: { backgroundColor: sirajColors.ink, borderRadius: 28, gap: 4, overflow: "hidden", padding: 22 },
  heroTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  heroDay: { color: "#FFFFFF", fontSize: 54, fontWeight: "900", lineHeight: 62, textAlign: "right" },
  heroMonth: { color: "#F9E2B0", fontSize: 19, fontWeight: "800", textAlign: "right", writingDirection: "rtl" },
  heroDate: { color: "#B9D0C9", fontSize: 12, marginTop: 3, textAlign: "right", writingDirection: "rtl" },
  heroEvent: { color: "#FFFFFF", fontSize: 14, lineHeight: 22, marginTop: 12, textAlign: "right", writingDirection: "rtl" },
  quickGrid: { gap: 8 }, quickRow: { minHeight: 56 },
  nextCard: { alignItems: "center", backgroundColor: "#F0E6D0", borderRadius: 20, flexDirection: "row", gap: 14, padding: 14 },
  nextDate: { alignItems: "center", backgroundColor: sirajColors.gold, borderRadius: 15, justifyContent: "center", minHeight: 61, paddingHorizontal: 12 },
  nextDay: { color: "#FFFFFF", fontSize: 23, fontWeight: "900" }, nextMonth: { color: "#FFF8E9", fontSize: 10, fontWeight: "700", textAlign: "center", writingDirection: "rtl" },
  nextBody: { flex: 1 }, nextTitle: { color: sirajColors.ink, fontSize: 14, fontWeight: "800", lineHeight: 21, textAlign: "right", writingDirection: "rtl" }, nextSub: { color: sirajColors.muted, fontSize: 11, marginTop: 4, textAlign: "right", writingDirection: "rtl" },
  sectionScroller: { flexDirection: "row-reverse", gap: 10, paddingBottom: 2 },
  sectionCard: { alignItems: "flex-end", backgroundColor: "#FFFFFF", borderColor: sirajColors.mist, borderRadius: 18, borderWidth: 1, gap: 6, minHeight: 122, padding: 13, width: 123 },
  sectionIcon: { alignItems: "center", borderRadius: 14, height: 40, justifyContent: "center", width: 40 },
  sectionName: { color: sirajColors.ink, fontSize: 14, fontWeight: "800", textAlign: "right", writingDirection: "rtl" }, sectionCount: { color: sirajColors.muted, fontSize: 11, textAlign: "right", writingDirection: "rtl" },
  disclaimer: { color: sirajColors.muted, fontSize: 11, lineHeight: 18, marginTop: 5, textAlign: "right", writingDirection: "rtl" },
});
