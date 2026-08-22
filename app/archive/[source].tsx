import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeading, sirajColors } from "@/components/siraj-ui";
import { chunksForSource, loadArchiveChunk, type ArchiveEntry } from "@/lib/siraj-archive";

export default function ArchiveSourceScreen() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  const sourceName = source ?? "";
  const chunks = useMemo(() => chunksForSource(sourceName), [sourceName]);
  const [chunkIndex, setChunkIndex] = useState(0);
  const currentChunk = chunks[chunkIndex];
  const [entries, setEntries] = useState<ArchiveEntry[]>(() => currentChunk ? loadArchiveChunk(currentChunk.id) : []);

  useEffect(() => {
    setChunkIndex(0);
  }, [sourceName]);

  useEffect(() => {
    setEntries(currentChunk ? loadArchiveChunk(currentChunk.id) : []);
  }, [currentChunk?.id]);

  if (!currentChunk) {
    return <ScreenContainer><View style={styles.empty}><Text style={styles.emptyText}>لم يُعثر على هذا الكتاب في الأرشيف المحلي.</Text></View></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <ScreenHeading eyebrow={`${chunks.reduce((sum, item) => sum + item.count, 0).toLocaleString("ar-EG")} مقطعًا`} title={sourceName} body="اختر الجزء ثم افتح المادة. تظهر المرشحات الموضوعية داخل النص بوصفها تنظيمًا أوليًا للمصدر." />
            <FlatList
              horizontal
              data={chunks}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chips}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => <Pressable onPress={() => setChunkIndex(index)} style={({ pressed }) => [styles.chip, index === chunkIndex && styles.chipSelected, pressed && styles.pressed]}><Text style={[styles.chipText, index === chunkIndex && styles.chipTextSelected]}>الجزء {item.part}</Text></Pressable>}
            />
            <Text style={styles.caption}>الجزء {currentChunk.part} · {entries.length} مادة · {currentChunk.source_file}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: "/archive/reader", params: { chunk: currentChunk.id, id: item.id } } as never)} style={({ pressed }) => [styles.entry, pressed && styles.pressed]}>
            <Text numberOfLines={2} style={styles.entryTitle}>{item.title}</Text>
            <Text numberOfLines={2} style={styles.entryExcerpt}>{item.text.replace(/\s+/g, " ")}</Text>
            <Text style={styles.entryMeta}>{item.content_type_candidate ?? "مقطع مصدر"} · {(item.topic_candidates ?? ["عام"]).join("، ")}</Text>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: sirajColors.paper, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 36 },
  chips: { flexDirection: "row-reverse", gap: 8, paddingBottom: 12 },
  chip: { backgroundColor: "#ECE8DE", borderRadius: 99, paddingHorizontal: 13, paddingVertical: 9 },
  chipSelected: { backgroundColor: sirajColors.jade },
  chipText: { color: sirajColors.ink, fontSize: 12, fontWeight: "700", writingDirection: "rtl" },
  chipTextSelected: { color: "#FFFFFF" },
  caption: { color: sirajColors.muted, fontSize: 12, marginBottom: 10, textAlign: "right", writingDirection: "rtl" },
  entry: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E5DED0" },
  entryTitle: { color: sirajColors.ink, fontSize: 14, fontWeight: "800", textAlign: "right", writingDirection: "rtl", lineHeight: 22 },
  entryExcerpt: { color: sirajColors.muted, fontSize: 12, lineHeight: 20, textAlign: "right", writingDirection: "rtl", marginTop: 6 },
  entryMeta: { color: sirajColors.jade, fontSize: 11, textAlign: "right", writingDirection: "rtl", marginTop: 8 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  empty: { flex: 1, justifyContent: "center", padding: 24 },
  emptyText: { color: sirajColors.muted, textAlign: "center", writingDirection: "rtl" },
});
