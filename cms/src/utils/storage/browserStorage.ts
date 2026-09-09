export type JsonGuard<T> = (value: unknown) => value is T;

export const getStoredString = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const setStoredString = (key: string, value: string): void => {
  localStorage.setItem(key, value);
};

export const removeStoredValue = (key: string): void => {
  localStorage.removeItem(key);
};

export const getStoredJson = <T>(key: string, isValue: JsonGuard<T>): T | null => {
  const rawValue = getStoredString(key);

  if (rawValue === null) {
    return null;
  }

  try {
    const value: unknown = JSON.parse(rawValue);
    return isValue(value) ? value : null;
  } catch {
    return null;
  }
};

export const setStoredJson = (key: string, value: unknown): void => {
  setStoredString(key, JSON.stringify(value));
};
