import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { MatCardImage } from '@angular/material/card';
import { Note } from '../domain/note.model';
import { NOTES_APPLICATION } from '../data-access/service-contracts';

@Component({
  selector: 'app-note-images',
  standalone: true,
  imports: [MatCardImage],
  template: `
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    @if (urls().length) {
      <div class="images">
        @for (image of urls(); track image.id) {
          <img
            mat-card-image
            [src]="image.url"
            [alt]="'Imagem da nota ' + note.title"
          />
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .images {
        display: grid;
        gap: 0;
      }
      img.mat-mdc-card-image {
        display: block;
        height: auto;
        max-height: 22rem;
        margin: 0;
        object-fit: cover;
        width: 100%;
      }
      .error {
        color: var(--mat-sys-error);
        margin: 0.75rem;
      }
    `,
  ],
})
export class NoteImagesComponent implements OnChanges {
  @Input({ required: true }) note!: Note;
  readonly urls = signal<{ id: string; url: string }[]>([]);
  readonly error = signal('');
  private readonly application = inject(NOTES_APPLICATION);

  ngOnChanges(): void {
    void this.loadUrls();
  }

  private async loadUrls(): Promise<void> {
    this.error.set('');
    try {
      const loaded = await Promise.all(
        this.note.imageIds.map(async (id) => {
          const url = await this.application.imageUrl(id, this.note.id);
          return url ? { id, url } : undefined;
        }),
      );
      this.urls.set(loaded.filter((item): item is { id: string; url: string } => !!item));
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Não foi possível carregar as imagens.',
      );
    }
  }
}
