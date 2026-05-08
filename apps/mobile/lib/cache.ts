import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const payload = JSON.stringify({
      data,
      cachedAt: Date.now(),
    });
    await AsyncStorage.setItem(`cache:${key}`, payload);
  } catch (e) {
    console.warn('Cache set failed:', e);
  }
}

export async function getCache<T>(key: string): Promise<{ data: T; cachedAt: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(`cache:${key}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Cache get failed:', e);
    return null;
  }
}

export async function clearCache(key: string): Promise<void> {
  await AsyncStorage.removeItem(`cache:${key}`);
}

export async function clearAllCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((k) => k.startsWith('cache:'));
  await AsyncStorage.multiRemove(cacheKeys);
}