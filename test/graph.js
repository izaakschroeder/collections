
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['../lib/graph', 'assert'], function(Graph, assert) {
	
	"use strict";

	Object.freeze = function() {}

	function compare(a,b) {
		if (a > b) return 1;
		if (a < b) return -1;
		return 0;
	}

	function isEdge(a, b) {
		return (
			(a === 'a' && (b === 'g' || b === 'j')) ||
			(a === 'b' && (b === 'a' || b === 'i')) ||
			(a === 'c' && (b === 'e' || b === 'h')) ||
			(a === 'e' && (b === 'd' || b === 'h' || b === 'j')) ||
			(a === 'f' && (b === 'i')) ||
			(a === 'g' && (b === 'b' || b === 'f' ))
		);
	}

	var vertices = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
		g = new Graph(vertices, isEdge);


	describe('Graph', function() {
		describe('successors', function() {
			it('should obey the successor function', function() {
				vertices.forEach(function(v) {
					g.successors(v).forEach(function(u) {
						assert.ok(isEdge(v,u));	
					});
				});	
			});
		});

		describe('cardinality', function() {
			it('should return the number of neighbors of a vertex', function() {
				assert.strictEqual(g.cardinality('a'), 2);
				assert.strictEqual(g.cardinality('b'), 2);
				assert.strictEqual(g.cardinality('c'), 2);
				assert.strictEqual(g.cardinality('d'), 0);
				assert.strictEqual(g.cardinality('e'), 3);
				assert.strictEqual(g.cardinality('f'), 1);
			})
		})

		describe('depthFirstForest', function() {

		});

		describe('preOrder', function() {

		});

		describe('postOrder', function() {

		});

		describe('maximumCardinalityOrder', function() {
			
		});

		describe('transpose', function() {
			it('should invert the successor function', function() {
				var t = g.transpose();
				vertices.forEach(function(v) {
					t.successors(v).forEach(function(u) {
						assert.ok(isEdge(u,v));	
					});
				});	
			});
			it('should invert the predecessor function', function() {
				var t = g.transpose();
				vertices.forEach(function(v) {
					t.predecessors(v).forEach(function(u) {
						assert.ok(isEdge(v,u));	
					});
				});	
			})
		});

		describe('stronglyConnectedComponents', function() {
			it('should return only single nodes on graphs with no cycles', function() {
				var f = Graph.create(vertices, function(u,v) { return u === v; });
				f.stronglyConnectedComponents().forEach(function(group) {
					assert.strictEqual(group.childNodes.length, 0);
				});
			});
			it('should produce |V| groups on graphs with no cycles', function() {
				var f = Graph.create(vertices, function(u,v) { return u === v; });
				assert.strictEqual(f.stronglyConnectedComponents().length, vertices.length);
			});
			it('should identify strongly connected components', function() {
				g.stronglyConnectedComponents().forEach(function(group) {
					//console.log(group.order(Graph.preOrder).join(', '));
				})
			})
		})

		describe('color', function() {

			function maxColors(g) {
				return g.color().reduce(function(max, kv) {
					return Math.max(kv.value + 1, max);
				}, 0);
			}

			it('should use n colors for graphs of the family Kn', function() {
				for (var i = 1; i < 6; ++i)
					assert.strictEqual(i, maxColors(Graph.K(i)));
			});

			it('should return a color for each vertex', function() {
				assert.strictEqual(g.color().length, g.vertices.length);
			});

			it('should color chordal graphs optimally', function() {
				var g = Graph.create({
					a: [ 'b', 'c' ],
					b: [ 'a', 'c', 'e', 'f', 'g' ],
					c: [ 'a', 'b', 'd', 'e' ],
					d: [ 'c', 'e' ],
					e: [ 'b', 'c', 'd', 'g', 'h' ],
					f: [ 'b', 'g' ],
					g: [ 'b', 'e', 'f', 'h' ],
					h: [ 'e', 'g' ]
				});
				assert.strictEqual(maxColors(g), 4);

				g = Graph.create({
					a: [ 'b', 'c' ],
					b: [ 'a', 'c', 'd', 'e' ],
					c: [ 'a', 'b', 'e' ],
					d: [ 'b', 'e' ],
					e: [ 'b', 'c', 'd' ]
				});
				assert.strictEqual(maxColors(g), 3);
			});

			it('should color trees with 2 colors', function() {
				g = Graph.create({
					a: [ 'b', 'c' ],
					b: [ 'a', 'd', 'e', 'f' ],
					c: [ 'a', 'g', 'h' ],
					d: [ 'b' ],
					e: [ 'b' ],
					f: [ 'b' ],
					g: [ 'c' ],
					h: [ 'c' ]
				});
				assert.strictEqual(maxColors(g), 2);
			});

			it('should color bipartite graphs with 2 colors', function() {
				var q;
				g = Graph.create(q = {
					a: [ 'h', 'g', 'f' ],
					b: [ 'e', 'g', 'h' ],
					c: [ 'e', 'f', 'h' ],
					d: [ 'e', 'f', 'g' ],
					e: [ 'b', 'c', 'd' ],
					f: [ 'a', 'c', 'd' ],
					g: [ 'a', 'b', 'd' ],
					h: [ 'a', 'b', 'c' ]
				});
				assert.strictEqual(maxColors(g), 2);
			});
		})
	})

});




