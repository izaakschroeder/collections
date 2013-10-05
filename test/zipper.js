

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['../lib/zipper', '../lib/lazy', 'assert'], function(Zipper, Lazy, assert) {
	
	"use strict";

	var Node = Zipper.Node,
		Location = Zipper.Location,
		Context = Zipper.Context;

	describe('Zipper', function() {
		var root = new Node([ new Node([ new Node([], "e") ], "b"), new Node([], "c"), new Node([], "d") ], "a"),
			location = new Location(root, Context.top);

		describe('parentNode', function() {
			it('should be null for root nodes', function() {
				assert.strictEqual(location.parentNode, null);
			});
			it('should return a node parent', function() {
				assert.strictEqual(location.childNodes[0].parentNode.value, 'a');
			});
		})

		describe('childNodes', function() {
			it('should return undefined for negative indices', function() {
				assert.strictEqual(location.childNodes[-1], undefined);
			});
			it('should return undefined for children out of bounds', function() {
				assert.strictEqual(location.childNodes[17], undefined);
			})
			it('should', function() {
				assert.strictEqual(location.childNodes[1].value, 'c');
				assert.strictEqual(location.childNodes[0].firstChild.value, 'e');
				
			});
		});

		describe('firstChild', function() {
			it('should return null for nodes with no children', function() {
				assert.strictEqual(location.childNodes[1].firstChild, null);
			})
			it('should return the first child of the current node', function() {
				assert.strictEqual(location.firstChild.value, 'b');
			});
		});

		describe('lastChild', function() {
			it('should return null for nodes with no children', function() {
				assert.strictEqual(location.childNodes[1].lastChild, null);
			})
			it('should return the last child of the current node', function() {
				assert.strictEqual(location.lastChild.value, 'd');
			})
		})

		describe('appendChild', function() {
			it('should return a new zipper with the added node', function() {
				var updated = location.appendChild('x');
				assert.strictEqual(updated.childNodes.length, 4);
				assert.strictEqual(updated.lastChild.value, 'x');
			});
		});

		describe('removeChild', function() {
			it('should throw an exception removing negative indices', function() {
				assert.throws(function() {
					location.removeChild(-1);
				})
			})
			it('should throw an exception removing indices out of bounds', function() {
				assert.throws(function() {
					location.removeChild(16);
				});
			});
			it('should return a new zipper with the removed node', function() {
				var updated = location.removeChild(0);
				assert.strictEqual(location.childNodes.length, 3);
				assert.strictEqual(updated.childNodes.length, 2);
				assert.strictEqual(updated.firstChild.value, 'c');
			});
		});

		describe('forEach', function() {
			it('should cover every node in the zipper', function() {
				var visited = { a: false, b: false, c: false, d: false, e: false };
				location.forEach(function(value) {
					visited[value] = true;
				});
				for (var v in visited)
					assert.ok(visited[v]);
			});
		});

		describe('filter', function() {
			it('should remove elements not matched by the filter', function() {
				var result = location.filter(function(value) {
					return value === 'a' || value === 'd' || value === 'x';
				});
				assert.strictEqual(result.length, 2);
				assert.ok(~result.indexOf('a'));
				assert.ok(~result.indexOf('d'));
			});
		});

		describe('map', function() {
			it('should create a new zipper with updated values', function() {
				var result = location.map(function(value) {
					return 'x' + value;
				});
				assert.strictEqual(result.value, 'xa');
				assert.strictEqual(result.firstChild.value, 'xb');
				assert.strictEqual(result.childNodes[1].value, 'xc');
				assert.strictEqual(result.lastChild.value, 'xd');
				assert.strictEqual(result.childNodes[0].firstChild.value, 'xe');
			});
		});

		describe('reduce', function() {
			it('should cover all elements of the zipper', function() {
				assert.strictEqual(location.reduce(function(prev, cur) {
					return prev + cur;
				}), 'abecd');
				assert.strictEqual(location.reduce(function(prev, cur) {
					return prev + cur;
				}, 'x'), 'xabecd');
			});
		});

		describe('laziness', function() {
			var lazy = Lazy.fromCollection(location);
			it('should iterate over all elements', function() {
				var visited = { a: false, b: false, c: false, d: false, e: false };
				lazy.forEach(function(value) {
					visited[value] = true;
				});
				for (var v in visited)
					assert.ok(visited[v]);
			})
		})
	});
});



