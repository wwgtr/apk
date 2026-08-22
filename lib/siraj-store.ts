import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_KEY = "siraj-al-wilaya.saved-entry-ids.v1";

export async function getSavedEntryIds(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(SAVED_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export async function toggleSavedEntry(id: string): Promise<string[]> {
  const current = await getSavedEntryIds();
  const next = current.includes(id) ? current.filter((value) => value !== id) : [id, ...current];
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next;
}
