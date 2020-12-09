import { ItemView, WorkspaceLeaf } from "obsidian";
import Store from './store';

export default class DynasyncView extends ItemView {
  status: HTMLElement;
  store: Store;

  constructor(leaf: WorkspaceLeaf, store: Store) {
    super(leaf);
    this.store = store;
  }

  getViewType(): string {
    return 'dynasync';
  }

  getDisplayText(): string {
    return "DynaSync";
  }

  async onOpen(): Promise<void> {
    const dom = (this as any).contentEl as HTMLElement;

    const button = dom.createEl('button', {
      text: 'Sync',
    });
    button.onClickEvent(() => {
      this.store.trigger('sync');
    });

    this.status = dom.createEl('div', {
      text: '-',
    });

    this.store.on('status.changed', () => {
      this.redraw();
    });

    this.redraw();
  }

  async redraw(): Promise<void> {
    console.log('redraw');
    this.status.setText(this.store.status);
  }
}
