import { router, useLocalSearchParams } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EntryCard, ScreenHeading, sirajColors } from "@/components/siraj-ui";
import { HeritageSection, figureForEntry, heritageEntries, heritageFigures, heritageSections } from "@/lib/siraj-data";
import { ScreenContainer } from "@/components/screen-container";

export default function LibraryScreen() {
  const { section, figure } = useLocalSearchParams<{ section?: string; figure?: string }>();
  const current = heritageSections.find((item) => item.key === section) ?? heritageSections[0];
  const entries = heritageEntries.filter((entry) => entry.section === current.key && (!figure || figureForEntry(entry) === figure));

  return (
    <ScreenContainer>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View>
          <ScreenHeading eyebrow={`${heritageEntries.length} مادة محلية`} title="المكتبة" body="اختر القسم، ثم صفِّ النتائج باسم النبي أو الإمام، وافتح المادة لقراءة النص وبيانات مصدره." />
          <Pressable onPress={() => router.push("/archive" as never)} style={({ pressed }) => [styles.archiveLink, pressed && styles.pressed]}>
            <Text style={styles.archiveLinkTitle}>أرشيف المصادر الموسع</Text>
            <Text style={styles.archiveLinkText}>11,245 مقطعًا عربيًا مصنفًا مبدئيًا · تحميل جزء واحد عند الطلب</Text>
          </Pressable>
          <FlatList horizontal data={heritageSections} keyExtractor={(item) => item.key} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} renderItem={({ item }) => {
            const selected = item.key === current.key;
            return <Pressable onPress={() => router.setParams({ section: item.key })} style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.title} · {item.count}</Text></Pressable>;
          }} />
          <FlatList horizontal data={[{ key: "", label: "الكل" }, ...heritageFigures]} keyExtractor={(item) => item.key || "all"} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} renderItem={({ item }) => {
            const selected = (item.key || undefined) === figure;
            return <Pressable onPress={() => router.setParams({ figure: item.key || undefined })} style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.label}</Text></Pressable>;
          }} />
          <Text style={styles.listCaption}>{current.title} · {entries.length} مادة</Text>
        </View>}
        renderItem={({ item }) => <EntryCard entry={item} onPress={() => router.push(`/reader/${item.id}` as never)} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: sirajColors.paper, paddingBottom: 30, paddingHorizontal: 18, paddingTop: 16 },
  chips: { flexDirection: "row-reverse", gap: 8, paddingBottom: 12 },
  archiveLink: { backgroundColor: "#F1E8D5", borderWidth: 1, borderColor: "#E2D2AB", borderRadius: 16, padding: 13, marginBottom: 14 },
  archiveLinkTitle: { color: sirajColors.ink, fontSize: 14, fontWeight: "800", textAlign: "right", writingDirection: "rtl" },
  archiveLinkText: { color: sirajColors.muted, fontSize: 11, marginTop: 5, textAlign: "right", writingDirection: "rtl" },
  chip: { backgroundColor: "#ECE8DE", borderRadius: 99, minHeight: 36, paddingHorizontal: 13, paddingVertical: 9 },
  chipSelected: { backgroundColor: sirajColors.jade },
  chipText: { color: sirajColors.ink, fontSize: 12, fontWeight: "700", writingDirection: "rtl" }, chipTextSelected: { color: "#FFFFFF" },
  listCaption: { color: sirajColors.muted, fontSize: 12, marginBottom: 10, textAlign: "right", writingDirection: "rtl" },
  pressed: { opacity: 0.72 },
});
