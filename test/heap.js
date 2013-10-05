
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['../lib/heap', 'assert'], function(Heap, assert) {
	
	"use strict";

	function compare(a,b) { return b - a; }
	
	function heapInvariant(heap) {
		if (heap.length === 0)
			return;
		var prev = heap.peek();
		while((heap.length > 1) && (heap = heap.pop())) {
			var i = heap.peek();
			assert.ok(i <= prev, 'heap element extraction not ordered properly ('+i+' > '+prev+')');
			prev = i;
		}
	}
	
	function containsExactly(heap, target) {
		var amounts = { };
		target.forEach(function(val) {
			amounts[val] = typeof amounts[val] === 'undefined' ? 1 : ++amounts[val];
		});
		heap.forEach(function(val) {
			--amounts[val];
		});
		target.forEach(function(val) {
			assert.strictEqual(amounts[val], 0);
		});
		assert.strictEqual(heap.length, target.length);
	}

	describe('Heap', function() {
		
		var 
			values = [5,2,7,8,4,2,0,-3,8],
			empty = Heap.empty(compare), 
			unique = Heap.fromCollection([5,2,7,4,0,-3,8], compare),
			heap = Heap.fromCollection(values, compare);
		
		describe('fromCollection', function() {
			
			it('should build heaps containing all elements of non-empty arrays', function() {
				assert.strictEqual(unique.length, 7);
				assert.strictEqual(unique.peek(), 8);
			});
			
			it('should include duplicate elements in the array', function() {
				assert.strictEqual(heap.length, 9);
				assert.strictEqual(heap.peek(), 8);
			});
			
			it('should build empty heaps from empty arrays', function() {
				assert.strictEqual(Heap.fromCollection([], compare).length, 0);
			});
		})

		describe('push', function() {
			
			it('should increase the length of the heap by one', function() {
				assert.strictEqual(heap.push(4).length, heap.length+1);
				assert.strictEqual(empty.push(4).length, empty.length+1);
			});
			
			it('should set the pushed element as the next popped element on empty heaps', function() {
				assert.strictEqual(empty.push(4).peek(), 4);
			});
			
			it('should set the pushed element as the next popped element if its the biggest in the heap', function() {
				assert.strictEqual(heap.push(44).peek(), 44);
			});

			it('should maintain the heap invariant', function() {
				heapInvariant(empty.push(44));
			})
		});

		describe('meld', function() {
			it('should do return the existing non-empty heap when melded wuth an empty heap', function() {
				assert.strictEqual(heap.meld(empty), heap);
				assert.strictEqual(empty.meld(heap), heap);
			});

			it('should maintain the heap invariant', function() {
				heapInvariant(heap.meld(heap));
			});

			it('should create a heap that include all elements of its sources', function() {
				containsExactly(heap.meld(heap), values.concat(values));
			})
		});

		describe('peek', function() {
			it('should return the largest element of the heap in non-empty heaps', function() {
				assert.strictEqual(heap.peek(), 8);
			});

			it('should throw an error in an empty heap', function() {
				assert.throws(function() {
					empty.peek();
				});
			});
		})

		describe('pop', function() {
			it('should maintain the heap invariant', function() {
				heapInvariant(heap);
			});

			it('should return all elements in the heap until empty', function() {
				containsExactly(heap, values);
			})

			it('should throw an error in an empty heap', function() {
				assert.throws(function() {
					empty.peek();
				});
			});

			it('should remove the element declared to be minimum', function() {
				var heap = Heap.empty(function() { return 0; }); //lol
				for (var i = 0; i < 10; ++i)
					heap = heap.insert(i);
				while(!heap.isEmpty()) {
					var min = heap.peek();
					heap = heap.pop();
					heap.forEach(function(i) {
						assert.notStrictEqual(i, min, 'removed '+min+' yet heap still contains it '+heap);
					});
				}
			})
		});

	});
});