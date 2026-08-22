import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenHeading, sirajColors } from "@/components/siraj-ui";
import { ScreenContainer } from "@/components/screen-container";
import { CalendarDay, calendar } from "@/lib/siraj-data";

const weekdays = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];
type CalendarCell = { blank: true; id: string } | (CalendarDay & { blank: false; id: string });

export default function CalendarScreen() {
  const [monthIndex, setMonthIndex] = useState(0);
  const month = calendar.months[monthIndex];
  const leadingBlankDays = Math.max(0, weekdays.indexOf(month.days[0]?.day_of_week?.charAt(0) ?? "") + 1);
  const cells: CalendarCell[] = [...Array.from({ length: leadingBlankDays }, (_, index) => ({ blank: true as const, id: `blank-${index}` })), ...month.days.map((day) => ({ ...day, blank: false as const, id: day.iso_date }))];

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <ScreenHeading eyebrow="التقويم السنوي الشامل" title="1448 هـ" body="البيانات وفق أفق النجف الأشرف، مع التنبيه أن توقعات الهلال ليست ثبوتًا شرعيًا." />
        <View style={styles.monthSwitcher}>
          <Pressable onPress={() => setMonthIndex((value) => (value + 1) % calendar.months.length)} style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><MaterialIcons name="chevron-left" size={26} color={sirajColors.jade} /></Pressable>
          <View style={styles.monthTitle}><Text style={styles.monthName}>{month.name}</Text><Text style={styles.monthSub}>{month.gregorian_period}</Text></View>
          <Pressable onPress={() => setMonthIndex((value) => (value - 1 + calendar.months.length) % calendar.months.length)} style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}><MaterialIcons name="chevron-right" size={26} color={sirajColors.jade} /></Pressable>
        </View>
        <View style={styles.weekHeader}>{weekdays.map((day) => <Text key={day} style={styles.weekDay}>{day}</Text>)}</View>
        <FlatList data={cells} numColumns={7} key={`month-${month.month_order}`} keyExtractor={(item) => item.id} contentContainerStyle={styles.grid} renderItem={({ item }) => {
          if (item.blank) return <View style={styles.dayCell} />;
          const hasEvent = item.events.length > 0;
          return <Pressable onPress={() => router.push(`/calendar/${item.iso_date}` as never)} style={({ pressed }) => [styles.dayCell, hasEvent && styles.eventCell, pressed && styles.pressed]}><Text style={[styles.dayText, hasEvent && styles.eventDayText]}>{item.hijri_day}</Text><View style={[styles.eventDot, hasEvent && styles.eventDotActive]} /></Pressable>;
        }} />
        <View style={styles.note}><MaterialIcons name="info-outline" size={18} color={sirajColors.gold} /><Text style={styles.noteText} numberOfLines={3}>{month.crescent_forecast?.primary_night?.visibility_expectation ?? "تفاصيل الرؤية مدرجة في ملف التقويم."}</Text></View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: sirajColors.paper, flex: 1, paddingBottom: 20, paddingHorizontal: 18, paddingTop: 16 },
  monthSwitcher: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: sirajColors.mist, borderRadius: 20, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", marginBottom: 16, minHeight: 75, paddingHorizontal: 9 },
  arrow: { alignItems: "center", height: 44, justifyContent: "center", width: 44 },
  monthTitle: { alignItems: "center" }, monthName: { color: sirajColors.ink, fontSize: 18, fontWeight: "900", writingDirection: "rtl" }, monthSub: { color: sirajColors.muted, fontSize: 11, marginTop: 2, writingDirection: "rtl" },
  weekHeader: { flexDirection: "row", marginBottom: 6 }, weekDay: { color: sirajColors.muted, flex: 1, fontSize: 11, fontWeight: "800", textAlign: "center" },
  grid: { borderColor: sirajColors.mist, borderLeftWidth: 1, borderTopWidth: 1 }, dayCell: { alignItems: "center", backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderColor: sirajColors.mist, borderRightWidth: 1, height: 52, justifyContent: "center", width: "14.2857%" },
  eventCell: { backgroundColor: "#F3E8D1" }, dayText: { color: sirajColors.ink, fontSize: 14, fontWeight: "700" }, eventDayText: { color: "#74531C", fontWeight: "900" },
  eventDot: { backgroundColor: "transparent", borderRadius: 99, height: 4, marginTop: 3, width: 4 }, eventDotActive: { backgroundColor: sirajColors.gold },
  note: { alignItems: "flex-start", backgroundColor: "#F5EFE2", borderRadius: 16, flexDirection: "row-reverse", gap: 9, marginTop: 16, padding: 13 }, noteText: { color: "#685A40", flex: 1, fontSize: 12, lineHeight: 19, textAlign: "right", writingDirection: "rtl" },
  pressed: { opacity: 0.7 },
});
