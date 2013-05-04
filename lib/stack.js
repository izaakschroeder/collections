
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([], function() {

	"use strict";



	function Head(data, previous) {
		this.length = previous.length + 1;
		this.data = data;
		this.previous = previous;
		Object.freeze(this);
	}

	Head.prototype.concat = function(other) {
		var base = Head.empty();
		this.forEach(function(item) {
			base = base.push(item)
		});
		other.forEach(function(item) {
			base = base.push(item);
		})
		return base;
	}

	Head.prototype.forEach = function(f) {
		f(this.data);
		this.previous.forEach(f);
	}

	Head.prototype.toString = function() {
		return '[ '+this.reduce(function(a,b) {
			return a+', '+b;
		})+' ]';
	}

	Head.prototype.reduce = function(f, init) {
		if (typeof init === 'undefined')
			return this.previous.reduce(f, this.data);
		return this.previous.reduce(f, f(init, this.data))
	}

	Head.prototype.peek = function() {
		return this.data;
	}

	Head.prototype.push = function(data) {
		return new Head(data, this);
	}

	Head.prototype.pop = function() {
		return this.previous;
	}

	Head.empty = function() {
		return new Empty();
	}

	Head.fromArray = function(ar) {
		return ar.reduceRight(function(result, i) {
			return result.push(i);
		}, Head.empty())
	}

	function Empty() {
		this.length = 0;
		Object.freeze(this);
	}

	Empty.prototype.toString = function() {
		return '[]';
	}

	Empty.prototype.reduce = function() {
		if (arguments.length === 1)
			throw new TypeError();
		return arguments[1];
	}

	Empty.prototype.peek = function() {
		throw new TypeError();
	}

	Empty.prototype.push = function(elem) {
		return new Head(elem, this);
	}

	Empty.prototype.pop = function() {
		throw new TypeError();
	}

	Empty.prototype.concat = function(other) {
		return other;
	}

	Empty.prototype.forEach = function(f) {

	}


	return Head;
});