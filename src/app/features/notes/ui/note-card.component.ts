import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NOTES_APPLICATION } from '../data-access/service-contracts';
import { getForegroundColor } from '../domain/note.factory';
import { Note } from '../domain/note.model';
import { NoteImagesComponent } from './note-images.component';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, NoteImagesComponent, RouterLink],
  template: `
    <mat-card
      class="note-card"
      data-testid="note-card"
      [style.backgroundColor]="note.backgroundColor || 'transparent'"
      [style.color]="foregroundColor"
    >
      <app-note-images [note]="note" />
      <mat-card-content>
        <button type="button" class="title" (click)="open.emit()">{{ note.title }}</button>
        @if (note.content) {
          <p class="content">{{ note.content }}</p>
        }
      </mat-card-content>
      @if (actionError()) {
        <p class="action-error" role="alert">{{ actionError() }}</p>
      }
      <mat-card-actions class="actions" aria-label="Ações da nota">
        <button
          matIconButton
          type="button"
          [attr.aria-label]="note.pinned ? 'Desafixar nota' : 'Fixar nota'"
          (click)="togglePin()"
        >
          <mat-icon [svgIcon]="note.pinned ? 'push_pin' : 'push_pin'" />
        </button>
        <button
          matIconButton
          type="button"
          [routerLink]="['/notes', note.id, 'edit']"
          aria-label="Editar nota"
        >
          <mat-icon svgIcon="edit" />
        </button>
        <button
          matIconButton
          type="button"
          [disabled]="sortMode !== 'manual' || position === 0"
          aria-label="Mover nota para cima"
          (click)="move(-1)"
        >
          <mat-icon svgIcon="arrow_upward" />
        </button>
        <button
          matIconButton
          type="button"
          [disabled]="sortMode !== 'manual' || position >= groupSize - 1"
          aria-label="Mover nota para baixo"
          (click)="move(1)"
        >
          <mat-icon svgIcon="arrow_downward" />
        </button>
        <button matIconButton type="button" aria-label="Remover nota" (click)="remove()">
          <mat-icon svgIcon="delete" />
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .note-card {
        border: 1px solid var(--mat-sys-outline);
        border-radius: var(--mat-sys-corner-medium);
        min-height: 9rem;
        overflow: hidden;
        padding: 0;
      }
      .note-card:hover,
      .note-card:focus-within {
        box-shadow: 0 3px 12px color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent);
      }
      .title {
        color: inherit;
        background: none;
        border: 0;
        cursor: pointer;
        font-family: var(--mat-sys-title-medium-font);
        font-size: var(--mat-sys-title-medium-size);
        font-weight: var(--mat-sys-title-medium-weight);
        line-height: var(--mat-sys-title-medium-line-height);
        padding: 0;
        text-align: left;
      }
      .title:focus-visible {
        border-radius: var(--mat-sys-corner-extra-small);
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 2px;
      }
      .content {
        line-height: var(--mat-sys-body-medium-line-height);
        white-space: pre-wrap;
      }
      .actions {
        justify-content: flex-end;
        margin: 0;
        opacity: 0;
        padding: 0.25rem 0.75rem 0.75rem;
        pointer-events: none;
      }
      .actions .mat-mdc-icon-button {
        color: inherit;
      }
      .note-card:hover .actions,
      .note-card:focus-within .actions {
        opacity: 1;
        pointer-events: auto;
      }
      .action-error {
        color: var(--mat-sys-error);
        margin: 0 1rem 0.5rem;
      }
      @media (hover: none) {
        .actions {
          opacity: 1;
          pointer-events: auto;
        }
      }
    `,
  ],
})
export class NoteCardComponent {
  @Input({ required: true }) note!: Note;
  @Input() position = 0;
  @Input() groupSize = 1;
  @Input() sortMode: 'updated' | 'manual' = 'updated';
  @Output() readonly open = new EventEmitter<void>();
  private readonly application = inject(NOTES_APPLICATION);
  readonly actionError = signal('');

  get foregroundColor(): string {
    return this.note.backgroundColor
      ? getForegroundColor(this.note.backgroundColor)
      : 'var(--mat-sys-on-surface)';
  }

  async togglePin(): Promise<void> {
    this.actionError.set('');
    try {
      await this.application.setPinned(this.note.id, !this.note.pinned);
    } catch (error) {
      this.actionError.set(
        error instanceof Error ? error.message : 'Não foi possível alterar a fixação.',
      );
    }
  }

  async move(delta: number): Promise<void> {
    this.actionError.set('');
    try {
      await this.application.reorder(this.note.id, this.position + delta);
    } catch (error) {
      this.actionError.set(
        error instanceof Error ? error.message : 'Não foi possível mover a nota.',
      );
    }
  }

  async remove(): Promise<void> {
    if (!globalThis.confirm('Remover esta nota e suas imagens?')) return;
    this.actionError.set('');
    try {
      await this.application.delete(this.note.id);
    } catch (error) {
      this.actionError.set(
        error instanceof Error ? error.message : 'Não foi possível remover a nota.',
      );
    }
  }
}
