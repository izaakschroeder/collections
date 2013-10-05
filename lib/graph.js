
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['./set', './lazy', './heap', './map'], function(Set, Lazy, Heap, Map) {

	"use strict";

	function Graph(vertices, edges) {
		if (typeof edges !== "function")
			throw new TypeError('Edges must be a function.');
		this.vertices = Lazy.fromCollection(vertices);
		this.edges = edges;
		Object.freeze(this);
	}

	Graph.create = function(vertices, edges) {
		if (edges)
			return new Graph(vertices, edges);
		return new Graph(Object.getOwnPropertyNames(vertices), function(a,b) {
			return vertices[a].indexOf(b) !== -1;
		});
	}

	Graph.K = function(k) {
		//FIXME: Is there a nicer way?
		var e = [ ]; for (var i = 0; i < k; ++i) e.push(i);
		return new Graph(e, function(a,b) {
			return true;
		});
	}

	Graph.edgeCache = function(vertices, edges) {
		return vertices.reduce(function(v) {
			return prev.set(v, vertices.reduce(function(w) {
				return prev.concat({ source: v, destination: w, data: edges(v,w) })
			}, Collections.List.empty()));
		}, Collections.Map.empty(vertices.compare));
	}

	Graph.prototype.toString = function() {
		var graph = this;
		return '('+graph.vertices.map(function(v) {
			return v+' -> ['+graph.successors(v)+']';
		}).join(', ')+')';
	}

	

	Graph.prototype.transpose = Graph.prototype.reverse = function() {
		var self = this;
		return new Graph(this.vertices, function(a,b) { return self.edges(b,a); });
	}

	Graph.prototype.predecessors = function(v) {
		var graph = this;
		return this.vertices.filter(function(w) {
			return graph.edges(w,v);
		});
	}

	Graph.prototype.successors = function(v) {
		var graph = this;
		return this.vertices.filter(function(w) {
			return graph.edges(v,w);
		});
	}


	
	
	//O(V+E)
	Graph.prototype.stronglyConnectedComponents = function() {
		return this.depthFirstForest(this.transpose().order(Graph.topologicalOrder));
	}

	

	Graph.prototype.reachable = function(v) {
		return this.order([v], Graph.preOrder);
	}

	Graph.prototype.pathExists = function(v1, v2) {
		return this.reachable(v1).contains(v2);
	}
	

	Graph.prototype.isConnected = function() {
		var graph = this;
		return graph.vertices.every(function(vertex) {
			graph.reachable(vertex).containsAll(graph.vertices);
		});
	}

	Graph.prototype.edgeExistBetween = function(v1,v2) {
		return !!this.edges(v1,v2);
	}

	
	Graph.prototype.cardinality = function(v) {
		return this.successors(v).length;
	}

 	

	Graph.prototype.complement = Graph.prototype.inverse = function() {
		var edges = this.edges;
		return new Graph(this.vertices, function(v,w) {
			return !edges(v,w);
		});
	}

	Graph.prototype.contract = function(e1, e2) {
		return new Graph();
	}

	Graph.prototype.connect = function(v1, v2, data) {

	}

	Graph.prototype.power = function(k) {
		return new Graph();
	}

	Graph.prototype.insert = function() {
		return new Graph();
	}

	Graph.prototype.delete = function() {
		return new Graph();
	}

	//O(NlgN)
	//http://www.cs.bme.hu/~dmarx/papers/marx-gt04-slides.pdf
	//http://www.cs.toronto.edu/~stacho/public/jstacho-phd-thesis.pdf
	//http://www.columbia.edu/~mc2775/optTrigraph.pdf
	Graph.prototype.color = function(vertices) {
		var graph = this;
		//For chordal graphs the reverse maximum cardinality ordering is a perfect
		//elimination ordering and thus a greedy algorithm will color the graph
		//optimially; mileage may vary for other cases.
		vertices = vertices || this.order(Graph.maximumCardinalityOrder).reverse();
		return vertices.reduce(function(colors, node) {
			var choices = graph.successors(node).reduce(function(choices, friend) {
				return colors.containsKey(friend) ? choices.insert(colors.get(friend)) : choices;
			}, Heap.empty(function(a,b) { return a- b; }));
			var color = 0;
			//console.log(node+' ('+graph.successors(node)+'): '+choices)
			//console.log(color)
			while (!choices.isEmpty() && color === choices.peek()) {
				while (!choices.isEmpty() && color === choices.peek())
					choices = choices.pop();
				++color;
			}
			return colors.set(node, color);	
		}, Map.empty(function(a,b) { return a > b ? 1 : a < b ? -1 : 0;}));
	}

	Graph.prototype.getHoles = function() {

	}

	Graph.prototype.isChordal = function() {
		return this.getHoles().length === 0;
	}

	//http://jgaa.info/accepted/2004/BoyerMyrvold2004.8.3.pdf
	Graph.prototype.isPlanar = function() {

	}

	//http://en.wikipedia.org/wiki/Lexicographic_breadth-first_search
	//http://www.ii.uib.no/~pinar/MCSM-r.pdf
	//O(NM)?
	Graph.maximumCardinalityOrder = function(graph, vertices) {
		return (function process(queue) {
			if (queue.length === 0)
				return [ ];
			//Choose an unnumbered vertex v of maximum weight w(v)
			var v = queue.peek().vertex;
			return process( queue.pop().map(function(key) {
				return graph.edgeExistBetween(v, key.vertex) ? { vertex: key.vertex, weight: key.weight + 1 } : key;
			}) ).concat(v);

		})( Heap.fromCollection(vertices.map(function(v) { return { vertex: v, weight: 0 }; }), function(a,b) { return a.weight - b.weight }) );
	}

	Graph.topologicalOrder = function(graph, vertices) {
		return Graph.postOrder(graph, vertices).reverse();
	}

	Graph.preOrder = function(vertices) {
		return (function preOrder(vertices) {
			return vertices.map(function(node) {
				return Lazy.fromEntry(node.value).concat(Graph.preOrder(node.childNodes));
			}).flatten();
		})(graph.depthFirstForest(vertices));
	}

	Graph.postOrder = function(graph, vertices) {
		return (function postOrder(vertices) {
			return vertices.map(function(node) {
				return postOrder(node.childNodes).concat(Lazy.fromEntry(node.value))
			}).flatten();
		})(graph.depthFirstForest(vertices));
		
	}

	Graph.prototype.order = function(method, vertices) {
		return method(this, vertices || this.vertices);
	}

	function Tree(value, children) {
		this.childNodes = children;
		this.value = value;
	}

	Tree.prototype.order = function(method) {
		return method(Lazy.fromEntry(this));
	}

	Tree.prototype.toString = function() {
		return this.value+' '+this.childNodes.toString()
	}

	Graph.prototype.tree = function(v) {
		var graph = this;
		return new Tree(v, graph.successors(v).map(function(child) {
			return graph.tree(child);
		}));
	}

	//http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.49.2591&rep=rep1&type=pdf
	Graph.prototype.depthFirstForest = function(vertices) {
		var graph = this;

		vertices = Lazy.fromCollection(vertices);

		function f(q, seen) {
			return function() {
				return prune(q, seen);
			}
		}

		//The performance on this...... pls
		function seenAll(base, node) {
			return node.childNodes.reduce(function(seen, child) { 
				return seenAll(seen, child) 
			}, base.insert(node.value));
		}

		function prune(first, seen) {
			var parts = first(), tree = parts.value;
			
			if (!parts.next) {
				return { next: undefined, value: undefined };
			}
			
			
			if (seen.contains(tree.value))
				return prune(parts.next, seen);

			var node = new Tree(tree.value, Lazy.create(f(tree.childNodes.first, seen.insert(tree.value))));

			return {
				value: node,
				next: function() {
					return prune(parts.next, seenAll(seen, node))
				}
			}
		}

		return Lazy.create(f(vertices.map(function(v) {
			return graph.tree(v);
		}).first, Set.empty()));

	}

	

	return Graph;



})