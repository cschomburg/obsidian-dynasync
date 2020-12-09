export type Node = {
	id: string;
	content: string;
	note: string;
	checked: boolean;
	checkbox: boolean;
	color: number;
	heading: number;
	created: number;
	modified: number;
	collapsed: boolean;
	children: string[];
}

export type Document = {
	file_id: string;
	title: string;
	version: number;
	nodes: Node[];
}

export default class Client {
	baseUrl = 'https://dynalist.io/api/v1/';
	token: string;

	constructor(token: string) {
		this.token = token;
	}

	async listFiles(): Promise<any> {
		const body = this.request('file/list', {});
		return body;
	}

	async readDocument(id: string): Promise<Document> {
		const body = this.request('doc/read', {
			file_id: id,
		});
		return body;
	}

	async request(endpoint: string, data: Record<string, any>): Promise<any> {
		data.token = this.token;
		const request = new Request(this.baseUrl + endpoint, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
			body: JSON.stringify(data),
		});

		const resp = await fetch(request);
		const body = await resp.json();
		return body;
	}
}
