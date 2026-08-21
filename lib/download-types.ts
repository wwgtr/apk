export type DownloadFormat = "mp4" | "webm" | "mkv" | "mp3" | "m4a" | "opus" | "wav" | "original";

export type DownloadQuality = "2160p" | "1440p" | "1080p" | "720p" | "480p" | "320kbps" | "192kbps" | "128kbps" | "best";

export type DownloadStatus = "awaiting_connection" | "queued" | "downloading" | "completed" | "failed" | "cancelled";

export interface DownloadJob {
  id: string;
  sourceUrl: string;
  title?: string;
  format: DownloadFormat;
  quality: DownloadQuality;
  status: DownloadStatus;
  progress: number;
  createdAt: string;
  errorMessage?: string;
  outputUrl?: string;
}

export interface DownloaderSettings {
  endpoint: string;
}

export const FORMAT_OPTIONS: Array<{ value: DownloadFormat; label: string; kind: "video" | "audio" | "source" }> = [
  { value: "mp4", label: "MP4", kind: "video" },
  { value: "webm", label: "WebM", kind: "video" },
  { value: "mkv", label: "MKV", kind: "video" },
  { value: "mp3", label: "MP3", kind: "audio" },
  { value: "m4a", label: "M4A", kind: "audio" },
  { value: "opus", label: "Opus", kind: "audio" },
  { value: "wav", label: "WAV", kind: "audio" },
  { value: "original", label: "الصيغة الأصلية", kind: "source" },
];

export const VIDEO_QUALITIES: DownloadQuality[] = ["2160p", "1440p", "1080p", "720p", "480p", "best"];
export const AUDIO_QUALITIES: DownloadQuality[] = ["320kbps", "192kbps", "128kbps", "best"];

export function isYoutubeUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    return host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be" || host === "music.youtube.com";
  } catch {
    return false;
  }
}

export function isAudioFormat(format: DownloadFormat): boolean {
  return ["mp3", "m4a", "opus", "wav"].includes(format);
}

export function formatLabel(format: DownloadFormat): string {
  return FORMAT_OPTIONS.find((option) => option.value === format)?.label ?? format.toUpperCase();
}
