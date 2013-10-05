
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function() {

	/**
	 *
	 *
	 *
	 */
	function Node(childNodes, data) {
		this.childNodes = childNodes || [];
		if (typeof data === "undefined")
			throw new TypeError();
		this.data = data;
		Object.freeze(this);
	}

	/**
	 *
	 *
	 *
	 */
	function Context(parentNode, parentContext, left, right) {
		this.parentNode = parentNode || null;
		this.parentContext = parentContext || null;
		this.left = left || [];
		this.right = right || [];
		Object.freeze(this);
	}
	Context.top = new Context();

	/**
	 *
	 *
	 *
	 */
	Context.prototype.shift = function(left, right) {
		return new Context(this.parentNode, this.parentContext, left, right);
	}

	/**
	 *
	 *
	 *
	 */
	function Location(node, context) {
		if (node instanceof Node === false)
			throw new TypeError("Node expected; got "+node);
		if (context instanceof Context === false)
			throw new TypeError("Context expected; got "+context);
		this.node = node;
		this.context = context;
		var self = this;
		this.childNodes = new Array(node.childNodes.length);
		for (var i = 0; i<this.childNodes.length; ++i) {
			Object.defineProperty(this.childNodes, i, {
				get: function(i) {
					return self.getChild(i);
				}.bind(undefined, i)
			})
		}
		Object.freeze(this.childNodes);
		Object.freeze(this);
	}

	/**
	 *
	 *
	 *
	 */
	Location.prototype.first = function() {
		return (function more(nodes, i, parent) {
			if (i >= nodes.length)
				return parent();
			return { value: nodes[i].data, next: function() {
				return more(nodes[i].childNodes, 0, function() {
					return more(nodes, i+1, parent)
				});
			}};
		})([this.node], 0, function() { return { } });
	}

	/**
	 *
	 *
	 *
	 */
	Location.prototype.getChild = function(index) {
		index = index || 0;
		if (index >= this.node.childNodes.length || index < 0)
			return null;
		var left = this.node.childNodes.slice(0, index), right = this.node.childNodes.slice(index+1);
		return new Location(this.node.childNodes[index], new Context(this.node, this.context, left, right));
	}

	/**
	 *
	 *
	 *
	 */
	Object.defineProperty(Location.prototype, 'data', {
		get: function() {
			return this.node.data;
		}
	});

	Object.defineProperty(Location.prototype, 'value', {
		get: function() {
			return this.node.data;
		}
	});

	Object.defineProperty(Location.prototype, 'rootNode', {
		get: function() {
			var context = this.context;
			while (context.parentContext)
				context = context.parentContext;
			return new Location(context.parentNode, Context.top);
		}
	});

	Object.defineProperty(Location.prototype, 'leafNodes', {
		get: function() {
			var out = [ ];
			function y(node) {
				if (node.childNodes.length === 0)
					return out.push(node);
				for (var i = 0; i < node.childNodes.length; ++i)
					y(node.childNodes[i]);
			}
			y(this);
			return out;
		}
	});

	Object.defineProperty(Location.prototype, 'leafValues', {
		get: function() {
			var out = [ ];
			function y(node) {
				if (node.childNodes.length === 0)
					out.push(node.data);
				else
					node.childNodes.forEach(y);
			}
			y(this.node);
			return out;
		}
		
	});

	/**
	 *
	 *
	 *
	 */
	Object.defineProperty(Location.prototype, 'firstChild', {
		get: function() {
			return this.getChild(0)
		}
	});

	/**
	 *
	 *
	 *
	 */
	Object.defineProperty(Location.prototype, 'lastChild', {
		get: function() {
			return this.getChild(this.childNodes.length-1);
		}
	});

	/**
	 *
	 *
	 *
	 */
	Object.defineProperty(Location.prototype, 'parentNode', {
		get: function() {
			if (this.context.parentNode === null) 
				return null;
			var ch = this.context.left.concat(this.node).concat(this.context.right);
			return new Location(new Node(ch, this.context.parentNode.data), this.context.parentContext)
		}
	});

	/**
	 *
	 *
	 *
	 */
	Object.defineProperty(Location.prototype, 'previousSibling', {
		get: function() {
			if (this.context.left.length === 0) 
				return null;
			var left = this.context.left.slice(0, -1);
			var right = [this.node].concat(this.context.right);
			return new Location(this.context.left[this.context.left.length - 1], this.context.shift(left, right));
		}
	});

	/**
	 *
	 *
	 *
	 */
	Object.defineProperty(Location.prototype, 'nextSibling', {
		get: function() {
			if (this.context.right.length === 0)
				return null;
			return new Location(this.context.right[0], this.context.shift(this.context.left.concat(this.node), this.context.right.slice(1)));
		}
	});

	/**
	 *
	 *
	 *
	 */
	Location.prototype.appendChild = function(node) {
		var ch = this.node.childNodes.concat(node instanceof Location ? node.node : node instanceof Node ? node : new Node([], node));
		return new Location(new Node(ch, this.node.data), this.context);
	}

	/**
	 *
	 *
	 *
	 */
	Location.prototype.removeChild = function(index) {
		if (index >= this.node.childNodes.length || index < 0)
			throw new TypeError();
		var ch = this.node.childNodes.slice(0, index).concat(this.node.childNodes.slice(index+1));
		return new Location(new Node(ch, this.node.data), this.context);
	}

	/**
	 *
	 *
	 *
	 */
	Location.prototype.forEach = function(f) {
		function y(node) {
			f(node.data);
			node.childNodes.forEach(y);
		}
		y(this.node);
	}

	/**
	 *
	 *
	 *
	 */
	Location.prototype.filter = function(f) {
		var out = [ ];
		this.forEach(function(data) {
			if (f(data))
				out.push(data);
		})
		return out;
	}

	/**
	 *
	 *
	 *
	 */
	Location.prototype.map = function(f) {
		function y(node) {
			return new Node(node.childNodes.map(y), f(node.data));
		}
		return new Location(y(this.node), Context.top);
	}

	/**
	 *
	 *
	 *
	 */
	Location.prototype.reduce = function(f, first) {
		var prev;
		if (typeof first !== "undefined") {
			prev =  first;
			this.forEach(function(cur) {
				prev = f(prev, cur);
			});
		}
		else {
			prev = this.node.data;
			function y(node) {
				prev = f(prev, node.data);
				node.childNodes.forEach(y);
			}
			this.node.childNodes.forEach(y);
		}
		return prev;
	}


	return {
		createRoot: function(data) {
			return new Location(new Node([], data), Context.top);
		},
		createNode: function(data) {
			return new Node([], data);
		},
		Location: Location,
		Node: Node,
		Context: Context
	}

})

