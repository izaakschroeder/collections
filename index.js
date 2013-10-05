
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([
	'./lib/stack', 
	'./lib/tree', 
	'./lib/set', 
	'./lib/map', 
	'./lib/lazy', 
	'./lib/graph',
	'./lib/zipper'
], function(Stack, Tree, Set, Map, Lazy, Graph, Zipper) {
	return {
		Tree: Tree,
		Set: Set,
		Map: Map,
		Lazy: Lazy,
		Stack: Stack,
		Graph: Graph,
		Zipper: Zipper,
		cartesianProduct: function(set) {
			return set.reduce(function(result, current) {
				return result.reduce(function(res, a) {
					return current.reduce(function(res, b) {
						return res.concat([a.concat(b)])
					}, res);
				}, []);
			}, [[]])
		}
	}
});