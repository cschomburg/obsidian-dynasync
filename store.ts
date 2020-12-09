import { Events } from 'obsidian';
import DynasyncSettings from './settings';
import Client from './src/api';

export default class Store extends Events {
	settings: DynasyncSettings;
	client: Client;
	status = 'ready';

	constructor(settings: DynasyncSettings) {
		super();
		this.settings = settings;
		this.client = new Client(settings.apiToken);
	}

	setStatus(status: string): void {
		this.status = status;
		this.trigger('status.changed', { status });
		console.log('status changed', status);
	}
}
