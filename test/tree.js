if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['com.izaakschroeder.random', '../lib/tree', 'assert'], function(Random, Tree, assert) {

	"use strict";

	function isOrdered(tree) {
		var result = true, prev = undefined;
		tree.forEach(function(cur) {
			if (prev === undefined)
				return prev = cur;
			
			if (tree.compare(cur, prev) < 0)
				result = false ;
		})
		return result;
	}

	function blackHeights(tree) {
		function bp(n, tree) {
			if (tree.height === 0)
				return [n+1];
			n = (tree.color === Tree.Red) ? n : n+1;
			return bp(n, tree.left).concat(bp(n, tree.right))
		}
		return bp(0, tree);
	}

	function isBlackHeightsIdentical(tree) {
		var results = blackHeights(tree), first = results[0];
		return results.every(function(item) { return item === first; });
	}

	function reds(c, tree) {
		if (tree.height === 0)
			return true;
		if (c === Tree.Red && tree.color === Tree.Red)
			return false;
		return reds(tree.color, tree.left) && reds(tree.color, tree.right);
	}

	function isRedSeparate(tree) {
		return reds(Tree.Black, tree);
	}

	function isBalanced(tree) {
		return isBlackHeightsIdentical(tree) && isRedSeparate(tree);
	}

	function isLeftLeaning(tree) {
		if (tree.height === 0)
			return true;
		if (tree.color === Tree.Black && tree.right.color === Tree.Red)
			return false;
		return isLeftLeaning(tree.right) && isLeftLeaning(tree.left);
	}

	function isValidBlackHeight(tree) {
		
		if (tree.color === Tree.Red)
			throw new Error();

		if (tree.height === 0)
			return true;

		function bh(n, t) {
			if (t.height === 0)
				return n === 0;
			if (t.color === Tree.Red)
				return n === t.height-1 && bh(n, t.left) && bh(n, t.right);
			if (t.color === Tree.Black)
				return n === t.height && bh(n-1, t.left) && bh(n-1, t.right);
			throw new Error();
		}

		return bh(tree.height, tree);
	}

	function validate(node) {
		if (node instanceof Tree === false)
			throw new TypeError('did not pass tree');
		assert.ok(isBalanced(node), "tree is not balanced");
		assert.ok(isLeftLeaning(node), "tree is not left-leaning");
		assert.ok(isOrdered(node), "tree is not ordered");
		assert.ok(isValidBlackHeight(node), "tree does not have valid black-height");
	}

	function compare(a,b) {
		return a - b;
	}

	function randomTree(size) {
		var n = Tree.empty(compare);
		while (size-- > 0)
			n = n.insert(x.integer(1000));
		return n;
	}

	function createRandom() {
		return Random.createGenerator(7898);
	}

	var empty = Tree.empty(compare), values = [ ], x = createRandom();

	for (var i = 0; i < 100; ++i)
		values.push(x.integer(1000));

		var max = Math.max.apply(Math, values),
		min = Math.min.apply(Math, values),
		avg = Math.floor((max+min)/2);;

	var tree = Tree.fromCollection(values, compare);

	describe('Tree', function() {
		describe('insert', function() {
			it('should maintain the tree invariant', function() {
				var count = 100, node = tree, random = Random.createGenerator(7898);
				for (var i = 0; i < count; ++i) {
					node = node.insert(random.integer(1000));
					validate(node);
				}
			})
		});

		describe('delete', function() {
			it('should maintain the tree invariant', function() {
				var original = values, random = random = Random.createGenerator(7898);

				function shuffle() {
					var tmp, array = original.slice(), current = 0, top = original.length;
					if(top) while(--top) {
						current = random.integer(0, top);
						tmp = array[current];
						array[current] = array[top];
						array[top] = tmp;
					}

					return array;
				}

				for (var i = 0; i < 20; ++i) {
					var removed = undefined, node = tree, order = shuffle();
					while (removed = order.pop()) {
						var previous = node;
						node = node.delete(removed);
						validate(node);
						assert.ok(!node.contains(removed), "Deleted "+removed+" from "+previous+"; got "+node);
					}
				}

			})
		});

		describe('min', function() {
			
			it('should', function() {
				assert.strictEqual(tree.min(), Math.min.apply(Math, values));
			});

			it('should throw an error with an empty tree', function() {
				assert.throws(function() {
					empty.min();
				})
			});
		});

		describe('max', function() {
			
			it('should', function() {
				assert.strictEqual(tree.max(), Math.max.apply(Math, values));
			});

			it('should throw an error with an empty tree', function() {
				assert.throws(function() {
					empty.max();
				})
			});
			
		});

		describe('pop', function() {
			it('should maintain the tree invariant', function() {
				var node = tree;
				while ((node = node.pop()) && node.height !== 0)
					validate(node);
			});
		});

		describe('shift', function() {
			it('should maintain the tree invariant', function() {
				var node = tree;
				while ((node = node.shift()) && node.height !== 0) 
					validate(node);
			});
		});

		describe('map', function() {
			it('should create new trees that maintain the tree invariant', function() {
				validate(tree.map(function(i) {
					return i*2;
				}));
			});
		});

		describe('forEach', function() {
			it('should cover every element', function() {
				var needed = { }, got = { };

				values.forEach(function(i) {
					needed[i] = true;
				})

				tree.forEach(function(i) {
					assert.ok(!got[i]);
					assert.ok(needed[i]);
					got[i] = true;
				})
			})
		})

		describe('reduce', function() {
			it('should', function() {
				var check = 0;
				tree.forEach(function(i) {
					check += i;
				})

				var sum = tree.reduce(function(prev, cur) {
					return prev+cur;
				})

				assert.strictEqual(check, sum);
			})
			
		});

		describe('some', function() {
			it('should', function() {
				assert.ok(tree.some(function(node) { return node < avg; }));
				assert.ok(!tree.some(function(node) { return node > max; }));
			});
		});

		describe('every', function() {
			it('should', function() {
				assert.ok(tree.every(function(node) { return node <= max; }));
				assert.ok(!tree.every(function(node) { return node < avg; }));
			})
			
		});

		describe('contains', function() {
			it('should', function() {
				for (var i = 0; i < values.length; ++i)
					assert.ok(tree.contains(values[i]));
			})
			
		})

		describe('join', function() {
			it('should', function() {
				assert.strictEqual(Tree.fromCollection([1,2,3,4]).join(','), '1,2,3,4');
				assert.strictEqual(Tree.fromCollection([1]).join(','), '1');
				assert.strictEqual(Tree.empty().join(','), '');
			})
			it('should', function() {
				var x = Tree.join(Tree.empty(), Tree.fromCollection([1,2,3,4]), 5);
				var y = Tree.join(Tree.fromCollection([1,2,3,4]), Tree.empty(), 5);

				validate(x);
				validate(y);

				var a = Tree.fromCollection([1,2,3,4,2,43,345,34,345,12,43]), b = Tree.fromCollection([555,665,567,886,8867]);

				var out = Tree.join(a,b,500);
				validate(out);
			})
		})

		describe('split', function() {
			it('should', function() {
				var random = createRandom();

				function tSplit(point) {
					var parts = tree.split(point);
					validate(parts.left);
					validate(parts.right);
					assert.ok(!parts.left.contains(point));
					assert.ok(!parts.right.contains(point));
					assert.ok(parts.left.every(function(k) { return k < point; }));
					assert.ok(parts.right.every(function(k) { return k > point; }));
				}

				for (var i = 0; i < 20; ++i) 
					tSplit(tree.get(random.integer(tree.length)));

				tSplit(avg);
			})
		})

		describe('difference', function() {
			it('should', function() {
				assert.ok(tree.difference(tree).height === 0);

				var o1 = tree, r1 = randomTree(100), t1 = o1.difference(r1);
				
				r1.forEach(function(i) {
					assert.ok(!t1.contains(i))
				})
				t1.forEach(function(i) {
					assert.ok(o1.contains(i))
				})
			})
		})

		describe('union', function() {
			it('should', function() {
				assert.ok(tree.union(tree).height === tree.height);
				assert.ok(tree.union(tree).length === tree.length);


				var x = randomTree(100), y = tree, u1 = x.union(y), u2 = y.union(x);

				validate(u1);
				validate(u2);

				//Make sure unions don't contain anything they're not supposed to
				u1.forEach(function(i) {
					assert.ok(x.contains(i) || y.contains(i), 'Union does not have member: '+i+'.');
				});
				u2.forEach(function(i) {
					assert.ok(x.contains(i) || y.contains(i), 'Union does not have member: '+i+'.');
				});
				
				//Make sure unions aren't missing any values they're supposed to have
				x.forEach(function(i) {
					assert.ok(u1.contains(i) && u2.contains(i), 'expected union to contain '+i+' from first set');
				});
				y.forEach(function(i) {
					assert.ok(u1.contains(i) && u2.contains(i), 'expected union to contain '+i+' from second set');
				})
			})
		});

		describe('intersection', function() {
			it('should', function() {
				var x = randomTree(100), y = tree, i1 = x.intersection(y), i2 = y.intersection(x);

				validate(i1);
				validate(i2);

				i1.forEach(function(value) {
					assert.ok(x.contains(value) && y.contains(value));
				})

				i2.forEach(function(value) {
					assert.ok(x.contains(value) && y.contains(value));
				})
			})
		})

		describe('length', function() {
			it('should return the correct length', function() {
				assert.strictEqual(tree.length, tree.toArray().length);
			})
		})

		describe('get', function() {
			it('should get the ith item from the tree', function() {
				var items = values.slice().sort(compare), done = { }, current = 0;
				items.forEach(function(item) {
					if (done[item])
						return;
					done[item] = true;
					assert.strictEqual(tree.get(current++), item);
				});
			})
		})

		describe('isSubsetOf', function() {
			it('should return true that empty trees are subsets of empty trees', function() {
				assert.ok(empty.isSubsetOf(empty));
			})

			it('should return true that empty trees are subsets of non-empty trees', function() {
				assert.ok(empty.isSubsetOf(tree));
			});

			it('should return false that non-empty trees are subsets of empty trees', function() {
				assert.ok(!tree.isSubsetOf(empty));
			})

			it('should return true that trees are subsets of themselves', function() {
				assert.ok(tree.isSubsetOf(tree));
			})
			
			it('should', function() {
				var random = createRandom();
				//assert random subset successes
				for (var i = 0; i < 30; ++i) {
					var subset = tree.filter(function() { return random.occurs(0.5); });
					assert.ok(subset.isSubsetOf(tree), ""+subset+" should be a subset of "+tree);
				}

				//assert random subset failures
				for (var i = 0; i < 30; ++i) {
					var subset = Tree.fromCollection(values.filter(function() {
						return random.occurs(0.5);
					}, this), this.compare);

					var j = 0;
					while (j < 3) {
						var x = random.integer(0,1000);
						if (values.indexOf(x) !== -1)
							continue;
						subset = subset.insert(x);
						++j;
					}
					assert.ok(!subset.isSubsetOf(tree), ""+subset+" should not be a subset of "+tree);
				}
			})
		})
	})
});


