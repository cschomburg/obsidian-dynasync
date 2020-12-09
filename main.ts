import {
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	WorkspaceLeaf,
	MarkdownView
} from 'obsidian';

import DynasyncSettings from './settings';
import Store from './store';
import DynasyncView from './view';
import { exportDocument } from './src/utils';

function extractFrontmatter(source: string): string {
	if (!source.startsWith('---')) {
		return '';
	}

	const end = source.indexOf("\n---\n", 4);
	if (end < 0) {
		return '';
	}

	return source.substring(0, end + 5) + "\n";
}

export default class DynasyncPlugin extends Plugin {
	store: Store;
	view: DynasyncView;

	async onload() {
		console.log('loading DynaSync');

		const settings = (await this.loadData()) || new DynasyncSettings();
		this.store = new Store(settings);

		this.addRibbonIcon('dice', 'Dynasync Plugin', () => {
			new Notice('This is a notice!');
		});

		// this.addStatusBarItem().setText('Status Bar Text');

		this.addCommand({
			id: 'refresh-dynasync',
			name: 'Refresh DynaSync',
			callback: () => {
				this.store.trigger('sync');
			},
		});

		this.addSettingTab(new DynasyncSettingTab(this.app, this));

		this.registerView('dynasync', (leaf: WorkspaceLeaf) =>
			(this.view = new DynasyncView(leaf, this.store))
		);

		this.initLeaf();

		this.store.on('sync', () => {
			console.log('syncing');
			this.sync();
		});
	}

	initLeaf(): void {
		if (!this.app.workspace.getLeavesOfType('dynasync').length) {
			this.app.workspace.getRightLeaf(false).setViewState({
				type: 'dynasync',
			});
		}
	}

	onunload() {
		console.log('unloading plugin');
		this.app.workspace
			.getLeavesOfType('dynasync')
			.forEach((leaf) => leaf.detach());
	}

	async sync(): Promise<void> {
		this.store.setStatus('syncing ...');

		const view = this.app.workspace.activeLeaf.view;
		if (!(view instanceof MarkdownView)) {
			this.store.setStatus('failed');
			return;
		}
		const content = view.sourceMode.get();
		const frontmatter = extractFrontmatter(content);

		const file = this.app.workspace.getActiveFile();
		const metadata = this.app.metadataCache.getFileCache(file);
		const documentId = metadata.frontmatter && metadata.frontmatter.dynasync;
		if (!documentId) {
			this.store.setStatus('disabled');
			return;
		}

		const body = await this.store.client.readDocument(documentId);
		const doc = exportDocument(body);

		const newContent = frontmatter + doc;
		view.sourceMode.set(newContent, true);

		this.store.setStatus('synced');
	}
}

class DynasyncSettingTab extends PluginSettingTab {
	display(): void {
		let {containerEl} = this;
		const plugin: DynasyncPlugin = (this as any).plugin;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('API token')
			.setDesc('Dynalist API token')
			.addText(text => text.setPlaceholder('Enter your secret')
				.setValue(plugin.store.settings.apiToken)
				.onChange(async (value) => {
					plugin.store.settings.apiToken = value;
					await plugin.saveData(plugin.store.settings);
					console.log('saved', plugin.store.settings);
				}));
	}
}
