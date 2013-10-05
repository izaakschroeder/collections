
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['../lib/lazy', 'assert'], function(Lazy, assert) {

	describe('Lazy', function() {
		var values = [0,1,2,3,4,5], lazy = Lazy.fromCollection(values);

		describe('length', function() {
			it('should return the number of elements in the collection', function() {
				assert.strictEqual(values.length, lazy.length);
			});
		});
	});
});