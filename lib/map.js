
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['./tree'], function(Tree) {

	"use strict";

	function KeyValuePair(key, value) {
		this.key = key;
		this.value = value;
		Object.freeze(this);
	}

	KeyValuePair.prototype.toString = function() {
		return ''+this.key+': '+this.value;
	}

	function Map(tree, compare) {
		if (tree instanceof Tree === false)
			throw new TypeError();
		this.tree = tree;
		this.compare = compare;
		Object.freeze(this);
	}

	Map.prototype.toString = function() {
		if (this.tree.length === 0)
			return '{ }';
		else
			return '{' + this.tree.reduce(function(a, b) { return ''+a+', '+b; }) + '}';
	}

	Map.prototype.delete = function(key) {
		return new Map(this.tree.delete({key: key}), this.compare)
	}

	Map.prototype.set = function(key, value) {
		return new Map(this.tree.delete({key: key}).insert(new KeyValuePair(key, value)), this.compare);
	}

	Map.prototype.containsKey = function(key) {
		return this.tree.contains({key: key});
	}

	Map.prototype.get = function(key) {
		return this.tree.find({key: key}).value;
	}

	Map.prototype.containsValue = function(value) {
		return this.tree.some(function(kv) { return kv.value === value; });
	}

	Map.prototype.map = function(f) {
		return new Map(this.tree.map(f), this.compare);
	}

	Map.prototype.reduce = function(f, i) {
		return this.tree.reduce(f, i);
	}

	Map.prototype.keys = function() {
		return this.tree.map(function(kv) { return kv.key });
	}

	Map.prototype.values = function() {
		return this.tree.map(function(kv) { return kv.value; })
	}

	Map.fromObject = function(object, compare) {
		return Object.getOwnPropertyNames(object).reduce(function(map, key) {
			return map.set(key, object[key]);
		}, Map.empty(compare))
	}

	Map.empty = function(compare) {
		if (typeof compare !== 'function')
			throw new TypeError();
		return new Map(Tree.empty(function(a, b) { return compare(a.key, b.key); }), compare);
	}

	return Map;

});