
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['../lib/heap'], function(Heap) {
	function compare(a,b) { return a - b; }
	
	return {

		setUp: function(done) {
			this.empty = Heap.empty(compare);
			done();
		},

		fromArray: function(test) {
			var numbers = [5,2,7,8,4,2,0,-3,8];
			var heap = Heap.fromArray(numbers, compare);
			test.ok(heap.length === numbers.length);
			test.done();
		},

		push: function(test) {
			this.empty.push(4)
			test.done();
		},

		meld: function(test) {
			var a = [ 1, 9, 2, 1 ], b = [ 4, 1, 3, 7 ];
			Heap.fromArray(a, compare).meld(Heap.fromArray(b, compare));
			test.done();
		},

		pop: function(test) {
			var numbers = [ 5, 5, 4, 7, 2, 1, 8 ], prev = null, cur, remaining = numbers.length;
			
			cur = numbers.reduce(function(prev, num) {
				return prev.push(num);
			}, this.empty);

			test.strictEqual(cur.length, remaining);

			while(cur.length > 0) {
				var i = cur.peek();
				if (prev)
					test.ok(i >= prev);
				prev = i;
				--remaining;
				cur = cur.pop();
				test.strictEqual(cur.length, remaining);
			}

			test.strictEqual(remaining, 0);
			test.done();
		}
	}
})