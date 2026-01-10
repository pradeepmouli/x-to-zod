import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyGraphBuilder } from '../../src/SchemaProject/DependencyGraph.js';

describe('DependencyGraph', () => {
	let graph: DependencyGraphBuilder;

	beforeEach(() => {
		graph = new DependencyGraphBuilder();
	});

	describe('addNode', () => {
		it('should add a single node', () => {
			graph.addNode('user');
			expect(graph.nodes.has('user')).toBe(true);
		});

		it('should not duplicate when adding same node twice', () => {
			graph.addNode('user');
			graph.addNode('user');
			expect(graph.nodes.size).toBe(1);
		});

		it('should initialize empty edge set for new node', () => {
			graph.addNode('user');
			expect(graph.edges.get('user')).toEqual(new Set());
		});
	});

	describe('addEdge', () => {
		it('should add nodes automatically when adding edge', () => {
			graph.addEdge('user', 'profile');
			expect(graph.nodes.has('user')).toBe(true);
			expect(graph.nodes.has('profile')).toBe(true);
		});

		it('should create edge between two nodes', () => {
			graph.addEdge('user', 'profile');
			expect(graph.edges.get('user')?.has('profile')).toBe(true);
		});

		it('should support multiple outgoing edges from one node', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('user', 'settings');
			expect(graph.edges.get('user')?.size).toBe(2);
		});

		it('should support multiple incoming edges to one node', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('settings', 'profile');
			const incoming = Array.from(graph.edges.entries())
				.filter(([_, targets]) => targets.has('profile'))
				.map(([source]) => source);
			expect(incoming).toContain('user');
			expect(incoming).toContain('settings');
		});

		it('should not duplicate edges', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('user', 'profile');
			expect(graph.edges.get('user')?.size).toBe(1);
		});
	});

	describe('hasPath', () => {
		it('should return true for same node', () => {
			graph.addNode('user');
			expect(graph.hasPath('user', 'user')).toBe(true);
		});

		it('should return true for direct edge', () => {
			graph.addEdge('user', 'profile');
			expect(graph.hasPath('user', 'profile')).toBe(true);
		});

		it('should return false for no edge', () => {
			graph.addEdge('user', 'profile');
			expect(graph.hasPath('profile', 'user')).toBe(false);
		});

		it('should return true for indirect path', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'settings');
			expect(graph.hasPath('user', 'settings')).toBe(true);
		});

		it('should return false for non-existent path', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('post', 'comment');
			expect(graph.hasPath('user', 'comment')).toBe(false);
		});
	});

	describe('topologicalSort', () => {
		it('should return nodes in valid topological order for acyclic graph', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'settings');
			graph.addEdge('user', 'settings');

			const sorted = graph.topologicalSort();
			expect(sorted).toHaveLength(3);
			expect(sorted.indexOf('user')).toBeLessThan(sorted.indexOf('profile'));
			expect(sorted.indexOf('profile')).toBeLessThan(
				sorted.indexOf('settings'),
			);
		});

		it('should handle single node', () => {
			graph.addNode('user');
			const sorted = graph.topologicalSort();
			expect(sorted).toEqual(['user']);
		});

		it('should handle disconnected components', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('post', 'comment');

			const sorted = graph.topologicalSort();
			expect(sorted).toHaveLength(4);
			expect(sorted.indexOf('user')).toBeLessThan(sorted.indexOf('profile'));
			expect(sorted.indexOf('post')).toBeLessThan(sorted.indexOf('comment'));
		});

		it('should throw error on cycle', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'settings');
			graph.addEdge('settings', 'user'); // Create cycle

			expect(() => graph.topologicalSort()).toThrow('Cycle detected');
		});
	});

	describe('detectCycles', () => {
		it('should find no cycles in acyclic graph', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'settings');

			const cycles = graph.detectCycles();
			expect(cycles.size).toBe(0);
		});

		it('should detect simple 2-node cycle', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'user');

			const cycles = graph.detectCycles();
			expect(cycles.size).toBe(1);
			const cycle = Array.from(cycles)[0];
			expect(cycle.has('user')).toBe(true);
			expect(cycle.has('profile')).toBe(true);
		});

		it('should detect 3-node cycle', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'settings');
			graph.addEdge('settings', 'user');

			const cycles = graph.detectCycles();
			expect(cycles.size).toBe(1);
			const cycle = Array.from(cycles)[0];
			expect(cycle.size).toBe(3);
		});

		it('should detect multiple cycles', () => {
			// Cycle 1: A -> B -> A
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'user');

			// Cycle 2: C -> D -> E -> C
			graph.addEdge('post', 'comment');
			graph.addEdge('comment', 'thread');
			graph.addEdge('thread', 'post');

			const cycles = graph.detectCycles();
			expect(cycles.size).toBe(2);
		});

		it('should detect self-loop', () => {
			graph.addEdge('user', 'user');

			const cycles = graph.detectCycles();
			expect(cycles.size).toBe(1);
		});

		it('should not report isolated components as cycles', () => {
			graph.addNode('isolated');
			const cycles = graph.detectCycles();
			expect(cycles.size).toBe(0);
		});
	});

	describe('reverseTopologicalSort', () => {
		it('should return reverse of topological sort', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'settings');

			const forward = graph.topologicalSort();
			const reverse = graph.reverseTopologicalSort();

			expect(reverse.length).toBe(forward.length);
			expect(reverse[0]).toBe(forward[forward.length - 1]);
			expect(reverse[reverse.length - 1]).toBe(forward[0]);
		});
	});

	describe('isAcyclic', () => {
		it('should return true for acyclic graph', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'settings');

			expect(graph.isAcyclic()).toBe(true);
		});

		it('should return false for cyclic graph', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'user');

			expect(graph.isAcyclic()).toBe(false);
		});

		it('should return true for empty graph', () => {
			expect(graph.isAcyclic()).toBe(true);
		});
	});

	describe('getDependencies', () => {
		it('should return all transitive dependencies', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'settings');
			graph.addEdge('user', 'settings'); // Direct edge too

			const deps = graph.getDependencies('user');
			expect(deps.has('profile')).toBe(true);
			expect(deps.has('settings')).toBe(true);
			expect(deps.size).toBe(2);
		});

		it('should not include the node itself', () => {
			graph.addEdge('user', 'profile');
			const deps = graph.getDependencies('user');
			expect(deps.has('user')).toBe(false);
		});

		it('should return empty set for leaf node', () => {
			graph.addEdge('user', 'profile');
			const deps = graph.getDependencies('profile');
			expect(deps.size).toBe(0);
		});

		it('should handle cycles gracefully', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'user');
			// Should not infinitely loop
			const deps = graph.getDependencies('user');
			expect(deps.has('profile')).toBe(true);
		});
	});

	describe('getDependents', () => {
		it('should return all transitive dependents', () => {
			graph.addEdge('settings', 'profile');
			graph.addEdge('profile', 'user');
			graph.addEdge('settings', 'user'); // Direct edge too

			const dependents = graph.getDependents('user');
			expect(dependents.has('profile')).toBe(true);
			expect(dependents.has('settings')).toBe(true);
			expect(dependents.size).toBe(2);
		});

		it('should not include the node itself', () => {
			graph.addEdge('profile', 'user');
			const dependents = graph.getDependents('user');
			expect(dependents.has('user')).toBe(false);
		});

		it('should return empty set for root node', () => {
			graph.addEdge('user', 'profile');
			const dependents = graph.getDependents('user');
			expect(dependents.size).toBe(0);
		});
	});

	describe('toDot', () => {
		it('should generate valid DOT format', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('profile', 'settings');

			const dot = graph.toDot();
			expect(dot).toContain('digraph DependencyGraph');
			expect(dot).toContain('"user"');
			expect(dot).toContain('"profile"');
			expect(dot).toContain('"settings"');
			expect(dot).toContain('"user" -> "profile"');
			expect(dot).toContain('"profile" -> "settings"');
			expect(dot.startsWith('digraph')).toBe(true);
			expect(dot.endsWith('}\n')).toBe(true);
		});

		it('should handle empty graph', () => {
			const dot = graph.toDot();
			expect(dot).toContain('digraph DependencyGraph');
			expect(dot).toContain('}');
		});
	});

	describe('summary', () => {
		it('should provide correct node count', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('post', 'comment');

			const summary = graph.summary();
			expect(summary.nodeCount).toBe(4);
		});

		it('should provide correct edge count', () => {
			graph.addEdge('user', 'profile');
			graph.addEdge('user', 'settings');
			graph.addEdge('profile', 'settings');

			const summary = graph.summary();
			expect(summary.edgeCount).toBe(3);
		});

		it('should correctly report acyclic status', () => {
			graph.addEdge('user', 'profile');
			let summary = graph.summary();
			expect(summary.hasCycles).toBe(false);
			expect(summary.cycleCount).toBe(0);

			// Add cycle
			graph.addEdge('profile', 'user');
			graph.detectCycles();
			summary = graph.summary();
			expect(summary.hasCycles).toBe(true);
			expect(summary.cycleCount).toBeGreaterThan(0);
		});
	});

	describe('complex scenarios', () => {
		it('should handle large DAG', () => {
			// Create a large acyclic graph
			for (let i = 0; i < 20; i++) {
				graph.addEdge(`node${i}`, `node${i + 1}`);
			}

			expect(graph.isAcyclic()).toBe(true);
			const sorted = graph.topologicalSort();
			expect(sorted).toHaveLength(21);
		});

		it('should handle diamond dependency', () => {
			graph.addEdge('a', 'b');
			graph.addEdge('a', 'c');
			graph.addEdge('b', 'd');
			graph.addEdge('c', 'd');

			const sorted = graph.topologicalSort();
			expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('b'));
			expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('c'));
			expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('d'));
			expect(sorted.indexOf('c')).toBeLessThan(sorted.indexOf('d'));
		});
	});
});
