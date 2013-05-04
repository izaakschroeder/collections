Introduction
============

A purely functional implementation of several useful data structures in JavaScript. Works in both the browser and in nodejs.

 * Left-leaning red-black trees
 * Brodal heaps
 * Tree sets
 * Tree maps
 * Lazy collections

Installation:
```
npm install com.izaakschroeder.red-black-tree
```

Usage:
```javascript

var Tree = require('com.izaakschroeder.collections').Tree;

function compare(a, b) {
	if (a > b) return 1;
	if (a < b) return -1;
	return 0;
}

var 
	tree1 = Tree.empty(compare).insert(5).insert(3).insert(7),
	tree2 = Tree.fromArray([4, 7, 3, 2, 6, 9, 9], compare);

console.log("Smallest from first tree: "+tree1.min());
console.log("Smallest from second tree: "+tree2.min());

```

API Reference
=============

Tree.empty(compare)
----------
Create a new empty tree with a given comparator.
Time complexity: O(1)

Tree.fromArray(array, compare)
--------------
Create a tree using the elements of the given array.
Time complexity: O(n lg n)

tree.min()
--------------
Time complexity: O(lg n)
Returns: The tree's smallest element.

tree.max()
--------------
Time complexity: O(lg n)
Returns: The tree's largest element.



tree.push(value)
--------------
Time complexity: O(lg n)
Returns: A tree containing the desired element.

tree.delete(value)
--------------
Time complexity: O(lg n)
Returns: A tree without the desired element.

tree.shift()
--------------
Time complexity: O(lg n)
Returns: A tree without the given tree's smallest element.

tree.pop()
--------------
Time complexity: O(lg n)
Returns: A tree without the given tree's largest element.

tree.forEach(f)
--------------
Time complexity: O(n)
Returns: undefined

tree.map(f)
--------------
Time complexity: O(n)
Returns: A tree whose values have been mapped by the given function.

tree.reduce(f, initial)
--------------
Time complexity: O(n)
Returns: Derp.

tree.filter(f)
--------------
Time complexity: O(n)
Returns: A tree containing only those elements that pass the filter.

tree.some(f)
--------------
Time complexity: O(n)
Returns: True if any node matches the function, false otherwise.

tree.every(f)
--------------
Time complexity: O(n)
Returns: True if and only if all nodes match the function.

tree.union(other)
--------------
Time complexity: O(n + m)
Returns: A tree containing all values from both.

tree.intersection(other)
--------------
Time complexity: O(n + m)
Returns: A tree containing only values present in both.

tree.difference(other)
--------------
Time complexity: O(n + m)
Returns: A tree containing values in A but not in B.

