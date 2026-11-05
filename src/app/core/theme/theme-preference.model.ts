export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_PREFERENCE_STORAGE_KEY = 'biluca-notas-agentes.theme-preference';

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}
