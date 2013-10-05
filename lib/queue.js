
if (typeof define !== 'function') { var define = require('amdefine')(module) }

//http://www.math.tau.ac.il/~haimk/adv-ds-2000/jacm-final.pdf

define([], function() {

	"use strict";

	function Queue(data) {
		this.data = data;
	}

	Queue.empty = function() {
		return new Queue([]);
	}

	Queue.fromEntry = function(v) {
		return Queue.empty().push(v);
	}

	Queue.fromArray = function(ary) {
		return ary.reduce(function(result, val) {
			return result.push(val);
		}, Queue.empty())
	}

	Queue.prototype.peek = function() {
		return this.data[0];
	}

	Queue.prototype.pop = function() {
		return new Queue(this.data.slice(1));
	}

	Queue.prototype.push = function(v) {
		return new Queue(this.data.slice().push(v));
	}

	return Queue;

});