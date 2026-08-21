import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { getSettings, saveJob } from "@/lib/download-store";
import { AUDIO_QUALITIES, FORMAT_OPTIONS, isAudioFormat, isYoutubeUrl, VIDEO_QUALITIES, type DownloadFormat, type DownloadQuality } from "@/lib/download-types";
import { createRemoteDownload } from "@/lib/yt-dlp-client";

/**
 * Home Screen - NativeWind Example
 *
 * This template uses NativeWind (Tailwind CSS for React Native).
 * You can use familiar Tailwind classes directly in className props.
 *
 * Key patterns:
 * - Use `className` instead of `style` for most styling
 * - Theme colors: use tokens directly (bg-background, text-foreground, bg-primary, etc.); no dark: prefix needed
 * - Responsive: standard Tailwind breakpoints work on web
 * - Custom colors defined in tailwind.config.js
 */
export default function HomeScreen() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [format, setFormat] = useState<DownloadFormat>("mp4");
  const [quality, setQuality] = useState<DownloadQuality>("1080p");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedNotice, setAcceptedNotice] = useState(false);

  const qualities = useMemo(() => (isAudioFormat(format) ? AUDIO_QUALITIES : VIDEO_QUALITIES), [format]);

  useEffect(() => {
    if (!qualities.includes(quality)) setQuality(qualities[0]);
  }, [qualities, quality]);

  const chooseFormat = (nextFormat: DownloadFormat) => {
    setFormat(nextFormat);
    setQuality(isAudioFormat(nextFormat) ? "192kbps" : nextFormat === "original" ? "best" : "1080p");
  };

  const createJob = async () => {
    if (!isYoutubeUrl(sourceUrl)) {
      Alert.alert("تحقق من الرابط", "أدخل رابط فيديو أو قائمة تشغيل صالحًا من youtube.com أو youtu.be.");
      return;
    }
    if (!acceptedNotice) {
      Alert.alert("إقرار الاستخدام", "فعّل الإقرار بأن لديك الحق في تنزيل هذا المحتوى قبل إنشاء الطلب.");
      return;
    }
    setIsSubmitting(true);
    const localId = `local-${Date.now()}`;
    try {
      const settings = await getSettings();
      if (!settings.endpoint) {
        await saveJob({ id: localId, sourceUrl: sourceUrl.trim(), format, quality, status: "awaiting_connection", progress: 0, createdAt: new Date().toISOString() });
        Alert.alert("اربط خدمة التنزيل أولًا", "حُفظ طلبك محليًا. أضف عنوان خدمة yt-dlp الخاصة بك من الإعدادات، ثم أعد إرسال الطلب.", [
          { text: "لاحقًا", style: "cancel" },
          { text: "فتح الإعدادات", onPress: () => router.push("/settings" as never) },
        ]);
      } else {
        const remote = await createRemoteDownload(settings.endpoint, { sourceUrl: sourceUrl.trim(), format, quality });
        await saveJob({
          id: remote.id || remote.jobId || localId,
          sourceUrl: sourceUrl.trim(),
          title: remote.title,
          format,
          quality,
          status: remote.status || "queued",
          progress: remote.progress || 0,
          createdAt: new Date().toISOString(),
          errorMessage: remote.errorMessage,
          outputUrl: remote.outputUrl,
        });
        setSourceUrl("");
        router.push("/downloads" as never);
      }
    } catch (error) {
      await saveJob({ id: localId, sourceUrl: sourceUrl.trim(), format, quality, status: "failed", progress: 0, createdAt: new Date().toISOString(), errorMessage: error instanceof Error ? error.message : "تعذر إنشاء الطلب." });
      Alert.alert("تعذر إنشاء الطلب", "حُفظت تفاصيل الخطأ في قائمة التنزيلات. تحقق من عنوان الخدمة وحاول مجددًا.");
      router.push("/downloads" as never);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between">
            <View><Text className="text-3xl font-bold text-foreground">تنزيل جديد</Text><Text className="text-sm text-muted mt-1">اختر الجودة والصيغة قبل بدء الطلب</Text></View>
            <View className="w-12 h-12 rounded-2xl bg-[#FCE8E8] items-center justify-center"><MaterialIcons name="download" size={25} color="#E84545" /></View>
          </View>

          <View className="bg-surface border border-border rounded-3xl p-5 mt-6">
            <Text className="font-bold text-foreground mb-3">رابط يوتيوب</Text>
            <TextInput
              value={sourceUrl}
              onChangeText={setSourceUrl}
              placeholder="ألصق رابط الفيديو أو قائمة التشغيل"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              className="min-h-14 px-4 py-3 rounded-2xl bg-background border border-border text-foreground text-left"
              style={{ writingDirection: "ltr" }}
            />
            <Text className="text-xs leading-5 text-muted mt-3">يدعم التطبيق روابط youtube.com وyoutu.be. ستُنفذ التنزيلات عبر خدمة yt-dlp المملوكة لك.</Text>
          </View>

          <Text className="text-base font-bold text-foreground mt-7 mb-3">الصيغة</Text>
          <View className="flex-row flex-wrap gap-2">
            {FORMAT_OPTIONS.map((option) => {
              const selected = format === option.value;
              return <TouchableOpacity key={option.value} onPress={() => chooseFormat(option.value)} className="px-4 py-3 rounded-2xl border" style={{ borderColor: selected ? "#E84545" : "#E5E7EB", backgroundColor: selected ? "#FCE8E8" : "#FFFFFF" }}><Text style={{ color: selected ? "#C73737" : "#151515", fontWeight: "700" }}>{option.label}</Text></TouchableOpacity>;
            })}
          </View>

          <Text className="text-base font-bold text-foreground mt-7 mb-3">الجودة</Text>
          <View className="flex-row flex-wrap gap-2">
            {qualities.map((option) => {
              const selected = quality === option;
              return <TouchableOpacity key={option} onPress={() => setQuality(option)} className="px-4 py-3 rounded-2xl border" style={{ borderColor: selected ? "#151515" : "#E5E7EB", backgroundColor: selected ? "#151515" : "#FFFFFF" }}><Text style={{ color: selected ? "#FFFFFF" : "#374151", fontWeight: "700" }}>{option === "best" ? "الأفضل" : option}</Text></TouchableOpacity>;
            })}
          </View>

          <TouchableOpacity onPress={() => setAcceptedNotice((value) => !value)} className="flex-row items-start gap-3 mt-7 p-4 rounded-2xl bg-[#FFF7E7] border border-[#F0D7A2]">
            <MaterialIcons name={acceptedNotice ? "check-box" : "check-box-outline-blank"} size={23} color={acceptedNotice ? "#C47916" : "#8A6C2F"} />
            <Text className="flex-1 text-sm leading-6 text-[#785A1F]">أقر بأن لدي الحق في تنزيل هذا المحتوى أو أن صاحبه أتاح تنزيله.</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={createJob} disabled={isSubmitting} className="h-15 min-h-14 rounded-2xl bg-primary items-center justify-center flex-row gap-2 mt-5" style={{ opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <MaterialIcons name="download" size={22} color="#FFFFFF" />}
            <Text className="text-white font-bold text-base">{isSubmitting ? "جارٍ إنشاء الطلب..." : "بدء التنزيل"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/settings" as never)} className="items-center py-4"><Text className="font-semibold text-muted">إعداد أو تغيير خدمة yt-dlp</Text></TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
