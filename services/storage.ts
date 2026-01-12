
export const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(`mehis_${key}`, JSON.stringify(data));
};

export const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(`mehis_${key}`);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
};

export const clearStorage = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('mehis_')) localStorage.removeItem(key);
  });
};
