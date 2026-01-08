import type { DependencyGraph } from './types.js';

/**
 * DependencyGraph manages schema dependencies and performs cycle detection.
 * Uses Tarjan's algorithm for finding strongly connected components (cycles).
 */
export class DependencyGraphBuilder implements DependencyGraph {
	nodes: Set<string> = new Set();
	edges: Map<string, Set<string>> = new Map();
	cycles: Set<Set<string>> = new Set();

	/**
	 * Add a node to the graph.
	 */
	addNode(nodeId: string): void {
		if (!this.nodes.has(nodeId)) {
			this.nodes.add(nodeId);
			this.edges.set(nodeId, new Set());
		}
	}

	/**
	 * Add a directed edge from one node to another.
	 */
	addEdge(fromId: string, toId: string): void {
		this.addNode(fromId);
		this.addNode(toId);

		const edgeSet = this.edges.get(fromId);
		if (edgeSet) {
			edgeSet.add(toId);
		}
	}

	/**
	 * Check if there is a path from one node to another.
	 */
	hasPath(fromId: string, toId: string): boolean {
		if (fromId === toId) return true;

		const visited = new Set<string>();
		const stack = [fromId];

		while (stack.length > 0) {
			const current = stack.pop()!;
			if (visited.has(current)) continue;
			visited.add(current);

			if (current === toId) return true;

			const neighbors = this.edges.get(current);
			if (neighbors) {
				for (const neighbor of neighbors) {
					if (!visited.has(neighbor)) {
						stack.push(neighbor);
					}
				}
			}
		}

		return false;
	}

	/**
	 * Detect cycles in the graph using Tarjan's algorithm.
	 * Returns a Set of Sets, where each inner Set represents a strongly connected component.
	 */
	detectCycles(): Set<Set<string>> {
		const cycles = new Set<Set<string>>();
		const stack: string[] = [];
		const ids = new Map<string, number>();
		const lowlinks = new Map<string, number>();
		const onStack = new Set<string>();
		let index = 0;

		const strongConnect = (nodeId: string) => {
			ids.set(nodeId, index);
			lowlinks.set(nodeId, index);
			index += 1;
			stack.push(nodeId);
			onStack.add(nodeId);

			const neighbors = this.edges.get(nodeId) || new Set();
			for (const neighbor of neighbors) {
				if (!ids.has(neighbor)) {
					strongConnect(neighbor);
					const neighborLowlink = lowlinks.get(neighbor) || 0;
					const currentLowlink = lowlinks.get(nodeId) || 0;
					lowlinks.set(nodeId, Math.min(currentLowlink, neighborLowlink));
				} else if (onStack.has(neighbor)) {
					const neighborId = ids.get(neighbor) || 0;
					const currentLowlink = lowlinks.get(nodeId) || 0;
					lowlinks.set(nodeId, Math.min(currentLowlink, neighborId));
				}
			}

			// If nodeId is a root node, pop the stack and print an SCC
			if ((lowlinks.get(nodeId) || 0) === (ids.get(nodeId) || 0)) {
				const scc = new Set<string>();
				let node: string;
				do {
					node = stack.pop()!;
					onStack.delete(node);
					scc.add(node);
				} while (node !== nodeId);

				// Only report cycles (SCC with more than 1 node, or self-loops)
				if (
					scc.size > 1 ||
					(scc.has(nodeId) && this.edges.get(nodeId)?.has(nodeId))
				) {
					cycles.add(scc);
				}
			}
		};

		for (const node of this.nodes) {
			if (!ids.has(node)) {
				strongConnect(node);
			}
		}

		this.cycles = cycles;
		return cycles;
	}

	/**
	 * Topological sort of the graph.
	 * Returns a list of nodes in topological order (dependencies first).
	 * Throws error if cycle is detected.
	 */
	topologicalSort(): string[] {
		const visited = new Set<string>();
		const result: string[] = [];

		const visit = (nodeId: string, visiting: Set<string> = new Set()): void => {
			if (visited.has(nodeId)) return;
			if (visiting.has(nodeId)) {
				throw new Error(`Cycle detected involving node: ${nodeId}`);
			}

			visiting.add(nodeId);
			const neighbors = this.edges.get(nodeId) || new Set();
			for (const neighbor of neighbors) {
				visit(neighbor, visiting);
			}
			visiting.delete(nodeId);

			visited.add(nodeId);
			result.push(nodeId);
		};

		for (const node of this.nodes) {
			if (!visited.has(node)) {
				visit(node);
			}
		}

		// Return in reverse order so that nodes with no dependencies come first
		return result.reverse();
	}

	/**
	 * Get reverse topological order (useful for build order).
	 */
	reverseTopologicalSort(): string[] {
		return this.topologicalSort().reverse();
	}

	/**
	 * Check if the graph is acyclic.
	 */
	isAcyclic(): boolean {
		try {
			this.topologicalSort();
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get all nodes that depend on a given node (transitive closure).
	 */
	getDependents(nodeId: string): Set<string> {
		const dependents = new Set<string>();
		const stack = [nodeId];
		const visited = new Set<string>();

		while (stack.length > 0) {
			const current = stack.pop()!;
			if (visited.has(current)) continue;
			visited.add(current);

			// Find all nodes that have edges to current (reverse edges)
			for (const [source, targets] of this.edges) {
				if (targets.has(current) && source !== nodeId) {
					dependents.add(source);
					stack.push(source);
				}
			}
		}

		return dependents;
	}

	/**
	 * Get all nodes that a given node depends on (transitive closure).
	 */
	getDependencies(nodeId: string): Set<string> {
		const dependencies = new Set<string>();
		const stack = [nodeId];
		const visited = new Set<string>();

		while (stack.length > 0) {
			const current = stack.pop()!;
			if (visited.has(current)) continue;
			visited.add(current);

			const neighbors = this.edges.get(current) || new Set();
			for (const neighbor of neighbors) {
				if (neighbor !== nodeId) {
					dependencies.add(neighbor);
					stack.push(neighbor);
				}
			}
		}

		return dependencies;
	}

	/**
	 * Generate a GraphViz DOT representation for visualization.
	 */
	toDot(): string {
		let dot = 'digraph DependencyGraph {\n';

		// Add nodes
		for (const node of this.nodes) {
			dot += `  "${node}";\n`;
		}

		// Add edges
		for (const [source, targets] of this.edges) {
			for (const target of targets) {
				dot += `  "${source}" -> "${target}";\n`;
			}
		}

		// Highlight cycles if present
		for (const cycle of this.cycles) {
			const nodeList = Array.from(cycle).join('", "');
			dot += `  { rank=same; "${nodeList}" }\n`;
		}

		dot += '}\n';
		return dot;
	}

	/**
	 * Get a summary of the graph structure.
	 */
	summary(): {
		nodeCount: number;
		edgeCount: number;
		hasCycles: boolean;
		cycleCount: number;
	} {
		let edgeCount = 0;
		for (const targets of this.edges.values()) {
			edgeCount += targets.size;
		}

		return {
			nodeCount: this.nodes.size,
			edgeCount,
			hasCycles: this.cycles.size > 0,
			cycleCount: this.cycles.size,
		};
	}
}
