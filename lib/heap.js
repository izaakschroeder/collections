

//https://karczmarczuk.users.greyc.fr/TEACH/Doc/brodal_okasaki.pdf
//TODO: Finish the structural "bootstrapping" so heaps contain
//other heaps.

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function() {

	/**
	 *
	 *
	 */	
	function Heap(minimum, trees, length, compare) {
		if (typeof length !== 'number')
			throw new TypeError();
		if (typeof compare !== 'function')
			throw new TypeError();
		this.trees = trees;
		this.compare = compare;
		this.length = length;
		this.minimum = minimum;
		Object.freeze(this);
	}

	/**
	 *
	 *
	 */
	Heap.prototype.findMinTree = function() {
		if (this.trees.length === 0)
			throw new TypeError();
		var compare = this.compare;
		return this.trees.reduce(function(min, cur) {
			return compare(min.value, cur.value) <= 0 ? min : cur;
		});
	}

	/**
	 *
	 *
	 */
	Heap.prototype.peek = function() {
		if (this.length === 0)
			throw new TypeError();
		return this.minimum;
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
	Heap.prototype.insert = function(value) {
		var node = new Node(value, 0, [], 1, this.compare);
		if (this.trees.length >= 2 && this.trees[0].rank === this.trees[1].rank)
			return new Heap(this.compare(this.minimum, value) <= 0 ? this.minimum : value, [node.skewLink(this.trees[0], this.trees[1])].concat(this.trees.slice(2)), this.length+1, this.compare);
		else
			return new Heap(this.compare(this.minimum, value) <= 0 ? this.minimum : value, [node].concat(this.trees), this.length+1, this.compare);
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
	Heap.prototype.pop = function() {
		if (this.trees.length === 0)
			throw new TypeError();

		//We first find and remove the tree with the minimum root.
		var tree = this.findMinTree(), remaining = this.trees.filter(function(other) { return tree !== other; });

		var toMeld = [ ], toInsert = [ ], compare = this.compare;

		//After discarding the root, we partition its children into two groups, those with rank 0 and those with rank > 0.
		tree.children.forEach(function(node) {
			//The children with rank > 0 constitute a valid skew binomial queue,
			//so we meld these children with the remaining trees in the queue. 
			if (node.rank > 0)
				toMeld.push(new Heap(node.value, [node], node.length, compare));
			//We reinsert each of the rank 0 children.
			else
				toInsert.push(node.value);
		});

		return toInsert.reduce(function(result, value) {
			return result.insert(value);
		}, toMeld.reduce(function(result, heap) {
			return result.meld(heap);
		}, new Heap(remaining.length > 0 ? remaining.reduce(function(min, cur) {
			return compare(min.value, cur.value) <= 0 ? min : cur;
		}).value : undefined, remaining, this.length - tree.length, this.compare)));

	}

	/**
	 *
	 *
	 */
	Heap.prototype.meld = function(other) {

		if (this.trees.length === 0)
			return other;
		if (other.trees.length === 0)
			return this;


		//To meld two queues, we step through the trees of both queues in increasing order
		//of rank, performing a simple link (not a skew link!) whenever we find two trees of
		//equal rank.
		var i = 0, j = 0, trees = [ ];
		while (i < this.trees.length && j < other.trees.length) {
			if (this.trees[i].rank < other.trees[j].rank)
				trees.push(this.trees[i++]);
			else if (this.trees[i].rank > other.trees[j].rank)
				trees.push(other.trees[j++]);
			else 
				trees.push(this.trees[i++].link(other.trees[j++]))
		}

		return new Heap(this.compare(this.minimum, other.minimum) <= 0 ? this.minimum : other.minimum, trees, this.length + other.length, this.compare);		
	}


	

	

	//O(n)
	/**
	 *
	 *
	 */
	Heap.prototype.toString = function() {
		return '[' + this.reduce(function(a, b) {
			return '' + a + ', ' + b;
		}) + ']';
	}

	//O(n)
	/**
	 *
	 *
	 */
	Heap.prototype.forEach = function(f) {
		function walk(node) {
			f(node.value);
			node.children.forEach(walk);
		}
		this.trees.forEach(walk);
	}

	//O(n)
	/**
	 *
	 *
	 */
	Heap.prototype.some = function(f) {
		function walk(node) {
			return (f(node.value)) || node.children.some(walk);
		}
		return this.trees.some(walk);
	}

	//O(n)
	/**
	 *
	 *
	 */
	Heap.prototype.every = function(f) {
		function walk(node) {
			return (f(node.value)) && node.children.some(walk);
		}
		return this.trees.every(walk);
	}

	//O(n)
	/**
	 *
	 *
	 */
	Heap.prototype.filter = function(f) {
		return this.reduce(function(heap, value) {
			return f(value) ? heap.insert(value) : heap;
		}, Heap.empty(this.compare));
	}

	//O(n)
	/**
	 *
	 *
	 */
	Heap.prototype.map = function(f) {
		return this.reduce(function(heap, value) {
			return heap.insert(f(value));
		}, Heap.empty(this.compare));
	}

	//O(n)
	/**
	 *
	 *
	 */
	Heap.prototype.reduce = function(f, i) {
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


	//O(1)
	/**
	 *
	 *
	 */
	Heap.empty = function(compare) {
		return new Heap(undefined, [], 0, compare);
	}

	/**
	 *
	 *
	 */
	Heap.fromArray = function(array, compare) {
		return array.reduce(function(heap, value) {
			return heap.insert(value);
		}, Heap.empty(compare));
	}

	/**
	 *
	 *
	 */
	function Node(value, rank, list, length, compare) {
		if (typeof compare !== 'function')
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

