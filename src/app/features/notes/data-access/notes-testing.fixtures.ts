import { TestBed } from '@angular/core/testing';
import { CURRENT_USER_PROVIDER } from '../../../core/identity/current-user.provider';
import { Note, NoteImage, NoteSortMode } from '../domain/note.model';
import { NotesApplicationService } from './notes-application.service';
import {
  EDITING_SESSION_COORDINATOR,
  EditingSessionCoordinator,
  NOTE_IMAGE_REPOSITORY,
  NOTE_REPOSITORY,
  NoteImageRepository,
  NoteRepository,
  SaveEditResult,
} from './service-contracts';

export class InMemoryNoteRepository implements NoteRepository {
  readonly records: Note[];
  readonly images = new Map<string, NoteImage>();
  failList = false;
  failCreate = false;

  constructor(notes: Note[] = []) {
    this.records = notes.map((note) => ({ ...note, imageIds: [...note.imageIds] }));
  }

  async create(note: Note): Promise<void> {
    this.records.push({ ...note });
  }

  async createWithImages(note: Note, images: NoteImage[]): Promise<void> {
    if (this.failCreate) throw new Error('Falha simulada de gravação.');
    this.records.push({ ...note });
    images.forEach((image) => this.images.set(image.id, image));
  }

  async get(ownerId: string, noteId: string): Promise<Note | undefined> {
    const note = this.records.find((item) => item.ownerId === ownerId && item.id === noteId);
    return note ? { ...note, imageIds: [...note.imageIds] } : undefined;
  }

  async list(ownerId: string, offset: number, limit: number, sort: NoteSortMode): Promise<Note[]> {
    if (this.failList) throw new Error('Falha simulada de leitura.');
    return this.ordered(
      this.records.filter((note) => note.ownerId === ownerId),
      sort,
    ).slice(offset, offset + limit);
  }

  async search(ownerId: string, query: string, sort: NoteSortMode): Promise<Note[]> {
    if (this.failList) throw new Error('Falha simulada de busca.');
    const term = query.trim().toLowerCase();
    return this.ordered(
      this.records.filter(
        (note) =>
          note.ownerId === ownerId &&
          (!term || `${note.title}\n${note.content ?? ''}`.toLowerCase().includes(term)),
      ),
      sort,
    );
  }

  async saveWithImages(
    note: Note,
    expectedRevision: number,
    imagesToSave: NoteImage[],
    imagesToRemove: string[],
    overwrite = false,
  ): Promise<SaveEditResult> {
    const index = this.records.findIndex(
      (item) => item.ownerId === note.ownerId && item.id === note.id,
    );
    const current = this.records[index];
    if (!current) throw new Error('A nota não existe ou não pertence ao usuário atual.');
    if (!overwrite && current.revision !== expectedRevision) {
      return { kind: 'conflict', current: { ...current } };
    }
    const saved = {
      ...current,
      title: note.title,
      content: note.content,
      backgroundColor: note.backgroundColor,
      imageIds: note.imageIds,
      revision: current.revision + 1,
      updatedAt: Date.now(),
    };
    this.records[index] = saved;
    imagesToSave.forEach((image) => this.images.set(image.id, image));
    imagesToRemove.forEach((id) => this.images.delete(id));
    return { kind: 'saved', note: { ...saved } };
  }

  async remove(ownerId: string, noteId: string): Promise<void> {
    const index = this.records.findIndex((note) => note.ownerId === ownerId && note.id === noteId);
    if (index < 0) throw new Error('A nota não existe ou não pertence ao usuário atual.');
    this.records.splice(index, 1);
  }

  async setPinned(ownerId: string, noteId: string, pinned: boolean): Promise<void> {
    const note = await this.get(ownerId, noteId);
    if (!note) throw new Error('A nota não existe ou não pertence ao usuário atual.');
    this.records[this.records.findIndex((item) => item.id === noteId)] = { ...note, pinned };
  }

  async reorder(ownerId: string, noteId: string, targetIndex: number): Promise<void> {
    const note = await this.get(ownerId, noteId);
    if (!note) throw new Error('A nota não existe ou não pertence ao usuário atual.');
    const group = this.ordered(
      this.records.filter((item) => item.ownerId === ownerId && item.pinned === note.pinned),
      'manual',
    );
    const [moved] = group.splice(
      group.findIndex((item) => item.id === noteId),
      1,
    );
    group.splice(Math.max(0, Math.min(targetIndex, group.length)), 0, moved);
    group.forEach((item, index) => {
      const current = this.records.find((record) => record.id === item.id);
      if (current) current.manualOrder = index;
    });
  }

  private ordered(notes: Note[], sort: NoteSortMode): Note[] {
    return [...notes].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return sort === 'manual'
        ? a.manualOrder - b.manualOrder || a.id.localeCompare(b.id)
        : b.updatedAt - a.updatedAt || a.id.localeCompare(b.id);
    });
  }
}

export class InMemoryNoteImageRepository implements NoteImageRepository {
  readonly records = new Map<string, NoteImage>();
  async save(image: NoteImage): Promise<void> {
    this.records.set(image.id, image);
  }
  async get(ownerId: string, noteId: string, imageId: string): Promise<NoteImage | undefined> {
    const image = this.records.get(imageId);
    return image?.ownerId === ownerId && image.noteId === noteId ? image : undefined;
  }
  async remove(_ownerId: string, _noteId: string, imageId: string): Promise<void> {
    this.records.delete(imageId);
  }
  async removeForNote(_ownerId: string, noteId: string): Promise<void> {
    for (const [id, image] of this.records) if (image.noteId === noteId) this.records.delete(id);
  }
}

export class InMemoryEditingSessionCoordinator implements EditingSessionCoordinator {
  active = false;
  async begin(): Promise<boolean> {
    return this.active;
  }
  end(): void {}
  announceSaved(): void {}
  close(): void {}
}

export function configureNotesApplication(
  repository: InMemoryNoteRepository,
  images = new InMemoryNoteImageRepository(),
  sessions = new InMemoryEditingSessionCoordinator(),
): NotesApplicationService {
  TestBed.configureTestingModule({
    providers: [
      NotesApplicationService,
      { provide: CURRENT_USER_PROVIDER, useValue: { getUserId: () => 'user-1' } },
      { provide: NOTE_REPOSITORY, useValue: repository },
      { provide: NOTE_IMAGE_REPOSITORY, useValue: images },
      { provide: EDITING_SESSION_COORDINATOR, useValue: sessions },
    ],
  });
  return TestBed.inject(NotesApplicationService);
}

export function sampleNotes(count: number, ownerId = 'user-1'): Note[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `note-${index}`,
    ownerId,
    title: `Title ${index}`,
    content: `Body ${index}`,
    createdAt: 1000 - index,
    updatedAt: 1000 - index,
    pinned: false,
    manualOrder: index,
    revision: 1,
    imageIds: [],
  }));
}
