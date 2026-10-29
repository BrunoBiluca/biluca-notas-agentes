import { Injectable } from '@angular/core';
import { EDITING_SESSION_COORDINATOR, EditingSessionCoordinator } from './service-contracts';

type SessionMessage =
  | { type: 'begin' | 'end'; noteId: string; tabId: string }
  | { type: 'query'; noteId: string; tabId: string; queryId: string }
  | { type: 'active'; noteId: string; tabId: string; queryId: string }
  | { type: 'saved'; noteId: string; tabId: string; revision: number };

@Injectable({ providedIn: 'root' })
export class BroadcastEditingSessionCoordinator implements EditingSessionCoordinator {
  private readonly tabId = crypto.randomUUID();
  private readonly channel =
    typeof BroadcastChannel === 'undefined'
      ? undefined
      : new BroadcastChannel('biluca-notes-editing');
  private readonly activeNotes = new Set<string>();
  private readonly activeTabs = new Map<string, Set<string>>();
  private readonly responses = new Map<string, (active: boolean) => void>();

  constructor() {
    if (this.channel)
      this.channel.onmessage = ({ data }: MessageEvent<SessionMessage>) => this.receive(data);
    globalThis.addEventListener?.('beforeunload', this.close);
  }

  async begin(noteId: string): Promise<boolean> {
    this.activeNotes.add(noteId);
    this.post({ type: 'begin', noteId, tabId: this.tabId });
    const queryId = crypto.randomUUID();
    const otherTabEditing = await new Promise<boolean>((resolve) => {
      const timer = globalThis.setTimeout(() => {
        this.responses.delete(queryId);
        resolve((this.activeTabs.get(noteId)?.size ?? 0) > 0);
      }, 40);
      this.responses.set(queryId, (active) => {
        globalThis.clearTimeout(timer);
        this.responses.delete(queryId);
        resolve(active);
      });
      this.post({ type: 'query', noteId, tabId: this.tabId, queryId });
    });
    return otherTabEditing;
  }

  end(noteId: string): void {
    this.activeNotes.delete(noteId);
    this.post({ type: 'end', noteId, tabId: this.tabId });
  }

  announceSaved(noteId: string, revision: number): void {
    this.post({ type: 'saved', noteId, tabId: this.tabId, revision });
  }

  close = (): void => {
    for (const noteId of this.activeNotes) this.post({ type: 'end', noteId, tabId: this.tabId });
    this.activeNotes.clear();
    this.channel?.close();
    globalThis.removeEventListener?.('beforeunload', this.close);
  };

  private receive(message: SessionMessage): void {
    if (!message || message.tabId === this.tabId) return;
    if (message.type === 'begin') this.addActiveTab(message.noteId, message.tabId);
    if (message.type === 'end') this.activeTabs.get(message.noteId)?.delete(message.tabId);
    if (message.type === 'query' && this.activeNotes.has(message.noteId)) {
      this.post({
        type: 'active',
        noteId: message.noteId,
        tabId: this.tabId,
        queryId: message.queryId,
      });
    }
    if (message.type === 'active') {
      this.addActiveTab(message.noteId, message.tabId);
      this.responses.get(message.queryId)?.(true);
    }
  }

  private addActiveTab(noteId: string, tabId: string): void {
    let tabs = this.activeTabs.get(noteId);
    if (!tabs) this.activeTabs.set(noteId, (tabs = new Set()));
    tabs.add(tabId);
  }

  private post(message: SessionMessage): void {
    this.channel?.postMessage(message);
  }
}

export const EDITING_SESSION_COORDINATOR_PROVIDER = {
  provide: EDITING_SESSION_COORDINATOR,
  useExisting: BroadcastEditingSessionCoordinator,
};
