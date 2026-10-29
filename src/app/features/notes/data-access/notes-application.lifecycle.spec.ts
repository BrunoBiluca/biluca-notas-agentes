import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import {
  configureNotesApplication,
  InMemoryEditingSessionCoordinator,
  InMemoryNoteRepository,
  sampleNotes,
} from './notes-testing.fixtures';

describe('notes application lifecycle', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('creates, saves and cancels edits without persisting an abandoned draft', async () => {
    const repository = new InMemoryNoteRepository();
    const app = configureNotesApplication(repository);
    await app.loadInitial();
    const created = await app.create({ title: '  My note ', content: ' body ', imageIds: [] });
    expect(created.title).toBe('My note');
    expect(created.content).toBe('body');
    expect(created.revision).toBe(1);

    await app.beginEdit(created.id);
    const saved = await app.saveEdit(created.id, {
      title: 'Saved title',
      content: '',
      imageIds: [],
    });
    expect(saved.kind).toBe('saved');
    if (saved.kind === 'saved') expect(saved.note.revision).toBe(2);

    await app.beginEdit(created.id);
    app.cancelEdit(created.id);
    expect((await app.get(created.id))?.title).toBe('Saved title');
  });

  it('rejects access to another owner and reports persisted revision conflicts', async () => {
    const repository = new InMemoryNoteRepository([
      ...sampleNotes(1),
      { ...sampleNotes(1, 'user-2')[0], id: 'private-note' },
    ]);
    const sessions = new InMemoryEditingSessionCoordinator();
    const app = configureNotesApplication(repository, undefined, sessions);
    expect(await app.get('private-note')).toBeUndefined();
    expect((await app.beginEdit('note-0')).otherTabEditing).toBe(false);

    const external = await repository.get('user-1', 'note-0');
    expect(external).toBeDefined();
    const externalSave = await repository.saveWithImages(
      { ...external!, title: 'Other tab' },
      1,
      [],
      [],
    );
    expect(externalSave.kind).toBe('saved');

    const conflict = await app.saveEdit('note-0', {
      title: 'Local draft',
      imageIds: [],
    });
    expect(conflict.kind).toBe('conflict');
    const overwritten = await app.saveEdit(
      'note-0',
      {
        title: 'Local draft',
        imageIds: [],
      },
      'overwrite',
    );
    expect(overwritten.kind).toBe('saved');
    expect((await app.get('note-0'))?.title).toBe('Local draft');
  });

  it('removes a note using the current owner scope', async () => {
    const repository = new InMemoryNoteRepository(sampleNotes(1));
    const app = configureNotesApplication(repository);
    await app.loadInitial();
    await app.delete('note-0');
    expect(await app.get('note-0')).toBeUndefined();
  });

  it('propagates collection failures and exposes an actionable error state', async () => {
    const repository = new InMemoryNoteRepository();
    repository.failList = true;
    const app = configureNotesApplication(repository);
    await expect(app.loadInitial()).rejects.toThrow('Falha simulada');
    expect(app.error()).toContain('Falha simulada');
  });

  it('does not report a failed create as successful', async () => {
    const repository = new InMemoryNoteRepository();
    repository.failCreate = true;
    const app = configureNotesApplication(repository);
    await expect(app.create({ title: 'Will fail', imageIds: [] })).rejects.toThrow(
      'Falha simulada',
    );
    expect(repository.records).toHaveLength(0);
    expect(app.error()).toContain('Falha simulada');
  });
});
