import { describe, expect, it } from "vitest";

import { AUDIO_QUALITIES, FORMAT_OPTIONS, VIDEO_QUALITIES, isAudioFormat, isYoutubeUrl } from "../lib/download-types";

describe("روابط يوتيوب", () => {
  it("يقبل نطاقات يوتيوب المعتمدة", () => {
    expect(isYoutubeUrl("https://www.youtube.com/watch?v=abc123")).toBe(true);
    expect(isYoutubeUrl("https://youtu.be/abc123?t=30")).toBe(true);
    expect(isYoutubeUrl("https://music.youtube.com/watch?v=abc123")).toBe(true);
  });

  it("يرفض الروابط غير الصالحة والنطاقات المقلدة", () => {
    expect(isYoutubeUrl("not a url")).toBe(false);
    expect(isYoutubeUrl("https://youtube.com.example/video")).toBe(false);
    expect(isYoutubeUrl("https://example.com/watch?v=abc123")).toBe(false);
  });
});

describe("خيارات الصيغ والجودة", () => {
  it("يعرض صيغ الفيديو والصوت والأصلية المطلوبة", () => {
    expect(FORMAT_OPTIONS.map((option) => option.value)).toEqual(["mp4", "webm", "mkv", "mp3", "m4a", "opus", "wav", "original"]);
    expect(isAudioFormat("mp3")).toBe(true);
    expect(isAudioFormat("m4a")).toBe(true);
    expect(isAudioFormat("mp4")).toBe(false);
  });

  it("يفصل بين جودة الفيديو وجودة الصوت", () => {
    expect(VIDEO_QUALITIES).toContain("1080p");
    expect(VIDEO_QUALITIES).toContain("best");
    expect(AUDIO_QUALITIES).toContain("192kbps");
    expect(AUDIO_QUALITIES).not.toContain("1080p");
  });
});
