
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function() {

	"use strict";

	//https://github.com/kazu-yamamoto/llrbtree/blob/master/Data/Set/LLRBTree.hs
	//http://www.cs.princeton.edu/~rs/talks/LLRB/RedBlack.pdf

	/**
	 *
	 *
	 *
	 */
	function Node(color, height, value, compare, left, right) {
		
		if (typeof compare !== "function")
			throw new TypeError();
		if (left && left instanceof Node === false)
			throw new TypeError();
		if (right && right instanceof Node === false)
			throw new TypeError();
		if (color !== Node.Red && color !== Node.Black)
			throw new TypeError();
		if (typeof left === "undefined")
			throw new TypeError();
		if (typeof right === "undefined")
			throw new TypeError()
		if (left && left instanceof Node === false)
			throw new TypeError();
		if (right && right instanceof Node === false)
			throw new TypeError();
		if (!left && right)
			throw new TypeError();
		if (right && !left)
			throw new TypeError();
		if (!left && (color !== Node.Black))
			throw new TypeError();
		if (this.right && this.right.height > 0 && this.left && this.left.height === 0)
			throw new TypeError()
		

		this.color = color;
		this.height = height;
		this.compare = compare;
		this.value = value;
		this.left = left;
		this.right = right;

		
		//Mimick array access a la this[0], this[1], ... this[n]
		for (var i = 0; i < this.length; ++i)
			Object.defineProperty(this, i, { get: this.get.bind(this, i) });
		

		//Trees are immutable
		Object.freeze(this);
	}

	Node.Red = 0;
	Node.Black = 1;


	//FIXME: Can we precompute this property and save it in 
	//the node when we're doing insert/deletes plz.
	Object.defineProperty(Node.prototype, "length", {
		get: function() {
			return 1 + this.left.length + this.right.length;
		}
	})

	/**
	 *
	 *
	 *
	 */
	function isBlackLeftBlack(node) {
		return node.color === Node.Black && node.left && node.left.color === Node.Black;
	}

	/**
	 *
	 *	
	 *
	 */
	function isBlackLeftRed(node) {
		return node.color === Node.Black && node.left && node.left.color === Node.Red;
	}

	/**
	 *
	 *
	 *
	 */
	Node.singleton = function(item, compare) {
		return new Node(Node.Black, 1, item, compare, Node.empty(compare), Node.empty(compare));
	}

	/**
	 *
	 *
	 *
	 */
	Node.fromArray = function(array, compare) {
		return array.reduce(function(prev, cur) {
			return prev.insert(cur);
		}, Node.empty(compare))
	}

	Node.prototype.empty = function(compare) {
		return Node.empty(compare || this.compare);
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.toString = function() {
		return "["+this.reduce(function(prev, cur) {
			return "" + prev + ", " + cur;
		})+"]";
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.min = function() {
		var node = this;
		while (node.left.height !== 0)
			node = node.left;
		return node.value;
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.max = function() {
		var node = this;
		while (node.right.height !== 0)
			node = node.right;
		return node.value;
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.get = function(i) {
		var pos = this.left.length;
		if (pos === i) 
			return this.value;
		if (i < pos)
			return this.left.get(i);
		if (i > pos)
			return this.right.get(i - pos - 1);
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.indexOf = function(item) {
		var result = this._find(item);
		return (result instanceof Leaf) ? -1 : result.left.length;
	}

	

	/**
	 *
	 *
	 *
	 */
	Node.prototype.find = function(item, required) {
		var result = this._find(item);
		if (result instanceof Leaf)
			if (required)
				throw new Error();
			else
				return undefined;
		return result.value;
	}


	/**
	 *
	 *
	 *
	 */
	Node.prototype.forEach = function(iter) {
		this.left.forEach(iter);
		iter(this.value);
		this.right.forEach(iter);
	}

	/*
	Node.prototype.cartesianProduct = function() {
		this.reduce(function(result, current) {
			return result.map(function(a) {
				return a.concat(current)
			})
		}, Node.empty(this.compare).push(Node.empty(this.value.compare)))
	}
	*/

	/**
	 *
	 *
	 *
	 */
	Node.prototype.map = function(iter, compare) {
		return this.reduce(function(prev, val) {
			return prev.insert(iter(val))
		}, this.empty(compare))
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.filter = function(iter) {
		return this.reduce(function(prev, val) {
			return iter(val) ? prev.insert(val) : prev;
		}, this.empty())
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.reduce = function(iter, init) {
		if (typeof init !== "undefined")
			return this._reduce(iter, init)
		
		//FIXME: Better way to do this
		return this.shift()._reduce(iter, this.min());
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.reduceRight = function(iter, init) {
		if (typeof init !== "undefined")
			return this._reduceRight(iter, init)
		return this.pop()._reduceRight(iter, this.max());
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.join = function(string) {
		return this.reduce(function(prev, cur) {
			return prev + string + cur.toString();
		}).toString();
	}


	/**
	 *
	 *
	 *
	 */
	Node.prototype.every = function(iter) {
		return this.left.every(iter) && iter(this.value) && this.right.every(iter);
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.some = function(iter) {
		return this.left.some(iter) || iter(this.value) || this.right.some(iter);
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.toArray = function() {
		var out = [ ];
		this.forEach(function(item) {
			out.push(item);
		})
		return out;
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.containsAll = function() {
		for (var i = 0; i < arguments.length; ++i)
			if (this.contains(arguments[i]) === false)
				return false;
		return true;
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.containsAny = function() {
		for (var i = 0; i < arguments.length; ++i)
			if (this.contains(arguments[i]) === true)
				return true;
		return false;
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.contains = function(item) {
		var result = this.compare(item, this.value);
		if (result < 0)
			return this.left.contains(item);
		if (result > 0)
			return this.right.contains(item);
		return true;
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.shift = function(i) {
		var node = this;
		if (typeof i === "undefined")
			i = 1;
		while (i-- > 0)
			node = node.redden()._shift();
		return node.blacken();
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.pop = function(i) {
		var node = this;
		if (typeof i === "undefined")
			i = 1;
		while (i-- > 0)
			node = node.redden()._pop();
		return node.blacken();
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.push = Node.prototype.insert = function(value) {
		return this._insert(value).blacken();
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.insertAll = function(set) {
		var tmp = this;
		for (var i = 0; i < set.length; ++i)
			tmp = tmp.insert(set[i]);
		return tmp;
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.delete = function(value) {
		return this.redden()._delete(value).blacken();
	}


	/**
	 *
	 *
	 *
	 */
	Node.prototype.split = function(value) {
		var result = this.compare(value, this.value);

		if (result < 0) {
			var parts = this.left.split(value);
			return {
				left: parts.left,
				right: Node.join(parts.right, this.right, this.value)
			};
		}

		if (result > 0) {
			var parts = this.right.split(value);
			return {
				left: Node.join(this.left, parts.left, this.value),
				right: parts.right
			};
		}

		return { left: this.left.blacken(), right: this.right };
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.difference = function(other) {
		if (other instanceof Node === false)
			throw new TypeError();
		if (other.height === 0)
			return this;
		var parts = this.split(other.value);
		return Node.merge(parts.left.difference(other.left), parts.right.difference(other.right));
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.union = function(other) {
		if (other instanceof Node === false)
			throw new TypeError();
		if (other.height === 0)
			return this;
		var parts = this.split(other.value);
		return Node.join(parts.left.union(other.left), parts.right.union(other.right), other.value);
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.concat = function() {
		var cur = this;
		for(var i = 0; i < arguments.length; ++i) {
			if (arguments[i] instanceof Node)
				cur = cur.union(arguments[i]);
			else if (Array.isArray(arguments[i]))
				cur = cur.union(Node.fromArray(arguments[i], this.compare));
			else
				cur = cur.insert(arguments[i])
		}
		return cur;
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.intersection = function(other) {
		if (other.height === 0)
			return other;
		var parts = this.split(other.value), l = parts.left.intersection(other.left), r = parts.right.intersection(other.right);
		if (this.contains(other.value))
			return Node.join(l, r, other.value);
		else
			return Node.merge(l, r)
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype.isSubsetOf = function(other) {
		var success;
		//Loop through all our values
		for (var i = 0, j = 0; i < this.length; ++i) {
			var a = this.get(i);
			success = false;
			//Loop through the other sets values
			while (j < other.length && !success) {
				//Compare
				var result = this.compare(a, other.get(j));
				if (result < 0) //fail
					return false;
				++j
				success = (result == 0) 
			}
		}
		return success;
	}




	//----- Internal

	Node.prototype.redden = function() {
		return this.color === Node.Red ? this : new Node(Node.Red, this.height, this.value, this.compare, this.left, this.right);
	}

	Node.prototype.blacken = function() {
		return this.color === Node.Black ? this : new Node(Node.Black, this.height, this.value, this.compare, this.left, this.right);
	}

	Node.prototype._reduce = function(iter, init) {
		return this.right._reduce(iter, iter(this.left._reduce(iter, init), this.value));
	}

	Node.prototype._reduceRight = function(iter, init) {
		return this.left._reduceRight(iter, iter(this.right._reduceRight(iter, init), this.value));
	}

	/**
	 *
	 *
	 *
	 */
	Node.prototype._find = function(item) {
		var result = this.compare(item, this.value);
		if (result < 0)
			return this.left._find(item);
		if (result > 0)
			return this.right._find(item);

		return this;
	}

	Node.prototype._shift = function() {
		if (this.color !== Node.Red)
			throw new Error();

		//Two leaves, removing self just leaves a leaf
		if (this.left.height === 0 && this.right.height === 0) {
			//Return the leaf
			return this.left;
		}
		
		//The left child is red
		if (this.left.color === Node.Red) {
			return new Node(
				Node.Red, 
				this.height, 
				this.value, 
				this.compare, 
				this.left._shift(), 
				this.right
			);
		}

		//Black-Black
		if (isBlackLeftBlack(this.left)) {

			if (isBlackLeftRed(this.right)) {
				return new Node(
					Node.Red, 
					this.height, 
					this.right.left.value, 
					this.compare, 
					new Node(
						Node.Black, 
						this.right.height, 
						this.value, 
						this.compare,
						this.left.redden()._shift(), 
						this.right.left.left
					), 
					new Node(
						Node.Black, 
						this.right.height, 
						this.right.value, 
						this.compare, 
						this.right.left.right, 
						this.right.right
					) 
				)
			}
			else {
				return (new Node(
					Node.Black, 
					this.height-1, 
					this.value, 
					this.compare, 
					this.left.redden()._shift(), 
					this.right.redden()
				)).balanceRight();
			}

		}

		//Black-Red
		return new Node(
			Node.Red, 
			this.height, 
			this.value, 
			this.compare, 
			new Node(
				Node.Black, 
				this.left.height, 
				this.left.value, 
				this.compare, 
				this.left.left._shift(), 
				this.left.right
			), 
			this.right
		);
	}


	Node.prototype._pop = function() {
		if (this.color !== Node.Red)
			throw new Error();

		if (this.left.height === 0 && this.right.height === 0)
			return this.left;
		if (this.left.color === Node.Red)
			return this.rotateRight();

		//Black-Black
		if (isBlackLeftBlack(this.right)) {

			if (isBlackLeftRed(this.left)) {
				return new Node(
					Node.Red,
					this.height,
					this.left.value,
					this.compare,
					this.left.left.blacken(),
					new Node(
						Node.Black,
						this.left.height,
						this.value,
						this.compare,
						this.left.right,
						this.right.redden()._pop()
					).balanceRight()
				);
			}
			else {
				return new Node(
					Node.Black,
					this.height - 1,
					this.value,
					this.compare,
					this.left.redden(),
					this.right.redden()._pop()
				).balanceRight();
			}
		}
		else {
			return new Node(
				Node.Red,
				this.height,
				this.value,
				this.compare,
				this.left,
				this.right.rotateRight()
			);
		}
	}

	Node.prototype.rotateRight = function() {
		return new Node(
			this.color, 
			this.height, 
			this.left.value, 
			this.compare, 
			this.left.left,
			new Node(
				Node.Red, 
				this.height, 
				this.value, 
				this.compare, 
				this.left.right, 
				this.right
			)._pop()
		).balanceRight();
	}

	Node.prototype._delete = function(value) {
		var result = this.compare(value, this.value);
		
		//if (this.color !== Node.Red)
		//	throw new Error();

		//Lesser
		if (result < 0) {
			if (this.color === Node.Red && isBlackLeftBlack(this.left)) {
				if (isBlackLeftRed(this.right)) {
					return new Node(
						Node.Red,
						this.height,
						this.right.left.value,
						this.compare,
						new Node(
							Node.Black,
							this.right.height,
							this.value,
							this.compare,
							this.left.redden()._delete(value),
							this.right.left.left
						),
						new Node(
							Node.Black,
							this.right.height,
							this.right.value,
							this.compare,
							this.right.left.right,
							this.right.right
						)
					);
				}
				else {
					return new Node(
						Node.Black,
						this.height - 1,
						this.value,
						this.compare,
						this.left.redden()._delete(value),
						this.right.redden()
					).balanceRight();
				}
			}
			else {
				return new Node(
					this.color,
					this.height,
					this.value,
					this.compare,
					this.left._delete(value),
					this.right
				)
			}
		}
		
		//Greater
		else if (result > 0) {

			if (this.left.color === Node.Red)
				return new Node(
					this.color, 
					this.height, 
					this.left.value, 
					this.compare, 
					this.left.left, 
					new Node(
						Node.Red,
						this.height,
						this.value,
						this.compare,
						this.left.right,
						this.right
					)._delete(value)
				).balanceRight();



			if ( isBlackLeftBlack(this.right)) {
				if (isBlackLeftRed(this.left)) {
					return new Node(
						Node.Red,
						this.height,
						this.left.value,
						this.compare,
						this.left.left.blacken(),
						new Node(
							Node.Black,
							this.left.height,
							this.value,
							this.compare,
							this.left.right,
							this.right.redden()._delete(value)
						).balanceRight()
					);
				}
				else {
					return new Node(
						Node.Black,
						this.height - 1,
						this.value,
						this.compare,
						this.left.redden(),
						this.right.redden()._delete(value)
					).balanceRight();
				}
			}
			else {
				return new Node(
					Node.Red, 
					this.height, 
					this.value, 
					this.compare, 
					this.left, 
					this.right._delete(value)
				);
			}
		}
		
		//Equal
		else {


			//If leafs
			if (this.color === Node.Red && this.left.height === 0 && this.right.height === 0)
				return this.left;

			if (this.left.color === Node.Red)
				return new Node(
					this.color,
					this.height,
					this.left.value,
					this.compare,
					this.left.left,
					new Node(
						Node.Red,
						this.height,
						this.value,
						this.compare,
						this.left.right,
						this.right
					)._delete(value)
				).balanceRight();

			if (isBlackLeftBlack(this.right)) {
				if (isBlackLeftRed(this.left)) {
					return new Node(
						Node.Red,
						this.height,
						this.left.value,
						this.compare,
						this.left.left.blacken(),
						new Node(
							Node.Black,
							this.left.height,
							this.right.min(),
							this.compare,
							this.left.right,
							this.right.redden()._shift()
						).balanceRight()
					).balanceRight();
				}
				else {
					return new Node(
						Node.Black,
						this.height - 1,
						this.right.min(),
						this.compare,
						this.left.redden(),
						this.right.redden()._shift()
					).balanceRight();
				}
			}
			else {
				return new Node(
					Node.Red,
					this.height,
					this.right.min(),
					this.compare,
					this.left,
					new Node(
						Node.Black,
						this.right.height,
						this.right.value,
						this.compare,
						this.right.left._shift(),
						this.right.right
					)
				);
			}
		}
	}


	Node.prototype._insert = function(value) {
		var result = this.compare(value, this.value)

		//Value is less than current, belongs on the left
		if (result < 0)
			return this.setLeft(this.left._insert(value));

		//Value is bigger than current, belongs on the right
		if (result > 0) 
			return this.setRight(this.right._insert(value));

		//Value exists in the tree, no change
		return this;
	}

	Node.prototype.setLeft = function(node) {
		if (this.left === node)
			return this;
		return (new Node(this.color, this.height, this.value, this.compare, node, this.right)).balanceLeft();
	}

	Node.prototype.setRight = function(node) {
		if (this.right === node)
			return this;
		return (new Node(this.color, this.height, this.value, this.compare, this.left, node)).balanceRight();	
	}

	Node.prototype.balanceLeft = function() {
		if (this.color === Node.Black && this.left.color === Node.Red && this.left.left.color === Node.Red)
			return new Node(Node.Red, this.height+1, this.left.value, this.compare, this.left.left.blacken(), new Node(Node.Black, this.height, this.value, this.compare, this.left.right, this.right));
		return this;
	}

	Node.prototype.balanceRight = function() {
		if (this.color === Node.Black && this.left.color === Node.Red && this.right.color === Node.Red)
			return new Node(Node.Red, this.height+1, this.value, this.compare, this.left.blacken(), this.right.blacken());
		if (this.right.color === Node.Red)
			return new Node(this.color, this.height, this.right.value, this.compare, new Node(Node.Red, this.right.height, this.value, this.compare, this.left, this.right.left), this.right.right);
		return this;
	}


	Node.join = function(left, right, pivot) {
		if (left.height === 0)
			return right.insert(pivot);
		if (right.height === 0)
			return left.insert(pivot);
		
		if (left.height < right.height)
			return Node.joinLeft(left, right, pivot, left.height).blacken();

		if (left.height > right.height)
			return Node.joinRight(left, right, pivot, right.height).blacken();

		return new Node(Node.Black, left.height+1, pivot, left.compare, left, right);
	}

	Node.joinLeft = function(left, right, pivot, height) {
		if (height === right.height)
			return new Node(Node.Red, right.height+1, pivot, left.compare, left, right);
		return right.setLeft(Node.joinLeft(left, right.left, pivot, height))
	}

	Node.joinRight = function(left, right, pivot, height) {
		if (height === left.height)
			return new Node(Node.Red, left.height+1, pivot, left.compare, left, right);
		return left.setRight(Node.joinRight(left.right, right, pivot, height));
	}

	Node.merge = function(left, right) {
		if (left.color !== Node.Black)
			throw new TypeError();
		if (right.color !== Node.Black)
			throw new TypeError();
		if (left.height === 0)
			return right;
		if (right.height === 0)
			return left;
		if (left.height < right.height)
			return Node.mergeLeft(left, right, left.height).blacken();
		if (left.height > right.height)
			return Node.mergeRight(left, right, right.height).blacken();
		return Node.mergeCenter(left, right).blacken();
	}

	Node.mergeLeft = function(left, right, height) {
		if (right.height === 0)
			throw new TypeError();
		if (right.height === height)
			return Node.mergeCenter(left, right);
		return right.setLeft(Node.mergeLeft(left, right.left, height));
	}

	Node.mergeRight = function(left, right, height) {
		if (left.height === 0)
			throw new TypeError();
		if (left.height === height)
			return Node.mergeCenter(left, right);
		return left.setRight(Node.mergeRight(left.right, right, height));
	}

	Node.mergeCenter = function(left, right) {

		if (left.height === 0 && right.height === 0)
			return left;

		if (left.height === 0 || right.height === 0)
			throw new TypeError();

		var shifted = right.shift();

		if (left.height === shifted.height)
			return new Node(
				Node.Red,
				left.height + 1,
				right.min(),
				left.compare,
				left,
				shifted
			);

		if (left.color === Node.Red)
			return new Node(
				Node.Red,
				left.height + 1,
				left.value,
				left.compare,
				left.blacken(),
				new Node(
					Node.Black,
					left.height,
					right.min(),
					left.compare,
					left.right,
					shifted
				)
			);

		return new Node(
			Node.Black,
			left.height,
			right.min(),
			left.compare,
			left.redden(),
			shifted
		);
	}





	function Leaf(compare) {
		Node.call(this, Node.Black, 0, undefined, compare, null, null);
	}
	
	Leaf.prototype = Object.create(Node.prototype, {
		constructor: {
			value: Leaf,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});

	Object.defineProperty(Leaf.prototype, "length", {
		get: function() {
			return 0;
		}
	})

	Leaf.prototype.join = function() {
		return '';
	}

	Leaf.prototype.contains = function() {
		return false;
	}

	Leaf.prototype.get = function(i) {
		throw new Error("Out of bounds.");
	}

	Leaf.prototype.forEach = function() {

	}

	Leaf.prototype.every = function() {
		return true;
	}

	Leaf.prototype.some = function() {
		return false;
	}

	Leaf.prototype.reduce = function(f, init) {
		if (typeof init !== "undefined")
			return init;
		throw new TypeError("Reduce of empty array with no initial value");
	}

	Leaf.prototype.reduceRight = function(f, init) {
		if (typeof init !== "undefined")
			return init;
		throw new TypeError("Reduce of empty array with no initial value");
	}

	Leaf.prototype._reduce = function(f, init) {
		return init;
	}

	Leaf.prototype._reduceRight = function(f, init) {
		return init;
	}

	Leaf.prototype.blacken = function() {
		return this;
	}

	Leaf.prototype.redden = function() {
		throw new Error();
	}


	Leaf.prototype._insert = function(value) {
		return new Node(Node.Red, 1, value, this.compare, this, this)
	}

	Leaf.prototype.delete = function() {
		return this;
	}

	Leaf.prototype._delete = function() {
		return this;
	}

	Leaf.prototype.difference = function() {
		return this;
	}

	Leaf.prototype.union = function(other) {
		return other.blacken();
	}

	Leaf.prototype.intersection = function(other) {
		return this;
	}

	Leaf.prototype.min = function() {
		throw new Error();
	}

	Leaf.prototype.max = function() {
		throw new Error();
	}

	Leaf.prototype.split = function() {
		return {
			left: this,
			right: this
		};
	}

	Leaf.prototype.shift = function() {
		return this;
	}

	Leaf.prototype.pop = function() {
		return this;
	}

	Leaf.prototype._find = function() {
		return this;
	}

	Leaf.prototype._shift = function() {
		throw new Error();
	}

	Leaf.prototype._pop = function() {
		throw new Error();
	}

	Leaf.prototype.isSubsetOf = function() {
		return true;
	}

	Leaf.prototype.toString = function() {
		return "[]";
	}

	Leaf.prototype.indexOf = function() {
		return -1;
	}

	Node.empty = function(compare) {
		//If no comparison function is provided
		if (typeof compare === 'undefined')
			//Set a sensible default
			compare = function(a, b) { 
				if (a > b) return 1; 
				if (a < b) return -1; 
				if (a === b) return 0;
				
				if (a === undefined)
					return b === undefined ? 0 : -1;
				if (b === undefined)
					return a === undefined ? 0 : 1;

				if (a && typeof a.compare === 'function')
					return a.compare(b);
				if (b && typeof b.compare === 'function')
					return b.compare(a);
				throw new TypeError('Unable to compare '+a+','+b+'.'); 
			}
		//If they gave something that wasn't a function
		if (typeof compare !== 'function')
			//Tell them
			throw new TypeError('Comparison must be a function!');
		//Return result
		return new Leaf(compare);
	}

	Node.prototype.empty = function() {
		return new Leaf(this.compare);
	}

	Node.Leaf = Leaf;

	return Node;
})
