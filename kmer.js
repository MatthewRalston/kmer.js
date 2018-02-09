'use strict';

const Type     = require('type-of-is');
const through2 = require('through2');
/*
 *  Returns an array of all k-length substrings. Takes a string and a k in that order.
 * 
 * @method allKmers
 * @param {String} s A string to slice into kmers
 * @param {Number} k An integer length for all resulting substrings
 * @return {Array<String>} Returns an array of Strings, all of length k, and all substrings of s.
 */
    
function kmerArray(s, k){
    if (!Type.is(s, String)) throw TypeError("kmer.allKmers takes a String as its first positional argument");
    else if (!Type.is(k, Number)) throw TypeError("kmer.allKmers takes an integer as its second and final positional argument");
    else if (!isNaN(k) && k.toString().indexOf('.') != -1) throw TypeError("kmer.allKmers takes an integer as its second and final positional argument. This was a float");
    else if (s.length < k) throw TypeError("kmer.allKmers takes a String whose length > k as its first positional argument");
    else {
	return Array(s.length).fill(undefined).map(function(_, i){
	    let r=s.substring(i, i+k);
	    if (r.length == k){
		return r
	    } else {
		return undefined
	    }
	}).filter((x) => x !== undefined);
    }
};




/*
 * CONSTRUCTOR - an actual constructor function
 */

function kmerConstructor(k, letters){
    var alphabet = letters || "ACTG";
    if (!Type.is(k, Number)) throw TypeError("kmerJS takes an integer as its first positional argument");
    else if (!isNaN(k) && k.toString().indexOf('.') != -1) throw TypeError("kmerJS takes an integer as its first positional argument. This was a float");
    else if (!Type.is(alphabet, String)) throw TypeError("kmerJS expects the optional second positional argument to be a String");
    else if (alphabet.length <= 1) throw TypeError("kmerJS expects the optional second positional argument to have a length > 1");
    // Typecheck the args
    alphabet = alphabet.split('');
    let comboSize = Math.pow(alphabet.length, k)
    // initialize seq with all letters from each alphabet (what is stop condition)
    // then permute sequence until number of permutations for that base is exhausted
    
    let alpha = JSON.parse(JSON.stringify(alphabet));
    let combos = Array(comboSize).fill("")

    for (let i = 0; i < comboSize*k; i++){
	if  (alpha.length == 0) {
		alpha = JSON.parse(JSON.stringify(alphabet));
	}
	let x = Math.floor(i/comboSize); // x is an index of which letter < k in the string, zeroth is first
	let y = i%comboSize; // y is an index in the master array
	// the second factor is a reverse, 0-based x-index showing the location in the matrix of adding the next letter
	// r is essentially the number of instances for a single letter before cycling letters
	let r = Math.pow(alphabet.length, (k - x - 1));
	// cyclepoints are locations in the array where a new letter is shifted from the alphabet every single time
	let cyclePoint = (x, y, r) => {
	    let adjY = (y+1);
	    // When x alphabet.length - 1, cyclepoint is linear in y (remainder?)
	    // When x == 0, cyclepoint(as a Y index) is divisible by r
	    // When x is last letter, cyclePoint is every letter (base case)
	    // When x is second to last, cyclePoint is divisible by alphabet.length and tracks r
	    if (x + 1 == k) return true
	    else return (adjY%r) == 0
	}
	combos[y] += alpha[0]
	if (x + 1 < k) {
	    if (cyclePoint(x,y,r)) alpha.shift(); // Otherwise, we want the letter to be appended and just continue
	} else alpha.shift(); // Otherwise, the string is full. The last letter shifts every time.
    }

    var profile = combos.reduce(function(acc, item, i){
	acc[item] = 0;
	return acc
    }, {})


    function streamingUpdate(){
	return through2.obj(function(data, enc, callback){
	    if (!Type.is(data, Object)) throw TypeError("kmer.streamingUpdate expects the pipe to produce objects");
	    else if (! ("seq" in data && Type.is(data.seq, String))) throw TypeError("kmer.streamingUpdate expects the pipe to produce objects with a 'seq' attribute. See 'bionode-fasta' for examples.");
	    else {
		update(data.seq);
		callback();
	    }
	});
    }
    
    function update(seq){
	if (!Type.is(seq, String)) throw TypeError("kmer.update takes a String as its argument");
	else {
	    let substrings = kmerArray(seq, k);
	    while (substrings.length > 0){
		profile[substrings.pop()] += 1;
	    }
	}
    }



    
  return {
      profile,
      kmerArray,
      streamingUpdate
  }

}

module.exports = kmerConstructor;



