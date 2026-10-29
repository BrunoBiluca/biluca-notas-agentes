import { describe, expect, it } from 'vitest';
import { validateNoteImage } from './note-image-validation';

describe('validateNoteImage', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])(
    'accepts %s up to 10 MB',
    (type) => {
      expect(validateNoteImage({ type, size: 10_000_000 })).toBeUndefined();
    },
  );
  it('rejects unsupported, empty and oversized files', () => {
    expect(validateNoteImage({ type: 'image/svg+xml', size: 1 })).toContain('Formato');
    expect(validateNoteImage({ type: 'image/png', size: 0 })).toContain('entre');
    expect(validateNoteImage({ type: 'image/png', size: 10_000_001 })).toContain('entre');
  });
});
