import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ThemePreferenceService } from './theme-preference.contract';
import { isThemeMode, THEME_PREFERENCE_STORAGE_KEY, ThemeMode } from './theme-preference.model';

interface ThemePreferenceState {
  mode: ThemeMode;
  persistenceError: string | null;
}

const initialState: ThemePreferenceState = {
  mode: 'system',
  persistenceError: null,
};

const ThemePreferenceStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setMode: (mode: ThemeMode) => patchState(store, { mode }),
    setPersistenceError: (persistenceError: string | null) =>
      patchState(store, { persistenceError }),
  })),
);

@Injectable({ providedIn: 'root' })
export class ThemePreferenceServiceImpl implements ThemePreferenceService {
  private readonly document = inject(DOCUMENT);
  private readonly store = inject(ThemePreferenceStore);

  readonly mode: Signal<ThemeMode> = this.store.mode;
  readonly persistenceError: Signal<string | null> = this.store.persistenceError;

  initialize(): void {
    let mode: ThemeMode = 'system';
    let persistenceError: string | null = null;

    try {
      const storage = this.document.defaultView?.localStorage;
      if (!storage) throw new Error('Armazenamento local indisponível.');

      const storedMode = storage.getItem(THEME_PREFERENCE_STORAGE_KEY);
      if (storedMode !== null) {
        if (isThemeMode(storedMode)) {
          mode = storedMode;
        } else {
          persistenceError = 'A preferência de tema salva é inválida. O modo do sistema será usado.';
        }
      }
    } catch {
      persistenceError = 'Não foi possível recuperar a preferência de tema. O modo do sistema será usado.';
    }

    this.store.setMode(mode);
    this.store.setPersistenceError(persistenceError);
    this.applyMode(mode);
  }

  select(mode: ThemeMode): void {
    if (!isThemeMode(mode)) {
      this.store.setPersistenceError('A opção de tema selecionada é inválida.');
      return;
    }

    this.store.setMode(mode);
    this.applyMode(mode);

    try {
      const storage = this.document.defaultView?.localStorage;
      if (!storage) throw new Error('Armazenamento local indisponível.');

      storage.setItem(THEME_PREFERENCE_STORAGE_KEY, mode);
      this.store.setPersistenceError(null);
    } catch {
      this.store.setPersistenceError(
        'Não foi possível salvar a preferência de tema. Ela ficará ativa somente nesta sessão.',
      );
    }
  }

  private applyMode(mode: ThemeMode): void {
    this.document.documentElement.style.colorScheme = mode === 'system' ? 'light dark' : mode;
  }
}
