
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['./util'], function(util) {

	function memoize(f) {
		var _cache = [ ];
		return function check(i, next) {
			return function() {
				if (_cache[i] !== undefined)
					return _cache[i];
				_cache[i] = next();
				return { value: _cache[i].value, next: _cache[i].next ? check(i+1, _cache[i].next) : undefined }
			}
		}(0, f);
	}

	function LazyCollection(first) {
		if (typeof first !== 'function')
			throw new TypeError('Must pass function.');
		this.first = memoize(first);
		Object.freeze(this);
	}

	Object.defineProperty(LazyCollection.prototype, 'length', {
		get: function() {
			var n = 0, c = this.first, parts;
			while ((parts = c()) && (c = parts.next))
				++n;
			return n;
		}
	});

	LazyCollection.empty = function() {
		return new LazyCollection(function() {
			return { };
		});
	}

	LazyCollection.create = function(first) {
		return new LazyCollection(first);
	}

	LazyCollection.fromEntry = function(e) {
		return LazyCollection.create(function() {
			return { value: e, next: function() {
				return { value: undefined, next: undefined }
			} };
		});
	}



	LazyCollection.fromIterator = function(i) {
		return LazyCollection.create(function next() {
			try {
				return { value: i.next(), next: next }
			}
			catch (e) {
				if (e instanceof StopIteration)
					return { };
				throw e;
			}
		})
	}

	LazyCollection.fromArray = function(a) {
		return LazyCollection.create(function next(i) {
			return function() {
				return { next: i < a.length ? next(i+1) : undefined, value: i < a.length ? a[i] : undefined };
			};
		}(0));
	}

	LazyCollection.fromCollection = function(collection) {
		//If the collection already supports laziness, then use that
		if (typeof collection.first === 'function')
			return LazyCollection.create(function() { return collection.first(); });
		//If it supports ES6-style iterator semantics, then use those
		if (typeof collection.iterator === 'function')
			return LazyCollection.fromIterator(collection.iterator());
		//If it's an array than we can just make do
		if (Array.isArray(collection))
			return LazyCollection.fromArray(collection);
		//Unsupported
		throw new TypeError('Collection must be iterable!');
	}

	/**
	 * Interface for harmony/JS1.7 iterators.
	 * 
	 *
	 */
	LazyCollection.prototype.iterator = function() {
		return { 
			next: function work(l) {
				return function() {
					var parts = l();
					this.next = work(parts.next);
					if (!parts.next)
						throw new StopIteration();
					return parts.value;
				}
			}(this.first)
		}
	}

	LazyCollection.prototype.reverse = function() {
		return LazyCollection.fromArray(this.reduce(function(result, value) { result.unshift(value); return result; }, [ ]));
	}

	LazyCollection.prototype.last = function() {
		var last = null, c = this.first, parts;
		while ((parts = c()) && (c = parts.next))
			last = parts.value;
		return parts;
	}

	LazyCollection.flatten = function(rest) {
		return function() {
			var parts = rest.first();
			//console.log(parts)
			if (parts.next)
				return LazyCollection.concat(parts.value, parts.next)();
			return { value: undefined, next: undefined };
		}	
	}

	LazyCollection.concat = function(first, rest) {
		return function() {
			var parts = first.first();
			if (parts.next)
				return { value: parts.value, next: LazyCollection.concat({ first: parts.next }, rest) };
			if (rest) {
				parts = rest();
				if (parts.next) {
					return LazyCollection.concat(parts.value, parts.next)();
				}
			}
			return { value: undefined, next: undefined };
		}
	}

	LazyCollection.prototype.concat = function(other) {
		return new LazyCollection(LazyCollection.concat(this, LazyCollection.fromArray(arguments).first));
	}

	LazyCollection.prototype.flatten = function() {
		return new LazyCollection(LazyCollection.flatten(this));
	}

	LazyCollection.prototype.map = function(f) {
		return new LazyCollection(function work(x, i) {
			return function() {
				var parts = x();
				if (!parts.next)
					return parts;
				return { next: work(parts.next, i+1), value: f(parts.value, i, x) };
			}
		}(this.first, 0));
	}

	LazyCollection.prototype.join = function(l) {
		return this.isEmpty() ? '' :  this.reduce(function(a,b) {
			return '' + a + l + b;
		})
	}

	LazyCollection.prototype.filter = function(f) {
		if (typeof f !== 'function')
			throw new TypeError();
		return new LazyCollection(function work(x, i) {
			return function() {
				var parts = x();
				if (!parts.next)
					return parts;
				if (f(parts.value, i, x))
					return { next: work(parts.next, i+1), value: parts.value };
				else
					return work(parts.next)();
			}
		}(this.first, 0));
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
				throw new TypeError('Must call reduce on collection with at least one element!');
			acc = parts.value;
			current = parts.next;
			if (!parts.next)
				return acc;
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
		return new LazyCollection(function step(i, c) {
			return function() {
				var parts = c();
				if (!parts || parts.next === undefined)
					return parts;
				if (i<s)
					return step(i+1, parts.next)();
				if (i >= e)
					return {};
				return { value: parts.value, next: step(i+1, parts.next) };
			}
		}(0, this.first))
	}

	LazyCollection.prototype.take = function(e) {
		return new LazyCollection(function step(i, c) {
			return function() {
				if (i >= e)
					return {};
				var parts = c();
				return { value: parts.value, next: step(i+1, parts.next) }
			}
		}(0, this.first));
	}

	LazyCollection.prototype.toArray = function() {
		var c = this.first, buf = [], parts;
		while ((parts = c()) && (c = parts.next))
			buf.push(parts.value);
		return buf;
	}

	LazyCollection.prototype.toString = function() {
		return '['+this.join(', ')+']';
	}

	LazyCollection.prototype.isEmpty = function() {
		var c = this.first();
		return !c || !c.next;
	}

	return LazyCollection;
})