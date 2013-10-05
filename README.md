# Collections

## Overview

A purely functional implementation of several useful data structures in JavaScript. Works in both the browser and in nodejs. All classes have their API closely modelled on JavaScript's existing Array so that they may be used almost interchangably.

 * Stacks
 * Queues
 * Heaps
 * Sets
 * Maps
 * Iterators
 * Graphs
 * Trees

Installation:
```
npm install com.izaakschroeder.collections
```

Usage:
```javascript

var Set = require('com.izaakschroeder.collections').Set;


var 
	a = Set.empty().insert(5).insert(3).insert(7),
	b = Set.fromCollection([4, 7, 3, 2, 6, 9, 9]),
	c = Set.empty().push(4,3,7,5,6);

console.log("Smallest from first tree: "+a.min());
console.log("Smallest from second tree: "+b.min());
console.log("Smallest from third tree: "+c.min());
```
