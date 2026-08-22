import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";

import { EmptyState, EntryCard, ScreenHeading, sirajColors } from "@/components/siraj-ui";
import { ScreenContainer } from "@/components/screen-container";
import { heritageEntries } from "@/lib/siraj-data";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim();
    if (normalized.length < 2) return [];
    return heritageEntries.filter((entry) => `${entry.title} ${entry.text} ${entry.speaker} ${entry.tags.join(" ")}`.includes(normalized)).slice(0, 60);
  }, [query]);

  return <ScreenContainer><FlatList data={results} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} renderItem={({ item }) => <EntryCard entry={item} onPress={() => router.push(`/reader/${item.id}` as never)} />} ListHeaderComponent={<View><ScreenHeading eyebrow="بحث محلي في 537 مادة" title="ابحث في التراث" body="اكتب كلمة من عنوان أو نص أو اسم القائل." /><View style={styles.searchBox}><MaterialIcons name="search" size={22} color={sirajColors.jade} /><TextInput value={query} onChangeText={setQuery} placeholder="مثال: الصبر، الحسين، الزيارة" placeholderTextColor="#8B948E" returnKeyType="search" style={styles.input} textAlign="right" /></View>{query.trim().length >= 2 ? null : <EmptyState icon="manage-search" title="ابدأ بكلمتين" body="تعمل المطابقة داخل البيانات المحفوظة على جهازك." />}</View>} ListEmptyComponent={query.trim().length >= 2 ? <EmptyState icon="search-off" title="لا توجد نتائج" body="جرّب كلمة أبسط أو اسمًا آخر." /> : null} /></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { backgroundColor: sirajColors.paper, flexGrow: 1, paddingBottom: 30, paddingHorizontal: 18, paddingTop: 16 },
  searchBox: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: sirajColors.mist, borderRadius: 17, borderWidth: 1, flexDirection: "row-reverse", gap: 8, minHeight: 53, paddingHorizontal: 13 },
  input: { color: sirajColors.ink, flex: 1, fontSize: 15, writingDirection: "rtl" },
});
