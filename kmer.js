'use strict';

const Type     = require('type-of-is');
const through2 = require('through2');

// 


//    ' P U R E '  F U N C T I O N S 
/*
 *  Returns an array of all k-length substrings. Takes a string and a k in that order.
 * 
 * @method kmerArray
 * @param {String} s A string to slice into kmers
 * @param {Number} k An integer length for all resulting substrings
 * @return {Array<String>} Returns an array of Strings, all of length k, and all substrings of s.
 */
function KmerArray(s, k){
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
 * Returns a 32-bit int array of zeroes, given an alphabet and choice of k
 *
 * @method profileAsArray
 * @param {Number} k An integer value with which to generate substrings
 * @param {String} letters An optional string of letters, effectively the 'alphabet'. Defaults to 'ACGT'
 * @return {Uint32Array} Returns a typed array of length  : letters.length ^ k
 */
function ProfileAsArray(k, letters){
    var alphabet = letters || "ACGT";
    if (!Type.is(k, Number)) throw TypeError("kmer.profileAsArray takes a Number as its first positional argument");
    else if (!isNaN(k) && k.toString().indexOf('.') != -1) throw TypeError("kmer.profileAsArray takes an integer as its first positional argument. This was a float");
    else if (!Type.is(alphabet, String)) throw TypeError("kmer.profileAsObject expects the optional second positional argument to be a String");
    else if (alphabet.length <= 1) throw TypeError("kmer.profileAsObject expects the optional second positional argument to have a length > 1");
    else {
	var numKmers = Math.pow(alphabet.length, k);
	return new Uint32Array(numKmers);
    }
}


class Kmer {
    constructor(k, letters){
	// Typecheck the args
	var alphabet = letters || "ACGT";
	if (!Type.is(k, Number)) throw TypeError("kmerJS takes an integer as its first positional argument");
	else if (!isNaN(k) && k.toString().indexOf('.') != -1) throw TypeError("kmerJS takes an integer as its first positional argument. This was a float");
	else if (!Type.is(alphabet, String)) throw TypeError("kmerJS expects the optional second positional argument to be a String");
	else if (alphabet.length <= 1) throw TypeError("kmerJS expects the optional second positional argument to have a length > 1");

	
	//  Instance variables
	this.k = k;
	this.alphabet = alphabet;
	this.notInAlphabet = new RegExp("[^" + this.alphabet + "]");
	this.letterToBinary = this.alphabet.split('').reduce(function(acc, item, i){
	    acc[item] = i;
	    return acc;
	}, {});
	this.binaryToLetter = this.alphabet.split('');
	this.profile = this.profileAsArray(k, letters);
	// Necessary enforced binding of context because... through2 changes scope?
	this.update = this.Update.bind(this);
	// Debugging
	//this.profileAsArray = profileAsArray;
	//this.kmerArray = kmerArray;

    }



    /*
     * Returns a 32-bit int array of zeroes, given an alphabet and choice of k
     *
     * @method profileAsArray
     * @param {Number} k An integer value with which to generate substrings
     * @param {String} letters An optional string of letters, effectively the 'alphabet'. Defaults to 'ACGT'
     * @return {Uint32Array} Returns a typed array of length  : letters.length ^ k
     */
    profileAsArray(k, letters){
	return ProfileAsArray(k, letters);
    }

    /*
     *  Returns an array of all k-length substrings. Takes a string and a k in that order.
     * 
     * @method kmerArray
     * @param {String} s A string to slice into kmers
     * @param {Number} k An integer length for all resulting substrings
     * @return {Array<String>} Returns an array of Strings, all of length k, and all substrings of s.
     */
    kmerArray(s, k){
	return KmerArray(s, k);
    }
    
    /*
     * This function updates updates the state of the profile by pure side-effect
     *
     * @method update
     * @param {String} seq A String with letters matching the pre-specified alphabet
     * @param {Kmer} thisArg Passing in the parent context, because through2 apparently redefined 'this'
     */
    Update(seq, thisArg){
	//console.log("this:", this)
	var k = this.k;
	//console.log("thisArg:", thisArg)
	if (!Type.is(seq, String)) throw TypeError("kmer.update takes a String as its only positional argument");
	else if (seq.length < this.k) throw TypeError(`kmer.update takes a String with length greater than ${k} as its only positional argument`);
	else if (seq.match(this.notInAlphabet)) throw new TypeError(`kmer.update takes a String with letters from the alphabet '${this.alphabet}'`)
	else {
	    let substrings = this.kmerArray(seq, this.k);
	    while (substrings.length > 0){
		this.profile[this.sequenceToBinary(substrings.pop())] += 1;
	    }
	}
    };



    /*
     * This method streams sequence data to update the kmer profile by side-effect
     *
     * @method streamingUpdate
     * @return {Object<Through2>} A through2 stream wrapper
     */
    streamingUpdate(){
	var update = this.update;
	var thisArg = this;
	return through2.obj(function(data, enc, callback){
	    if (!Type.is(data, Object)) throw TypeError("kmer.streamingUpdate expects the pipe to produce objects");
	    else if (! ("seq" in data && Type.is(data.seq, String))) throw TypeError("kmer.streamingUpdate expects the pipe to produce objects with a 'seq' attribute. See 'bionode-fasta' for examples.");
	    else {
		update(data.seq, thisArg);
		callback();
	    }
	});
    }

    /*
     * Returns a binary representation/encoding of a biological sequence
     *
     * @method sequenceToBinary
     * @param {String} s A biological sequence to convert into a binary integer
     * @return {Number} Returns an integer encoding of a k-mer
     */
    sequenceToBinary(s){
	if (!Type.is(s, String)) throw TypeError("kmer.sequenceToBinary takes a String as its only positional argument");
	else if (s.match(this.notInAlphabet)) throw TypeError("kmer.sequenceToBinary takes a String with letters in the specified alphabet as its only positional argument");
	else {
	    var result = 0x00;
	    for (var i in s){
		result = result << 2;
		result = result | this.letterToBinary[s[i]];
	    }
	    return result;
	}
    }

    /*
     * Returns a biological sequence from a binary encoding
     *
     * @method binaryToSequence
     * @param {Number} x An integer encoding of a biological sequence
     * @return {String} A biological sequence
     */
    binaryToSequence(x){
	if (!Type.is(x, Number)) throw TypeError("kmer.binaryToSequence takes a Number as its only positional argument");
	else if (!isNaN(x) && x.toString().indexOf('.') != -1) throw TypeError("kmer.binaryToSequence takes an integer as its only positional argument. This was a float");
	else {

	    var result = "";
	    for (var i = 0; i < this.k; i++) {
		result += this.binaryToLetter[x & 0x03];
		x = x >> 2;
	    }
	    return result.split('').reverse().join('');
	}
    };

}


    

module.exports = Kmer;



