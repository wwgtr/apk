import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { EmptyState, EntryCard, ScreenHeading, sirajColors } from "@/components/siraj-ui";
import { ScreenContainer } from "@/components/screen-container";
import { HeritageEntry, heritageEntries } from "@/lib/siraj-data";
import { getSavedEntryIds } from "@/lib/siraj-store";

export default function SavedScreen() {
  const [saved, setSaved] = useState<HeritageEntry[]>([]);
  useFocusEffect(useCallback(() => { getSavedEntryIds().then((ids) => setSaved(ids.map((id) => heritageEntries.find((entry) => entry.id === id)).filter((entry): entry is HeritageEntry => Boolean(entry)))); }, []));
  return <ScreenContainer><FlatList data={saved} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} renderItem={({ item }) => <EntryCard entry={item} onPress={() => router.push(`/reader/${item.id}` as never)} />} ListHeaderComponent={<View><ScreenHeading eyebrow="تنظيم محلي على جهازك" title="المفضلة" body="احفظ النصوص التي تريد الرجوع إليها سريعًا." /></View>} ListEmptyComponent={<EmptyState icon="bookmark-border" title="لم تحفظ شيئًا بعد" body="من أي مادة اضغط زر الحفظ لتظهر هنا." />} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { backgroundColor: sirajColors.paper, flexGrow: 1, paddingBottom: 30, paddingHorizontal: 18, paddingTop: 16 } });
