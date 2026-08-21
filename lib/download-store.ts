import AsyncStorage from "@react-native-async-storage/async-storage";

import type { DownloadJob, DownloaderSettings } from "@/lib/download-types";

const JOBS_KEY = "tubevault.downloads.v1";
const SETTINGS_KEY = "tubevault.settings.v1";

export async function getJobs(): Promise<DownloadJob[]> {
  const saved = await AsyncStorage.getItem(JOBS_KEY);
  if (!saved) return [];
  try {
    const jobs = JSON.parse(saved) as DownloadJob[];
    return Array.isArray(jobs) ? jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  } catch {
    return [];
  }
}

export async function saveJob(job: DownloadJob): Promise<void> {
  const jobs = await getJobs();
  const index = jobs.findIndex((item) => item.id === job.id);
  const next = index >= 0 ? jobs.map((item) => (item.id === job.id ? job : item)) : [job, ...jobs];
  await AsyncStorage.setItem(JOBS_KEY, JSON.stringify(next));
}

export async function deleteJob(jobId: string): Promise<void> {
  const jobs = await getJobs();
  await AsyncStorage.setItem(JOBS_KEY, JSON.stringify(jobs.filter((job) => job.id !== jobId)));
}

export async function getSettings(): Promise<DownloaderSettings> {
  const saved = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!saved) return { endpoint: "" };
  try {
    const parsed = JSON.parse(saved) as Partial<DownloaderSettings>;
    return { endpoint: typeof parsed.endpoint === "string" ? parsed.endpoint : "" };
  } catch {
    return { endpoint: "" };
  }
}

export async function saveSettings(settings: DownloaderSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
