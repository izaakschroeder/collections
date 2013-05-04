
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['./stack'], function(Stack) {


	function LazyCollection(first) {
		if (typeof first !== 'function')
			throw new TypeError();
		this.first = first;
	}

	LazyCollection.prototype.reverse = function() {
		return this.reduce(function(result, value) { result.unshift(value); return result; }, [ ])
	}

	LazyCollection.prototype.concat = function(other) {
		return new LazyCollection(function work(stack) {
			if (stack.length === 0)
				return { };
			var current = stack.peek(), parts = current();
			if (parts.next)
				return { next: work.bind(undefined, stack.pop().push(parts.next)), value: parts.value };
			else
				return work(stack.pop());
		}, Stack.fromArray([this.first, other.first]));
	}


	LazyCollection.prototype.map = function(f) {
		return new LazyCollection(function work(x, i) {
			var parts = x();
			if (!parts.next)
				return parts;
			return { next: work.bind(undefined, parts.next, i+1), value: f(parts.value, i, x) };
		}.bind(undefined, this.first, 0));
	}

	LazyCollection.prototype.filter = function(f) {
		if (typeof f !== 'function')
			throw new TypeError();
		return new LazyCollection(function work(x, i) {
			var parts = x();
			if (!parts.next)
				return parts;
			if (f(parts.value, i, x))
				return { next: work.bind(undefined, parts.next, i+1), value: parts.value };
			else
				return work(parts.next);
		}.bind(undefined, this.first, 0));
	}

	LazyCollection.prototype.reduce = function(f) {
		var acc, current, parts;
		if (arguments.length > 1) {
			acc = arguments[1];
			current = this.first;
		}
		else {
			parts = this.first();
			if (!parts.next)
				throw new TypeError();
			acc = parts.value;
			current = parts.next;
		}

		while (true) {
			parts = current();
			if (!parts.next)
				return acc;
			acc = f(acc, parts.value);
			current = parts.next;
		}
	}

	LazyCollection.prototype.some = function(f) {
		var c = this.first, parts;
		while ((parts = c()) && (c = parts.next))
			if (f(parts.value))
				return true;
		return false;
	}

	LazyCollection.prototype.every = function(f) {
		var c = this.first, parts;
		while ((parts = c()) && (c = parts.next))
			if (!f(parts.value))
				return false;
		return true;
	}

	LazyCollection.prototype.contains = function(val) {
		return this.some(function(element) { return element === val; });
	}

	LazyCollection.prototype.forEach = function(f) {
		var c = this.first, parts;
		while ((parts = c()) && (c = parts.next))
			f(parts.value)
	}

	LazyCollection.prototype.slice = function(s, e) {

	}

	return LazyCollection;
})