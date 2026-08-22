import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReaderFontStyle = "naskh" | "system";

export type ReaderSettings = {
  fontStyle: ReaderFontStyle;
  textSize: number;
  lineHeightMultiplier: number;
  keepScreenAwake: boolean;
  reduceMotion: boolean;
};

const KEY = "siraj-al-wilaya.reader-settings.v1";

export const defaultReaderSettings: ReaderSettings = {
  fontStyle: "naskh",
  textSize: 23,
  lineHeightMultiplier: 1.9,
  keepScreenAwake: false,
  reduceMotion: false,
};

export async function getReaderSettings(): Promise<ReaderSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...defaultReaderSettings, ...JSON.parse(raw) } : defaultReaderSettings;
  } catch {
    return defaultReaderSettings;
  }
}

export async function saveReaderSettings(settings: ReaderSettings): Promise<ReaderSettings> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  return settings;
}
