
"use strict";

var
	Tree = require('./tree'),
	Random = require('com.izaakschroeder.random');


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

function validate(test, node) {
	if (node instanceof Tree === false)
		throw new TypeError();
	test.ok(isBalanced(node), "tree is not balanced");
	test.ok(isLeftLeaning(node), "tree is not left-leaning");
	test.ok(isOrdered(node), "tree is not ordered");
	test.ok(isValidBlackHeight(node), "tree does not have valid black-height");
}

module.exports = {
	
	setUp: function(done) {
		this.random = Random.createGenerator(7898); //5948
		this.original = [ ];

		for (var i = 0; i < 100; ++i)
			this.original.push(this.random.integer());

		this.max = Math.max.apply(Math, this.original);
		this.min = Math.min.apply(Math, this.original);
		this.avg = Math.floor((this.max+this.min)/2);

		this.compare = function (a, b) {
			if (a > b)
				return 1;
			if (a < b)
				return -1;
			return 0;
		};
		this.tree = Tree.fromArray(this.original, this.compare);
		this.randomTree = function(size) {
			var n = Tree.empty(this.compare);
			while (size-- > 0)
				n = n.insert(this.random.integer());
			return n;
		}.bind(this);
		done();
	},

	insert: function(test) {
		var count = 100, node = this.tree;
		for (var i = 0; i < count; ++i) {
			var number = this.random.integer();
			node = node.insert(number);
			validate(test, node);
		}
		test.done();
	},

	delete: function(test) {

		var original = this.original, random = this.random;

		function shuffle() {
			var tmp, array = original.slice(), current = 0, top = original.length;
			if(top) while(--top) {
				current = random.integer() % top;
				tmp = array[current];
				array[current] = array[top];
				array[top] = tmp;
			}

			return array;
		}

		for (var i = 0; i < 20; ++i) {
			var removed = undefined, node = this.tree, order = shuffle();
			while (removed = order.pop()) {
				var previous = node;
				node = node.delete(removed);
				validate(test, node);
				test.ok(!node.contains(removed), "Deleted "+removed+" from "+previous+"; got "+node);
			}
		}

		test.done();
	},

	min: function(test) {
		test.strictEqual(this.tree.min(), Math.min.apply(Math, this.original));
		test.done();
	},

	max: function(test) {
		test.strictEqual(this.tree.max(), Math.max.apply(Math, this.original));
		test.done();
	},

	pop: function(test) {
		var node = this.tree;
		while ((node = node.pop()) && node.height !== 0)
			validate(test, node);
		test.done();
	},

	shift: function(test) {
		var node = this.tree;
		while ((node = node.shift()) && node.height !== 0) 
			validate(test, node);
		test.done();
	},

	forEach: function(test) {
		var needed = { }, got = { };

		this.original.forEach(function(i) {
			needed[i] = true;
		})

		this.tree.forEach(function(i) {
			test.ok(!got[i]);
			test.ok(needed[i]);
			got[i] = true;
		})

		test.done();
	},

	//FIXME: Implement this
	map: function(test) {
		this.tree.map(function(i) {
			return i*2;
		})
		test.done();
	},

	reduce: function(test) {
		var check = 0;
		this.tree.forEach(function(i) {
			check += i;
		})

		var sum = this.tree.reduce(function(prev, cur) {
			return prev+cur;
		})

		test.strictEqual(check, sum);
		test.done();
	},

	some: function(test) {
		var max = this.max, min = this.min, avg = this.avg;
		test.ok(this.tree.some(function(node) { return node < avg; }));
		test.ok(!this.tree.some(function(node) { return node > max; }));
		test.done();
	},

	every: function(test) {
		var max = this.max, min = this.min, avg = this.avg;
		test.ok(this.tree.every(function(node) { return node <= max; }));
		test.ok(!this.tree.every(function(node) { return node < avg; }));
		test.done();
	},

	contains: function(test) {
		for (var i = 0; i < this.original.length; ++i)
			test.ok(this.tree.contains(this.original[i]));
		test.done();
	},

	joinString: function(test) {
		test.strictEqual(Tree.fromArray([1,2,3,4]).join(','), '1,2,3,4');
		test.strictEqual(Tree.fromArray([1]).join(','), '1');
		test.strictEqual(Tree.empty().join(','), '');
		test.done();
	},

	join: function(test) {

		var x = Tree.join(Tree.empty(), Tree.fromArray([1,2,3,4]), 5);
		var y = Tree.join(Tree.fromArray([1,2,3,4]), Tree.empty(), 5);

		validate(test, x);
		validate(test, y);

		var a = Tree.fromArray([1,2,3,4,2,43,345,34,345,12,43]), b = Tree.fromArray([555,665,567,886,8867]);

		var out = Tree.join(a,b,500);
		validate(test, out);

		test.done();
	},

	split: function(test) {

		var tree = this.tree;

		function tSplit(point) {
			var parts = tree.split(point);
			validate(test, parts.left);
			validate(test, parts.right);
			test.ok(!parts.left.contains(point));
			test.ok(!parts.right.contains(point));
			test.ok(parts.left.every(function(k) { return k < point; }));
			test.ok(parts.right.every(function(k) { return k > point; }));
		}

		for (var i = 0; i < 20; ++i) 
			tSplit(this.random.integer());

		tSplit(this.avg);

		test.done();
	},

	difference: function(test) {
		test.ok(this.tree.difference(this.tree).height === 0);

		var o1 = this.tree, r1 = this.randomTree(100), t1 = o1.difference(r1);
		
		r1.forEach(function(i) {
			test.ok(!t1.contains(i))
		})
		t1.forEach(function(i) {
			test.ok(o1.contains(i))
		})
		

		test.done();
	},

	union: function(test) {
		test.ok(this.tree.union(this.tree).height === this.tree.height);
		test.ok(this.tree.union(this.tree).length === this.tree.length);


		var x = this.randomTree(100), y = this.tree, u1 = x.union(y), u2 = y.union(x);

		validate(test, u1);
		validate(test, u2);

		//Make sure unions don't contain anything they're not supposed to
		u1.forEach(function(i) {
			test.ok(x.contains(i) || y.contains(i), 'Union does not have member: '+i+'.');
		});
		u2.forEach(function(i) {
			test.ok(x.contains(i) || y.contains(i), 'Union does not have member: '+i+'.');
		});
		
		//Make sure unions aren't missing any values they're supposed to have
		x.forEach(function(i) {
			test.ok(u1.contains(i) && u2.contains(i), 'expected union to contain '+i+' from first set');
		});
		y.forEach(function(i) {
			test.ok(u1.contains(i) && u2.contains(i), 'expected union to contain '+i+' from second set');
		})



		test.done();
	},

	intersection: function(test) {
		var x = this.randomTree(100), y = this.tree, i1 = x.intersection(y), i2 = y.intersection(x);

		validate(test, i1);
		validate(test, i2);

		i1.forEach(function(value) {
			test.ok(x.contains(value) && y.contains(value));
		})

		i2.forEach(function(value) {
			test.ok(x.contains(value) && y.contains(value));
		})

		test.done();
	},

	length: function(test) {
		test.strictEqual(this.tree.length, this.tree.toArray().length);
		test.done();
	},

	get: function(test) {
		var items = this.original.slice().sort(this.compare), done = { }, current = 0;
		items.forEach(function(item) {
			if (done[item])
				return;
			done[item] = true;
			test.strictEqual(this.tree.get(current++), item);
		}, this);
		test.done();
	},

	isSubsetOf: function(test) {
		var empty = Tree.empty(this.compare);
		
		//Edge cases
		test.ok(empty.isSubsetOf(empty));
		test.ok(empty.isSubsetOf(this.tree));
		test.ok(!this.tree.isSubsetOf(empty));
		test.ok(this.tree.isSubsetOf(this.tree));

		//Test random subset successes
		for (var i = 0; i < 30; ++i) {
			var subset = Tree.fromArray(this.original.filter(function() {
				return this.random.integer() % 2 == 0;
			}, this), this.compare);
			test.ok(subset.isSubsetOf(this.tree), ""+subset+" should be a subset of "+this.tree);
		}

		//Test random subset failures
		for (var i = 0; i < 30; ++i) {
			var subset = Tree.fromArray(this.original.filter(function() {
				return this.random.integer() % 2 == 0;
			}, this), this.compare);

			var j = 0;
			while (j < 3) {
				var x = this.random.integer();
				if (this.original.indexOf(x) !== -1)
					continue;
				subset = subset.insert(x);
				++j;
			}
			test.ok(!subset.isSubsetOf(this.tree), ""+subset+" should not be a subset of "+this.tree);
		}
		test.done();
	}
}