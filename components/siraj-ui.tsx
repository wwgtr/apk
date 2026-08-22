import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps, ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

import { HeritageEntry, displayAttribution, getSectionMeta } from "@/lib/siraj-data";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

export const sirajColors = {
  ink: "#142A2A",
  jade: "#0C6B61",
  gold: "#B88737",
  paper: "#F7F3EA",
  mist: "#E9E2D2",
  muted: "#61706C",
  night: "#081B1D",
  white: "#FFFFFF",
  danger: "#A4473D",
};

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitle}>
      {action && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.sectionAction, pressed && styles.pressed]}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <MaterialIcons name="arrow-back-ios" size={14} color={sirajColors.jade} />
        </Pressable>
      ) : <View />}
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

export function MetaPill({ label, tone = "jade" }: { label: string; tone?: "jade" | "gold" | "muted" }) {
  const toneStyle = tone === "gold" ? styles.pillGold : tone === "muted" ? styles.pillMuted : styles.pillJade;
  const textStyle = tone === "gold" ? styles.pillGoldText : tone === "muted" ? styles.pillMutedText : styles.pillJadeText;
  return <View style={[styles.pill, toneStyle]}><Text style={[styles.pillText, textStyle]}>{label}</Text></View>;
}

export function ActionRow({ icon, label, onPress, trailing, style }: { icon: IconName; label: string; onPress: () => void; trailing?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionRow, style, pressed && styles.pressed]}>
      <View style={styles.actionRowStart}>{trailing}<MaterialIcons name="chevron-left" size={24} color={sirajColors.muted} /></View>
      <View style={styles.actionRowEnd}><Text style={styles.actionRowText}>{label}</Text><MaterialIcons name={icon} size={21} color={sirajColors.jade} /></View>
    </Pressable>
  );
}

export function EntryCard({ entry, onPress, compact = false }: { entry: HeritageEntry; onPress: () => void; compact?: boolean }) {
  const meta = getSectionMeta(entry.section);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.entryCard, compact && styles.entryCompact, pressed && styles.pressed]}>
      <View style={styles.entryHeading}>
        <MetaPill label={meta.title} tone="gold" />
        <Text style={styles.entryTitle} numberOfLines={compact ? 1 : 2}>{entry.title}</Text>
      </View>
      {!compact && <Text style={styles.entryBody} numberOfLines={3}>{entry.text}</Text>}
      <View style={styles.entryFooter}>
        <Text style={styles.entrySource} numberOfLines={1}>{entry.sourceName}</Text>
        <MetaPill label={displayAttribution(entry.attributionStatus)} tone="muted" />
      </View>
    </Pressable>
  );
}

export function EmptyState({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><MaterialIcons name={icon} size={30} color={sirajColors.gold} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function ScreenHeading({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <View style={styles.screenHeading}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.screenTitle}>{title}</Text>
      {body ? <Text style={styles.screenBody}>{body}</Text> : null}
    </View>
  );
}

export function BackButton({ onPress, label = "رجوع" }: { onPress: () => void; label?: string }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-forward" size={18} color={sirajColors.jade} /><Text style={styles.backText}>{label}</Text></Pressable>;
}

export const typography = StyleSheet.create({
  rtl: { textAlign: "right", writingDirection: "rtl" } as TextStyle,
});

const styles = StyleSheet.create({
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  sectionTitle: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10, marginTop: 8 },
  sectionTitleText: { color: sirajColors.ink, fontSize: 18, fontWeight: "800", textAlign: "right", writingDirection: "rtl" },
  sectionAction: { alignItems: "center", flexDirection: "row", gap: 3, minHeight: 36, paddingHorizontal: 2 },
  sectionActionText: { color: sirajColors.jade, fontSize: 13, fontWeight: "700", writingDirection: "rtl" },
  pill: { alignSelf: "flex-start", borderRadius: 99, maxWidth: "100%", paddingHorizontal: 9, paddingVertical: 4 },
  pillText: { fontSize: 10, fontWeight: "700", textAlign: "right", writingDirection: "rtl" },
  pillJade: { backgroundColor: "#D8EEE9" }, pillJadeText: { color: sirajColors.jade },
  pillGold: { backgroundColor: "#F3E7CB" }, pillGoldText: { color: "#75531C" },
  pillMuted: { backgroundColor: "#EEF0EC" }, pillMutedText: { color: sirajColors.muted },
  actionRow: { alignItems: "center", backgroundColor: sirajColors.white, borderColor: sirajColors.mist, borderRadius: 17, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 60, paddingHorizontal: 15 },
  actionRowStart: { alignItems: "center", flexDirection: "row", gap: 6 },
  actionRowEnd: { alignItems: "center", flexDirection: "row", gap: 11 },
  actionRowText: { color: sirajColors.ink, fontSize: 15, fontWeight: "700", writingDirection: "rtl" },
  entryCard: { backgroundColor: sirajColors.white, borderColor: sirajColors.mist, borderRadius: 19, borderWidth: 1, gap: 11, marginBottom: 10, padding: 15 },
  entryCompact: { marginBottom: 8, paddingVertical: 12 },
  entryHeading: { alignItems: "flex-start", flexDirection: "row", gap: 10, justifyContent: "space-between" },
  entryTitle: { color: sirajColors.ink, flex: 1, fontSize: 16, fontWeight: "800", lineHeight: 24, textAlign: "right", writingDirection: "rtl" },
  entryBody: { color: "#3D4B47", fontSize: 14, lineHeight: 23, textAlign: "right", writingDirection: "rtl" },
  entryFooter: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  entrySource: { color: sirajColors.muted, flex: 1, fontSize: 11, marginLeft: 10, textAlign: "right", writingDirection: "rtl" },
  emptyState: { alignItems: "center", backgroundColor: sirajColors.white, borderColor: sirajColors.mist, borderRadius: 24, borderWidth: 1, gap: 8, marginTop: 30, padding: 28 },
  emptyIcon: { alignItems: "center", backgroundColor: "#F4EBD9", borderRadius: 40, height: 62, justifyContent: "center", width: 62 },
  emptyTitle: { color: sirajColors.ink, fontSize: 17, fontWeight: "800", textAlign: "center", writingDirection: "rtl" },
  emptyBody: { color: sirajColors.muted, fontSize: 13, lineHeight: 21, textAlign: "center", writingDirection: "rtl" },
  screenHeading: { gap: 5, marginBottom: 15 },
  eyebrow: { color: sirajColors.gold, fontSize: 12, fontWeight: "800", textAlign: "right", writingDirection: "rtl" },
  screenTitle: { color: sirajColors.ink, fontSize: 28, fontWeight: "900", lineHeight: 38, textAlign: "right", writingDirection: "rtl" },
  screenBody: { color: sirajColors.muted, fontSize: 14, lineHeight: 22, textAlign: "right", writingDirection: "rtl" },
  backButton: { alignItems: "center", flexDirection: "row", gap: 6, minHeight: 44, paddingVertical: 7 },
  backText: { color: sirajColors.jade, fontSize: 14, fontWeight: "800", writingDirection: "rtl" },
});
