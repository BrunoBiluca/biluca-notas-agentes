import { InjectionToken, Signal } from '@angular/core';
import { ThemeMode } from './theme-preference.model';

export interface ThemePreferenceService {
  readonly mode: Signal<ThemeMode>;
  readonly persistenceError: Signal<string | null>;
  initialize(): void;
  select(mode: ThemeMode): void;
}

export const THEME_PREFERENCE_SERVICE = new InjectionToken<ThemePreferenceService>(
  'THEME_PREFERENCE_SERVICE',
);
