import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { sirajColors } from "@/components/siraj-ui";
import { loadArchiveChunk } from "@/lib/siraj-archive";

export default function ArchiveReaderScreen() {
  const { chunk, id } = useLocalSearchParams<{ chunk?: string; id?: string }>();
  const entry = loadArchiveChunk(chunk ?? "").find((item) => item.id === id);

  if (!entry) {
    return <ScreenContainer><View style={styles.empty}><Text style={styles.emptyText}>تعذر فتح مادة الأرشيف. ارجع إلى الكتاب واختر المادة مرة أخرى.</Text></View></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{entry.source_name} · {entry.content_type_candidate ?? "مقطع مصدر"}</Text>
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.text}>{entry.text}</Text>
        <View style={styles.sourceCard}>
          <Text style={styles.sourceLabel}>بيانات المصدر</Text>
          <Text style={styles.sourceText}>{entry.author_or_compiler}</Text>
          <Text style={styles.sourceText}>{entry.source_locator}</Text>
          <Text style={styles.sourceText}>{entry.attribution_status === "source_text_pending_editorial_classification" ? "نص مصدر يحتاج تصنيفًا تحريريًا" : entry.attribution_status}</Text>
          <Text style={styles.sourceNote}>{entry.verification_note}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: sirajColors.paper, padding: 20, paddingBottom: 40 },
  eyebrow: { color: sirajColors.jade, fontSize: 12, fontWeight: "700", textAlign: "right", writingDirection: "rtl", marginBottom: 10 },
  title: { color: sirajColors.ink, fontSize: 21, fontWeight: "800", textAlign: "right", writingDirection: "rtl", lineHeight: 32, marginBottom: 18 },
  text: { color: "#27302E", fontSize: 20, lineHeight: 38, textAlign: "right", writingDirection: "rtl" },
  sourceCard: { backgroundColor: "#EAF2EE", borderRadius: 18, padding: 15, marginTop: 26, borderWidth: 1, borderColor: "#C6DED5" },
  sourceLabel: { color: sirajColors.jade, fontWeight: "800", textAlign: "right", writingDirection: "rtl", marginBottom: 8 },
  sourceText: { color: sirajColors.ink, fontSize: 12, textAlign: "right", writingDirection: "rtl", lineHeight: 20, marginBottom: 3 },
  sourceNote: { color: sirajColors.muted, fontSize: 11, lineHeight: 18, textAlign: "right", writingDirection: "rtl", marginTop: 7 },
  empty: { flex: 1, justifyContent: "center", padding: 24 },
  emptyText: { color: sirajColors.muted, textAlign: "center", writingDirection: "rtl" },
});
