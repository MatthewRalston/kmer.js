'use strict';

const Type=require('type-of-is');



/*
 *  Returns an array of all k-length substrings. Takes a string and a k in that order.
 * 
 * @method allKmers
 * @param {String} s A string to slice into kmers
 * @param {Number} k An integer length for all resulting substrings
 * @return {Array<String>} Returns an array of Strings, all of length k, and all substrings of s.
 */
    
function allKmers(s, k){
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


module.exports = allKmers


