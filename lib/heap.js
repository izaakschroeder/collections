

//https://karczmarczuk.users.greyc.fr/TEACH/Doc/brodal_okasaki.pdf
//TODO: Finish the structural "bootstrapping" so heaps contain
//other heaps.

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function() {

	function Heap() {

	}

	//O(1)
	/**
	 *
	 *
	 */
	Heap.empty = function(compare) {
		return new EmptyHeap(compare);
	}

	/**
	 *
	 *
	 */
	Heap.fromCollection = function(c, compare) {
		return c.reduce(function(heap, value) {
			return heap.insert(value);
		}, Heap.empty(compare));
	}

	/**
	 *
	 *
	 */
	Heap.prototype.insertAll = function(list) {
		return list.reduce(function(heap, cur) {
			return heap.insert(cur);
		}, this);
	}

	/**
	 *
	 *
	 */
	Heap.prototype.push = function() {
		var result = this;
		for (var i = 0; i < arguments.length; ++i)
			result = result.insert(arguments[i]);
		return result;
	}

	/**
	 *
	 *
	 */	
	function NonEmptyHeap(minimum, trees, length, compare) {
		if (typeof length !== 'number')
			throw new TypeError();
		if (length <= 0)
			throw new TypeError();
		if (typeof compare !== 'function')
			throw new TypeError();
		if (typeof minimum === 'undefined')
			throw new TypeError('Heap with no minimum');

		Heap.call(this);
		//if (length !== trees.reduce(function(a,b) { return a+b.length}, 0))
		//	throw new TypeError('length mismatch')

		this.trees = trees;
		this.compare = compare;
		this.length = length;
		this.minimum = minimum;
		Object.freeze(this);
	}
	NonEmptyHeap.prototype = Object.create(Heap.prototype, {
		constructor: {
			value: NonEmptyHeap,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});

	NonEmptyHeap.prototype.first = function() {
		var self = this;
		return {
			value: self.peek(),
			next: function() { return self.pop().first() }
		}
	}

	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.findMinTree = function() {
		var compare = this.compare;
		return this.trees.reduce(function(min, cur) {
			return compare(min.value, cur.value) <= 0 ? min : cur;
		});
	}

	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.peek = function() {
		//FIXME: Make sure minimum is set in an order-preserving
		//manner so pop always removes the element declared to be
		//the minimum even when their are multiple equivalent
		//minimums
		return this.findMinTree().value;
	}

	NonEmptyHeap.prototype.isEmpty = function() {
		return false;
	}

	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.insert = function(value) {
		var node = new Node(value, 0, [], 1, this.compare), min = this.compare(this.minimum, value) <= 0 ? this.minimum : value;
		if (this.trees.length >= 2 && this.trees[0].rank === this.trees[1].rank)
			return new NonEmptyHeap(min, [node.skewLink(this.trees[0], this.trees[1])].concat(this.trees.slice(2)), this.length+1, this.compare);
		else
			return new NonEmptyHeap(min, [node].concat(this.trees), this.length+1, this.compare);
	}

	

	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.pop = function() {
		//We first find and remove the tree with the minimum root.
		var tree = this.findMinTree(), remaining = this.trees.filter(function(other) { return tree !== other; });
		var toMeld = [ ], toInsert = [ ], compare = this.compare;

		//After discarding the root, we partition its children into two groups, those with rank 0 and those with rank > 0.
		tree.children.forEach(function(node) {
			//The children with rank > 0 constitute a valid skew binomial queue,
			//so we meld these children with the remaining trees in the queue. 
			if (node.rank > 0)
				toMeld.push(new NonEmptyHeap(node.value, [node], node.length, compare));
			//We reinsert each of the rank 0 children.
			else
				toInsert.push(node.value);
		});

		return toInsert.reduce(function(result, value) {
			return result.insert(value);
		}, toMeld.reduce(function(result, heap) {
			return result.meld(heap);
		}, remaining.length === 0 ? new EmptyHeap(compare) : new NonEmptyHeap(tree.value, remaining, this.length - tree.length, this.compare)));

	}

	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.meld = function(other) {

		if (other instanceof EmptyHeap)
			return this;

		//To meld two queues, we step through the trees of both queues in increasing order
		//of rank, performing a simple link (not a skew link!) whenever we find two trees of
		//equal rank.
		var trees = [ ];

		for(var i = 0, j = 0; i < this.trees.length || j < other.trees.length;) {
			if (i >= this.trees.length)
				trees.push(other.trees[j++]);
			else if (j >= other.trees.length)
				trees.push(this.trees[i++]);
			else if (this.trees[i].rank < other.trees[j].rank)
				trees.push(this.trees[i++]);
			else if (this.trees[i].rank > other.trees[j].rank)
				trees.push(other.trees[j++]);
			else 
				trees.push(this.trees[i++].link(other.trees[j++]))
		}

		return new NonEmptyHeap(this.compare(this.minimum, other.minimum) <= 0 ? this.minimum : other.minimum, trees, this.length + other.length, this.compare);		
	}
	

	//O(n)
	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.toString = function() {
		return '[' + this.reduce(function(a, b) {
			return '' + a + ', ' + b;
		}) + ']';
	}

	//O(n)
	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.forEach = function(f) {
		this.trees.forEach(function walk(node) {
			f(node.value);
			node.children.forEach(walk);
		});
	}

	//O(n)
	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.some = function(f) {
		return this.trees.some(function walk(node) {
			return (f(node.value)) || node.children.some(walk);
		});
	}

	//O(n)
	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.every = function(f) {
		return this.trees.every(function walk(node) {
			return (f(node.value)) && node.children.some(walk);
		});
	}

	//O(n)
	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.filter = function(f) {
		return this.reduce(function(heap, value) {
			return f(value) ? heap.insert(value) : heap;
		}, Heap.empty(this.compare));
	}

	//O(n)
	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.map = function(f) {
		return this.reduce(function(heap, value) {
			return heap.insert(f(value));
		}, Heap.empty(this.compare));
	}

	//O(n)
	/**
	 *
	 *
	 */
	NonEmptyHeap.prototype.reduce = function(f, i) {
		var acc;

		function handle(node) {
			acc = f(acc, node.value);
			node.children.forEach(handle);
		}

		if (typeof i === 'undefined') {
			if (this.trees.length === 0)
				throw new TypeError();
			acc = this.trees[0].value;
			this.trees[0].children.forEach(handle);
			for (var j = 1; j < this.trees.length; ++j)
				handle(this.trees[j]);
		}
		else {
			acc = i;
			this.trees.forEach(handle);
		}

		return acc;
	}

	function EmptyHeap(compare) {
		Heap.call(this);
		this.compare = compare;
		this.length = 0;
	}
	EmptyHeap.prototype = Object.create(Heap.prototype, {
		constructor: {
			value: EmptyHeap,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});

	EmptyHeap.prototype.insert = function(v) {
		return new NonEmptyHeap(v, [new Node(v, 0, [], 1, this.compare)], this.length+1, this.compare);
	}

	EmptyHeap.prototype.pop = function() {
		throw new TypeError();
	}

	EmptyHeap.prototype.peek = function() {
		throw new TypeError();
	}

	EmptyHeap.prototype.meld = function(o) {
		return o;
	}

	EmptyHeap.prototype.reduce = function(f,i) {
		if (i) return i;
		else throw new TypeError();
	}

	EmptyHeap.prototype.filter = function() {
		return this;
	}

	EmptyHeap.prototype.some = function() {
		return false;
	}

	EmptyHeap.prototype.every = function() {
		return true;
	}

	EmptyHeap.prototype.forEach = function() {

	}

	EmptyHeap.prototype.toString = function() {
		return '[]';
	}

	EmptyHeap.prototype.map = function(f) {
		return this;
	}

	EmptyHeap.prototype.isEmpty = function() {
		return true;
	}
	

	/**
	 *
	 *
	 */
	function Node(value, rank, list, length, compare) {
		if (typeof compare !== 'function')
			throw new TypeError();
		if (typeof value === 'undefined')
			throw new TypeError();
		if (rank === 0 && list.length > 0)
			throw new TypeError();
		this.value = value;
		this.rank = rank;
		this.children = list;
		this.compare = compare;
		this.length = length;


		Object.freeze(this);
	}

	/**
	 *
	 *
	 */
	Node.prototype.link = function(other) {
		if (this.compare(this.value, other.value) <= 0)
			return new Node(this.value, this.rank + 1, [other].concat(this.children), this.length + other.length, this.compare);
		else
			return new Node(other.value, other.rank + 1, [this].concat(other.children), this.length + other.length, this.compare);
	}

	/**
	 *
	 *
	 */
	Node.prototype.skewLink = function(a, b) {
		if (this.compare(a.value, this.value) <= 0 && this.compare(a.value, b.value) <= 0)
			return new Node(a.value, a.rank + 1, [this, b].concat(a.children), this.length + a.length + b.length, this.compare);
		if (this.compare(b.value, this.value) <= 0 && this.compare(b.value, a.value) <= 0)
			return new Node(b.value, b.rank + 1, [this, a].concat(b.children), this.length + a.length + b.length, this.compare);
		return new Node(this.value, a.rank + 1, [a, b], this.length + a.length + b.length, this.compare);

	}


	return Heap;

	
})

