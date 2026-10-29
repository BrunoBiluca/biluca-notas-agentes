import { describe, expect, it } from 'vitest';
import { createNote, getForegroundColor } from './note.factory';

describe('note factory', () => {
  it('normalizes text and sets initial values', () => {
    const note = createNote(
      { title: '  Minha nota  ', content: '   ', imageIds: [] },
      'user-1',
      4,
      123,
      'note-1',
    );
    expect(note).toMatchObject({
      id: 'note-1',
      ownerId: 'user-1',
      title: 'Minha nota',
      createdAt: 123,
      updatedAt: 123,
      pinned: false,
      manualOrder: 4,
      revision: 1,
      imageIds: [],
    });
    expect(note.content).toBeUndefined();
  });

  it('requires a title and derives readable foreground colors', () => {
    expect(() => createNote({ title: '  ' }, 'user-1', 0)).toThrow('título');
    expect(getForegroundColor('#111111')).toBe('#ffffff');
    expect(getForegroundColor('#ffffff')).toBe('#000000');
  });
});
