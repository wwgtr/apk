import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeading, sirajColors } from "@/components/siraj-ui";
import { archiveBooks } from "@/lib/siraj-archive";

const books = archiveBooks();
const totalRecords = books.reduce((sum, item) => sum + item.count, 0);

export default function ArchiveHomeScreen() {
  return (
    <ScreenContainer>
      <FlatList
        data={books}
        keyExtractor={(item) => item.sourceName}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <ScreenHeading
              eyebrow={`${totalRecords.toLocaleString("ar-EG")} مقطع عربي محلي`}
              title="أرشيف المصادر الموسع"
              body="هذا الأرشيف يحمّل الكتاب أو الجزء الذي تختاره فقط. التصنيف الآلي ظاهر كمرشح أولي، وتبقى بيانات المصدر والتحقق مع كل مادة."
            />
            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>طريقة القراءة</Text>
              <Text style={styles.noticeText}>اختر كتابًا، ثم جزءًا صغيرًا من أرشيفه. لا يبدأ التطبيق بتحميل corpus كاملًا إلى الذاكرة.</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/archive/[source]", params: { source: item.sourceName } } as never)}
            style={({ pressed }) => [styles.bookCard, pressed && styles.pressed]}
          >
            <View style={styles.bookText}>
              <Text style={styles.bookTitle}>{item.sourceName}</Text>
              <Text style={styles.bookMeta}>{item.chunks.length} جزءًا محليًا · {item.count.toLocaleString("ar-EG")} مقطعًا</Text>
            </View>
            <Text style={styles.arrow}>‹</Text>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: sirajColors.paper, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 36 },
  notice: { backgroundColor: "#F1E8D5", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#E3D4AF" },
  noticeTitle: { color: sirajColors.ink, fontWeight: "800", textAlign: "right", writingDirection: "rtl", marginBottom: 5 },
  noticeText: { color: sirajColors.muted, fontSize: 12, lineHeight: 20, textAlign: "right", writingDirection: "rtl" },
  bookCard: { backgroundColor: "#FFFFFF", borderRadius: 18, minHeight: 82, padding: 15, marginBottom: 10, flexDirection: "row-reverse", alignItems: "center", borderWidth: 1, borderColor: "#E5DED0" },
  bookText: { flex: 1 },
  bookTitle: { color: sirajColors.ink, fontSize: 16, fontWeight: "800", textAlign: "right", writingDirection: "rtl" },
  bookMeta: { color: sirajColors.muted, marginTop: 6, fontSize: 12, textAlign: "right", writingDirection: "rtl" },
  arrow: { color: sirajColors.jade, fontSize: 30, marginRight: 10 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
