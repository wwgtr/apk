import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { deleteJob, getJobs, getSettings, saveJob } from "@/lib/download-store";
import { formatLabel, type DownloadJob, type DownloadStatus } from "@/lib/download-types";
import { cancelRemoteDownload, getRemoteDownload } from "@/lib/yt-dlp-client";

const statusPresentation: Record<DownloadStatus, { label: string; color: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  awaiting_connection: { label: "بانتظار ربط الخدمة", color: "#C47916", icon: "settings-ethernet" },
  queued: { label: "في قائمة الانتظار", color: "#2B6CB0", icon: "schedule" },
  downloading: { label: "جارٍ التنزيل", color: "#E84545", icon: "downloading" },
  completed: { label: "مكتمل", color: "#228B5B", icon: "check-circle" },
  failed: { label: "فشل", color: "#C73737", icon: "error-outline" },
  cancelled: { label: "أُلغي", color: "#6B7280", icon: "remove-circle-outline" },
};

function shortUrl(value: string): string {
  try {
    const url = new URL(value);
    return `${url.hostname.replace("www.", "")}${url.pathname}`;
  } catch {
    return value;
  }
}

export default function DownloadsScreen() {
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async () => {
    const storedJobs = await getJobs();
    const settings = await getSettings();
    if (!settings.endpoint) {
      setJobs(storedJobs);
      return;
    }
    const refreshedJobs = await Promise.all(storedJobs.map(async (job) => {
      if (!["queued", "downloading"].includes(job.status)) return job;
      try {
        const remote = await getRemoteDownload(settings.endpoint, job.id);
        const nextJob = {
          ...job,
          title: remote.title || job.title,
          status: remote.status || job.status,
          progress: typeof remote.progress === "number" ? remote.progress : job.progress,
          errorMessage: remote.errorMessage || job.errorMessage,
          outputUrl: remote.outputUrl || job.outputUrl,
        };
        await saveJob(nextJob);
        return nextJob;
      } catch {
        return job;
      }
    }));
    setJobs(refreshedJobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const cancelJob = async (job: DownloadJob) => {
    try {
      const settings = await getSettings();
      if (settings.endpoint && job.status !== "awaiting_connection") {
        await cancelRemoteDownload(settings.endpoint, job.id);
      }
    } catch {
      // يبقى الإلغاء المحلي متاحًا عندما تكون الخدمة غير متصلة.
    }
    await saveJob({ ...job, status: "cancelled", progress: job.progress });
    await loadJobs();
  };

  const removeJob = (job: DownloadJob) => {
    Alert.alert("حذف الطلب", "سيُحذف هذا السجل من الهاتف فقط.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await deleteJob(job.id);
          await loadJobs();
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <View className="pt-3 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-bold text-foreground">التنزيلات</Text>
          <Text className="text-sm text-muted mt-1">تُحفظ القائمة على هذا الجهاز</Text>
        </View>
        <TouchableOpacity onPress={loadJobs} className="w-11 h-11 rounded-full bg-surface border border-border items-center justify-center" accessibilityLabel="تحديث قائمة التنزيلات">
          <MaterialIcons name="refresh" size={23} color="#151515" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadJobs(); setRefreshing(false); }} tintColor="#E84545" />}
        contentContainerStyle={jobs.length === 0 ? { flexGrow: 1 } : { paddingBottom: 30 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-9 pb-20">
            <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-5">
              <MaterialIcons name="download-for-offline" size={38} color="#E84545" />
            </View>
            <Text className="text-xl font-bold text-foreground">لا توجد تنزيلات بعد</Text>
            <Text className="text-sm leading-6 text-muted text-center mt-2">أضف رابطًا من تبويب التنزيل الجديد، ثم اختر الصيغة والجودة المناسبة.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const presentation = statusPresentation[item.status];
          const canCancel = item.status === "queued" || item.status === "downloading" || item.status === "awaiting_connection";
          return (
            <View className="bg-surface border border-border rounded-3xl p-4 mb-3">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground" numberOfLines={1}>{item.title || "طلب تنزيل"}</Text>
                  <Text className="text-xs text-muted mt-1" numberOfLines={1}>{shortUrl(item.sourceUrl)}</Text>
                </View>
                <MaterialIcons name={presentation.icon} size={23} color={presentation.color} />
              </View>
              <View className="flex-row items-center gap-2 mt-4">
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${presentation.color}18` }}>
                  <Text className="text-xs font-semibold" style={{ color: presentation.color }}>{presentation.label}</Text>
                </View>
                <Text className="text-xs text-muted">{formatLabel(item.format)} · {item.quality}</Text>
              </View>
              {(item.status === "downloading" || item.status === "queued") && (
                <View className="mt-4">
                  <View className="h-2 bg-border rounded-full overflow-hidden">
                    <View className="h-full bg-primary rounded-full" style={{ width: `${Math.max(4, item.progress)}%` }} />
                  </View>
                  <Text className="text-xs text-muted mt-2">{item.progress}%</Text>
                </View>
              )}
              {item.errorMessage ? <Text className="text-xs leading-5 text-error mt-3">{item.errorMessage}</Text> : null}
              <View className="flex-row justify-end gap-2 mt-4">
                {canCancel && <TouchableOpacity onPress={() => cancelJob(item)} className="px-3 py-2 rounded-xl bg-background border border-border"><Text className="text-sm font-semibold text-foreground">إلغاء</Text></TouchableOpacity>}
                <TouchableOpacity onPress={() => removeJob(item)} className="px-3 py-2 rounded-xl"><Text className="text-sm font-semibold text-muted">حذف</Text></TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </ScreenContainer>
  );
}
