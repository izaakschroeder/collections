
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function() {
	return {
		stringify: function(c) {
			return "["+c.reduce(function(prev, cur) {
				return "" + prev + ", " + cur;
			})+"]";
		}
	}
})