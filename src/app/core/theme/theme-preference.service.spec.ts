import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemePreferenceServiceImpl } from './theme-preference.service';
import { THEME_PREFERENCE_STORAGE_KEY } from './theme-preference.model';

describe('ThemePreferenceService', () => {
  beforeEach(() => {
    localStorage.removeItem(THEME_PREFERENCE_STORAGE_KEY);
    document.documentElement.style.removeProperty('color-scheme');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('defaults to the system preference when no value has been stored', () => {
    const service = TestBed.inject(ThemePreferenceServiceImpl);

    service.initialize();

    expect(service.mode()).toBe('system');
    expect(service.persistenceError()).toBeNull();
    expect(document.documentElement.style.colorScheme).toBe('light dark');
  });

  it.each(['light', 'dark', 'system'] as const)(
    'restores the saved %s preference',
    (mode) => {
      localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, mode);
      const service = TestBed.inject(ThemePreferenceServiceImpl);

      service.initialize();

      expect(service.mode()).toBe(mode);
      expect(document.documentElement.style.colorScheme).toBe(
        mode === 'system' ? 'light dark' : mode,
      );
    },
  );

  it('uses the system preference and reports an invalid stored value', () => {
    localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, 'sepia');
    const service = TestBed.inject(ThemePreferenceServiceImpl);

    service.initialize();

    expect(service.mode()).toBe('system');
    expect(service.persistenceError()).toContain('inválida');
    expect(document.documentElement.style.colorScheme).toBe('light dark');
  });

  it('keeps the application usable and reports a storage read error', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    const service = TestBed.inject(ThemePreferenceServiceImpl);

    service.initialize();

    expect(service.mode()).toBe('system');
    expect(service.persistenceError()).toContain('recuperar');
    expect(document.documentElement.style.colorScheme).toBe('light dark');
  });

  it.each(['light', 'dark', 'system'] as const)(
    'applies and persists a selected %s preference',
    (mode) => {
      const service = TestBed.inject(ThemePreferenceServiceImpl);

      service.select(mode);

      expect(service.mode()).toBe(mode);
      expect(localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)).toBe(mode);
      expect(document.documentElement.style.colorScheme).toBe(
        mode === 'system' ? 'light dark' : mode,
      );
      expect(service.persistenceError()).toBeNull();
    },
  );

  it('keeps a selected mode active and reports a storage write error', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'QuotaExceededError');
    });
    const service = TestBed.inject(ThemePreferenceServiceImpl);

    service.select('dark');

    expect(service.mode()).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(service.persistenceError()).toContain('salva');
  });
});
