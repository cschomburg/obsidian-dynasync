import type { Document, Node } from './api';

export type Visitor = (node: Node, parents: Node[]) => void;

export class NodeTree {
	nodes: Record<string, Node>;

	constructor(nodes: Node[]) {
		this.nodes = {};
		nodes.forEach((node) => {
			this.nodes[node.id] = node;
		});
	}

	get(id: string): Node {
		return this.nodes[id];
	}

	walk(visit: Visitor): void {
		this.doWalk('root', [], visit);
	}

	doWalk(id: string, parents: Node[], visit: Visitor): void {
		const node = this.get(id);
		visit(node, parents);

		const nodes = [...parents, node];
		if (node.children) {
			node.children.forEach((child) => {
				this.doWalk(child, nodes, visit);
			});
		}
	}
}

export function exportDocument(doc: Document): string {
	const tree = new NodeTree(doc.nodes);

	const lines = [];
	lines.push('# ' + doc.title);
	lines.push('');

	tree.walk((node, parents) => {
		if (node.id !== 'root') {
			lines.push(exportNode(node, parents));
		}
	});

	return lines.join("\n");
}

export function exportNode(node: Node, parents: Node[]): string {
	let out = node.content;

	if (node.heading) {
		out = "\n" + '#'.repeat(node.heading) + ' ';
	} else {
		const indent = getIndent(parents);
		out = ' '.repeat(indent) + '- ';
	}

	if (node.checkbox) {
		if (node.checked) {
			out += '[x] ';
		} else {
			out += '[ ] ';
		}
	}

	out += node.content;

	if (node.heading) {
		out += "\n";
	}

	return out;
}

export function getIndent(parents: Node[]): number {
	const level = parents.filter((n) => !n.heading).length;
	return (level - 1) * 2;
}
