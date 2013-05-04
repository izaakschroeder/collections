
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['./lib/stack', './lib/tree', './lib/set', './lib/map', './lib/lazy'], function(Stack, Tree, Set, Map, Lazy) {
	return {
		Tree: Tree,
		Set: Set,
		Map: Map,
		Lazy: Lazy,
		Stack: Stack,
		cartesianProduct: function(set) {
			return set.reduce(function(result, current) {
				return result.reduce(function(res, a) {
					return current.reduce(function(res, b) {
						return res.push(a.push(b))
					}, res);
				}, Stack.empty());
			}, Stack.empty().push(Stack.empty()))
		}
	}
});