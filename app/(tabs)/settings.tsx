import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { getSettings, saveSettings } from "@/lib/download-store";
import { testService } from "@/lib/yt-dlp-client";

export default function SettingsScreen() {
  const [endpoint, setEndpoint] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => setEndpoint(settings.endpoint));
  }, []);

  const validateEndpoint = (): string | null => {
    try {
      const url = new URL(endpoint.trim());
      if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "10.0.2.2") {
        return "استخدم رابط HTTPS لخدمة التنزيل، أو localhost أثناء التطوير فقط.";
      }
      return null;
    } catch {
      return "أدخل عنوان خدمة صحيحًا يبدأ بـ https://";
    }
  };

  const save = async () => {
    const error = validateEndpoint();
    if (error) return Alert.alert("عنوان غير صالح", error);
    setSaving(true);
    await saveSettings({ endpoint: endpoint.trim().replace(/\/+$/, "") });
    setSaving(false);
    Alert.alert("تم الحفظ", "سيستخدم التطبيق هذا العنوان لطلبات التنزيل الجديدة.");
  };

  const test = async () => {
    const error = validateEndpoint();
    if (error) return Alert.alert("عنوان غير صالح", error);
    setTesting(true);
    try {
      await testService(endpoint);
      Alert.alert("الخدمة متاحة", "تم الوصول إلى نقطة الفحص بنجاح.");
    } catch (connectionError) {
      Alert.alert("تعذر الاتصال", connectionError instanceof Error ? connectionError.message : "تحقق من العنوان وحالة الخدمة.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text className="text-3xl font-bold text-foreground">إعدادات الخدمة</Text>
          <Text className="text-sm leading-6 text-muted mt-2">يرتبط التطبيق بخدمة تنزيل خاصة بك تعمل فيها yt-dlp وFFmpeg. لا تُرسل كلمات المرور أو ملفات تعريف الارتباط من الهاتف.</Text>

          <View className="bg-surface border border-border rounded-3xl p-5 mt-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-2xl bg-[#FCE8E8] items-center justify-center"><MaterialIcons name="dns" size={21} color="#E84545" /></View>
              <View className="flex-1"><Text className="text-base font-bold text-foreground">عنوان خدمة التنزيل</Text><Text className="text-xs text-muted mt-0.5">مثال: https://downloads.example.com</Text></View>
            </View>
            <TextInput
              value={endpoint}
              onChangeText={setEndpoint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="https://..."
              placeholderTextColor="#9CA3AF"
              className="h-14 px-4 rounded-2xl bg-background border border-border text-foreground text-left"
              style={{ writingDirection: "ltr" }}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={test} disabled={testing} className="h-12 mt-3 rounded-2xl bg-background border border-border items-center justify-center flex-row gap-2" style={{ opacity: testing ? 0.65 : 1 }}>
              {testing ? <ActivityIndicator color="#E84545" /> : <MaterialIcons name="network-check" size={20} color="#151515" />}
              <Text className="font-bold text-foreground">اختبار الاتصال</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={save} disabled={saving} className="h-14 rounded-2xl bg-primary items-center justify-center mt-5" style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-base">حفظ العنوان</Text>}
          </TouchableOpacity>

          <View className="bg-[#FFF7E7] border border-[#F0D7A2] rounded-3xl p-5 mt-6">
            <View className="flex-row gap-3"><MaterialIcons name="gpp-good" size={22} color="#C47916" /><View className="flex-1"><Text className="font-bold text-[#6B4C10]">الخصوصية وحقوق الاستخدام</Text><Text className="text-sm leading-6 text-[#785A1F] mt-1">استخدم التطبيق فقط مع المحتوى الذي تملكه أو تملك إذنًا صريحًا لتنزيله. لا تحتفظ هذه الواجهة ببيانات تسجيل الدخول إلى يوتيوب.</Text></View></View>
          </View>

          <View className="mt-6 px-1">
            <Text className="text-base font-bold text-foreground">عقد الخدمة المتوقع</Text>
            <Text className="text-sm leading-6 text-muted mt-2">يستدعي التطبيق GET /health للتحقق، ثم POST /api/downloads مع الرابط والصيغة والجودة لإنشاء المهمة، ويمكنه طلب DELETE /api/downloads/:id للإلغاء.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
