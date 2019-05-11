'use strict';

const Type      = require('type-of-is');
const through2  = require('through2');
const BigNumber = require('bignumber.js');

/**
 * Provides the Kmer class
 * 
 * @module KmerJS
 * @main
 */


/**
 * Kmer.js is a module for calculating kmer frequencies and sequence probabilities
 * 
 * @class Kmer
 * @module KmerJS
 * @constructor
 */
class Kmer {
    /**
     * The constructor method for instantiation
     *
     * @method constructor
     * @param {Number} k A value of k to generate the profile and calculate stats with
     * @param {String} letters A string of characters for the alphabet of the sequences. Defaults to "ACGT";
     * @throws {TypeError} If k is not a Number
     * @throws {TypeError} If K is a float
     * @throws {TypeError} If letters is not a String
     * @throws {TypeError} If the number of letters is not > 1
     * @example
     *     Kmer = require('kmer.js')
     *     sampleA = new Kmer(9, "ACGT");
     */
    constructor(k, letters){
	// Typecheck the args
	var alphabet = letters || "ACGT";
	if (!Type.is(k, Number)) throw TypeError("kmerJS takes an integer as its first positional argument");
	else if (!isNaN(k) && k.toString().indexOf('.') != -1) throw TypeError("kmerJS takes an integer as its first positional argument. This was a float");
	else if (!Type.is(alphabet, String)) throw TypeError("kmerJS expects the optional second positional argument to be a String");
	else if (alphabet.length <= 1) throw TypeError("kmerJS expects the optional second positional argument to have a length > 1");

	
	//  Instance variables
	/**
	 * Choice of k used to instantiate, used throughout the instance methods
	 * 
	 * @property k
	 * @type Number
	 */
	this.k = k;
	/**
	 * The 'alphabet' of sequence characters to use
	 * 
	 * @property alphabet
	 * @type String
	 * @default "ACGT"
	 */
	this.alphabet = alphabet;
	/**
	 * A regular expression to match characters not belonging to the alphabet
	 * 
	 * @property notInAlphabet
	 * @type RegExp	 
	 */
	this.notInAlphabet = new RegExp("[^" + this.alphabet + "]");
	/***
	 * A mapping of letters to their binary encodings (integer indices)
	 * 
	 * @property letterToBinary
	 * @type Object
	 */
	this.letterToBinary = this.alphabet.split('').reduce(function(acc, item, i){
	    acc[item] = i;
	    return acc;
	}, {});
	/**
	 * A mapping of binary encoded sequences to their corresponding Strings
	 * 
	 * @property binaryToLetter
	 * @type Array
	 */
	this.binaryToLetter = this.alphabet.split('');
	/**
	 * A profile of kmer counts
	 * 
	 * @property profile
	 * @type Uint32Array
	 */
	this.profile = this.profileAsArray(k, letters);
	/**
	 * A total of counts from an instantiated profile
	 * Relies on data being loaded through the streamingUpdate() method
	 * Recalculate after updating by running the TotalProfileCounts() method
	 * 
	 * @property totalProfileCounts
	 * @type BigNumber
	 */
        this.totalProfileCounts = this.TotalProfileCounts();
      
	// Necessary enforced binding of context because... through2 changes scope?
	this.update = this.Update.bind(this);

    }


    /**
     * Returns a 32-bit int array of zeroes, given an alphabet and choice of k
     *
     * @method profileAsArray
     * @param {Number} k An integer value with which to generate substrings
     * @param {String} letters An optional string of letters, effectively the 'alphabet'. Defaults to 'ACGT'
     * @throws {TypeError} If k is not a Number
     * @throws {TypeError} If k is a float
     * @throws {TypeError} If letters is not a String
     * @throws {TypeError} If the number of letters is not > 1
     * @return {Uint32Array} Returns a typed array of length  : letters.length ^ k
     */
    profileAsArray(k, letters){
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


    /**
     *  Returns an array of all k-length substrings. Takes a string and a k in that order.
     * 
     * @method kmerArray
     * @param {String} s A string to slice into kmers
     * @param {Number} k An integer length for all resulting substrings
     * @throws {TypeError} If s is not a String
     * @throws {TypeError} If k is not a Number
     * @throws {TypeError} If k is a float
     * @throws {TypeError} If the length of s < k
     * @return {Array<String>} Returns an array of Strings, all of length k, and all substrings of s.
     * 
     * @example
     *     >var k = 7
     *     >var testString = "AAACCCCCGCACCCGCGGGGGTTTCAGCGTGTCG"
     *     >var allKmersFromTestString = kmer.kmerArray(testString, 9)
     */
    kmerArray(s, k){
      if (!Type.is(s, String)) throw TypeError("kmer.kmerArray takes a String as its first positional argument");
      else if (!Type.is(k, Number)) throw TypeError("kmer.kmerArray takes an integer as its second and final positional argument");
      else if (!isNaN(k) && k.toString().indexOf('.') != -1) throw TypeError("kmer.kmerArray takes an integer as its second and final positional argument. This was a float");
      else if (s.length < k) throw TypeError("kmer.kmerArray takes a String whose length > k as its first positional argument");
	else {
	    return Array(s.length).fill(undefined).map(function(_, i){
		let r=s.substring(i, i+k);
		if (r.length == k){
		    return r;
		} else {
		    return undefined;
		}
	    }).filter((x) => x !== undefined);
	}
    };


    /**
     *  Returns an array of frequencies of k-length substrings. Takes a string and a k in that order.
     * 
     * @method kmerFrequencies
     * @param {String} s A string to slice into kmers
     * @param {Number} k An integer length for all resulting substrings
     * @throws {TypeError} If s is not a String
     * @throws {TypeError} If k is not a Number
     * @throws {TypeError} If k is a float
     * @throws {TypeError} If the length of s < k
     * @throws {TypeError} If the letters of s aren't in the alphabet
     * @return {Array<String>} Returns an array of Strings, all of length k, and all substrings of s.
     * 
     * @example
     *     >var k = 7
     *     >var testString = "AAACCCCCGCACCCGCGGGGGTTTCAGCGTGTCG"
     *     >var kmerProfileFromTestString = kmer.kmerFrequencies(testString, 9)
     */
    kmerFrequencies(s, k){
	if (!Type.is(s, String)) throw TypeError("kmer.kmerFrequencies takes a String as its first positional argument");
	else if (!Type.is(k, Number)) throw TypeError("kmer.kmerFrequencies takes an integer as its second and final positional argument");
	else if (!isNaN(k) && k.toString().indexOf('.') != -1) throw TypeError("kmer.kmerFrequencies takes an integer as its second and final positional argument. This was a float");
	else if (s.length < k) throw TypeError("kmer.kmerFrequencies takes a String whose length > k as its first positional argument");
	else if (s.match(this.notInAlphabet)) throw TypeError(`kmer.kmerFrequencies takes a String with letters from the alphabet '${this.alphabet}'`);
	else {
	    let substrings = this.kmerArray(s, k);
	    var freqs = new Uint32Array(Math.pow(this.alphabet.length, k)).fill(0);
	    while (substrings.length > 0) {
		freqs[this.sequenceToBinary(substrings.pop())] += 1;
            }
            return freqs;
	}
    };

  
    /**
     * Updates the profile by pure side-effect. No return value
     *
     * @method update
     * @param {String} seq A String with letters matching the pre-specified alphabet
     * @throws {TypeError} If seq is not a String
     * @throws {TypeError} If the number of characters in seq < k
     * @throws {TypeError} If there are letters in seq that aren't in the sequence alphabet
     */
    Update(seq, thisArg){
	//console.log("this:", this)
	var k = this.k;
	//console.log("thisArg:", thisArg)
	if (!Type.is(seq, String)) throw TypeError("kmer.update takes a String as its only positional argument");
	else if (seq.length < this.k) throw TypeError(`kmer.update takes a String with length greater than ${this.k} as its only positional argument`);
	else if (seq.match(this.notInAlphabet)) throw new TypeError(`kmer.update takes a String with letters from the alphabet '${this.alphabet}'`);
	else {
	    let substrings = this.kmerArray(seq, this.k);
	    while (substrings.length > 0){
		this.profile[this.sequenceToBinary(substrings.pop())] += 1;
	    }
	}
    };



    /**
     * This method streams sequence data to update the kmer profile by side-effect
     *
     * @method streamingUpdate
     * @throws {TypeError} If the input stream doesn't yield objects
     * @throws {TypeError} If the input stream's objects don't have a .seq attribute
     * @return {through2} A through2 stream wrapper
     * 
     * @example
     *     >var fasta = require('bionode-fasta'); // Bionode-fastq also
     *     >var fs = require('fs');
     *     >fs.createReadStream("/path/to/example.fasta", {encoding: "UTF-8"})
     *        .pipe(fasta.obj())
     *        .pipe(kmer.streamingUpdate())
     *        .on('finish', function(){
     *            console.log("Done!");
     *        });
     *     >console.log(kmer.profile)
     * @example
     *     >var AWS = require('aws-sdk');
     *     >var s3 = new AWS.S3({apiVersion: '2006-03-01'});
     *     >var fasta = require('bionode-fasta');
     *     >var params = {Bucket: 'bucketname', Key: 'path/to/example.fasta'}
     *     >s3.getObject(params).createReadStream()
     *        .pipe(fasta.obj())
     *        .pipe(kmer.streamingUpdate())
     *        .on('finish', function(){
     *            console.log("Done!");
     *        });
     *     >console.log(kmer.profile);
     */
    streamingUpdate(){
	var update = this.update;
	var thisArg = this;
	return through2.obj(function(data, enc, callback){
	    if (!Type.is(data, Object)) throw TypeError("kmer.streamingUpdate expects the pipe to produce objects");
	    else if (!data.hasOwnProperty("seq") && !Type.is(data.seq, String)) {
		console.log(data);
		throw TypeError("kmer.streamingUpdate expects the pipe to produce objects with a 'seq' attribute. See 'bionode-fasta' for examples.");
	    }
	  else {
	    update(data.seq, thisArg);
	    callback();
	  }
	});
    }

    /**
     * Returns a binary representation/encoding of a biological sequence
     *
     * @method sequenceToBinary
     * @param {String} s A biological sequence to convert into a binary integer
     * @throws {TypeError} If s is not a String
     * @throws {TypeError} If length of s is not k
     * @throws {TypeError} If there are letters in seq that aren't in the sequence alphabet
     * @return {Number} Returns an integer encoding of a k-mer
     * 
     * @example
     *     >var testKmer = "AAAAAAAAA" // Length of testKmer matches our initial value of k, 9
     *     >var testKmerIndex = kmer.sequenceToBinary(testKmer);
     *     >console.log( kmer.profile[testIndex] );
     */
    sequenceToBinary(s){
	if (!Type.is(s, String)) throw TypeError("kmer.sequenceToBinary takes a String as its only positional argument");
	else if (s.length != this.k) throw TypeError("kmer.sequenceToBinary takes a String with length equal to k as its only positional argument");
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

    /**
     * Returns a biological sequence from a binary encoding
     *
     * @method binaryToSequence
     * @param {Number} x An integer encoding of a biological sequence
     * @throws {TypeError} If x is not a Number
     * @throws {TypeError} If x is a float
     * @return {String} A biological sequence
     *
     * @example
     *     >var testKmerIndex = 0; // Analogous to sequenceToBinary() example
     *     >kmer.binaryToSequence(testKmerIndex);
     *     'AAAAAAAAA'
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

    /**
     * Sums the counts for the whole profile. 
     * It also updates the associated property .totalProfileCounts as a side-effect
     * 
     * @method TotalProfileCounts
     * @return {BigNumber} Returns a BigNumber.js sum of all counts from the profile array
     * 
     * @example
     *     >// After a streaming update, the attribute .totalProfileCounts isn't always updated
     *     >console.log( kmer.totalProfileCounts );
     *     0
     *     >kmer.TotalProfileCounts();
     *     10300
     *     >console.log( kmer.totalProfileCounts );
     *     10300
     */
    TotalProfileCounts(){
	this.totalProfileCounts = this.profile.reduce((a, b) => BigNumber(a).plus(BigNumber(b)));
	return this.totalProfileCounts;
    }

    /**
     * Calculates a frequency of a sequence in the profile
     * 
     * @method frequency
     * @param {String} seq A sequence to retrieve the relative count/frequency
     * @throws {TypeError} If seq is not a String
     * @throws {TypeError} If seq is not a kmer (has a length of k)
     * @return {BigNumber} The frequency (count/totalCounts) of the sequence from the profile
     *
     * @example
     *     >var testKmer = "AAAAAAAAA";
     *     >var testKmerFrequency = kmer.frequency(testKmer); // Returns a BigNumber.js
     *     >console.log( testKmerFrequency.toNumber() );
     *     0.123457
     */
    frequency(seq){
	if (!Type.is(seq, String)) throw TypeError("kmer.frequency takes a String as its only positional argument");
	else if (seq.length != this.k) throw TypeError(`kmer.frequency takes a String with length ${this.k} as its only positional argument`);
	else return new BigNumber(this.profile[this.sequenceToBinary(seq)]).div(this.totalProfileCounts);
    }

    /**
     * Calculates the transition probability of one sequence to the next in a Markov chain
     * 
     * @method transitionProbability
     * @param {String} seq1 
     * @param {String} seq2 
     * @throws {TypeError} If seq1 is not a String
     * @throws {TypeError} If seq1 is not a kmer (has a length of k)
     * @throws {TypeError} If seq2 is not a String
     * @throws {TypeError} If seq2 is not a kmer (has a length of k)
     * @return {BigNumber} The transition probability of seq1 to seq2
     * 
     * @example
     *     >var testKmer1 = "AAAAAAAAA";
     *     >var testKmer2 = "AAAAAAAAT";
     *     >var transProbTK1toTK2 = kmer.transitionProbability(testKmer1, testKmer2);
     *     >console.log( transProbTK1toTK2.toNumber() );
     *     0.111048
     */
    transitionProbability(seq1, seq2){
	this.TotalProfileCounts();
	if (!Type.is(seq1, String)) throw TypeError("kmer.transitionProbability takes a String as its first positional argument");
	else if (!Type.is(seq2, String)) throw TypeError("kmer.transitionProbability takes a String as its second positional argument");
	else if (seq1.length != this.k) throw TypeError(`kmer.transitionProbability takes a sequence of length ${this.k} as its first positional argument`);
	else if (seq2.length != this.k) throw TypeError(`kmer.transitionProbability takes a sequence of length ${this.k} as its second positional argument`);
	else {
	    let suffix1 = seq1.substring(1, seq1.length);
	    let prefix2 = seq2.substring(0, seq2.length - 1);
	    if (suffix1 != prefix2) return new BigNumber(0);
	    else return this.frequency(seq2).div(this.alphabet.split('').map((c) => this.frequency(suffix1 + c)).reduce((a, b) => a.plus(b)));
	}
    }

    /**
     * Calculates the Markov chain probability of a sequence from its transition probabilities
     * 
     * @method probabilityOfSequence
     * @param {String} seq A biological sequence
     * @throws {TypeError} If seq is not a String
     * @throws {TypeError} If seq is not larger than a kmer (has a length > k)
     * @throws {TypeError} If there are letters in seq that aren't in the sequence alphabet
     * @return {BigNumber} Returns the Markov-chain probability of the input sequence
     * 
     * @example
     *     >var testKmer = "AAACCCCCGCACCCGCGGGGGTTTCAGCGTGTCG";
     *     >var testKmerProb = kmer.probabilityOfSequence(testKmer);
     *     >console.log( testKmerProb.toNumber() );
     *     0.000033333888887777710
     */
    probabilityOfSequence(seq){
	if (!Type.is(seq, String)) throw TypeError("kmer.probabilityOfSequence takes a String as its only positional argument");
	else if (seq.length <= this.k) throw TypeError("kmer.probabilityOfSequence takes a String with length greater than " + this.k + " as its only positional argument");
	else if (seq.match(this.notInAlphabet)) throw TypeError(`kmer.probabilityOfSequence takes a String with letters from the alphabet '${this.alphabet}'`);
	else {
	    let substrings = this.kmerArray(seq, this.k);
	    let p = 1;
	    for (var i = 0; i < (substrings.length - 1); i++) {
		//console.log("Transition for:", substrings[i], substrings[i+1]);
		//console.log("Current accumulator:", p);
	    	p = this.transitionProbability(substrings[i], substrings[i+1]).times(p);
	    }
	    return p;

	}
    }

    /*
     * Calculates the Euclidean similarity of unit/normalized vectors from 2 count profiles
     * Converts each count to a BigNum frequency temporarily to calculate the euclidean distance
     * 
     * @method euclidean
     * @param {Uint32Array} a A kmer profile of integer counts
     * @param {Uint32Array} b A kmer profile of integer counts
     * @throws {TypeError} If a is not a Uint32Array
     * @throws {TypeError} If b is not a Uint32Array
     * @throws {TypeError} If the lengths of a and b are not the same
     * @return {BigNumber} Returns the Euclidean distance of the profiles as a BigNumber.js
     * 
     * @example
     *     >var distance = kmer.euclidean(prof1, prof2);
     *     >console.log( testKmerProb.toNumber() );
     *     0.000033333888887777710

     */
    euclidean(A, B){
	if (!Type.is(A, Uint32Array)) throw TypeError("kmer.euclidean takes a Uint32Array as its first positional argument");
	else if (!Type.is(B, Uint32Array)) throw TypeError("kmer.euclidean takes a Uint32Array as its second positional argument");
	else if (A.length != B.length) throw TypeError("kmer.euclidean requires both Uint32Arrays to have equal length");
	else {
	    //let totA = 	a.reduce((x, y) => x + y);
	    let normA = Math.sqrt(Array.from(A).map((x) => x*x).reduce((x,y) => x+y));
	    let normalizedA = Array.from(A).map((x) => x/normA);
	    //let totB = b.reduce((x, y) => x + y);
	    let normB = Math.sqrt(Array.from(B).map((x) => x*x).reduce((x,y) => x+y));
	    let normalizedB = Array.from(B).map((x) => x/normB);
	    let final = normalizedA.map(function(a, i) {
	    	// Divide by the magnitude/norm of each vector to make them unit vectors
		// let normCoordA=a/normA;
		// console.log("a / normA = " + a + "/" + normA + " = " + normCoordA);
		// console.log(BigNumber(normCoordA))
		let diff = Number(a.toFixed(10)) - Number(normalizedB[i].toFixed(10));
	    	return Math.pow(diff, 2);
	    }).reduce((x,y) => x+y);
	    return Number(Math.sqrt(final).toFixed(8));
	}
    }



    
    /*
     * Calculates the Pearson correlation coefficient of unit/normalized vectors from 2 count profiles
     * 
     * @method correlation
     * @param {Uint32Array} A, a kmer profile of integer counts
     * @param {Uint32Array} B, a kmer profile of integer counts
     * @throws {TypeError} If A is not a Uint32Array
     * @throws {TypeError} If B is not a Uint32Array
     * @throws {TypeError} If the lengths of A and B are not the same
     * @return {BigNumber} Returns the Pearson correlation distance of the profiles as a BigNumber.js
     * 
     * @example
     *     >var distance = kmer.correlation(prof1, prof2);
     *     >console.log( testKmerProb.toNumber() );
     *     0.000033333888887777710

     */
    correlation(A, B){
	if (!Type.is(A, Uint32Array)) throw TypeError("kmer.correlation takes a Uint32Array as its first positional argument");
	else if (!Type.is(B, Uint32Array)) throw TypeError("kmer.correlation takes a Uint32Array as its second positional argument");
	else if (A.length != B.length) throw TypeError("kmer.correlation requires both Uint32Arrays to have equal length");
	else {
	    let n = A.length;

	    let normA = Math.sqrt(Array.from(A).map((x) => x*x).reduce((x,y) => x+y));
	    let normalizedA = Array.from(A).map((x) => x/normA);

	    let normB = Math.sqrt(Array.from(B).map((x) => x*x).reduce((x,y) => x+y));
	    let normalizedB = Array.from(B).map((x) => x/normB);


	    let meanA =	normalizedA.reduce((x, y) => x + y)/n;
	    let meanB = normalizedB.reduce((x, y) => x + y)/n;

	    
	    let ssxy = normalizedA.map((a,i) => a*normalizedB[i]).reduce((x,y)=>x+y) - n*meanA*meanB;
	    //let ssxy = normalizedA.map((a, i) => (a - meanA)*(normalizedB[i] - meanB)).reduce((x,y) => x+y);
	    let ssxx = normalizedA.map((a) => a*a).reduce((x,y)=>x+y) - n*meanA*meanA;
	    //let ssxx = normalizedA.map((a) => Math.pow(a-meanA, 2)).reduce((x,y) => x+y);
	    let ssyy = normalizedB.map((b) => b*b).reduce((x,y)=>x+y) - n*meanB*meanB;
	    //let ssyy = normalizedB.map((b) => Math.pow(b - meanB, 2)).reduce((x,y) => x+y);
	    return Number(Number(ssxy/Math.sqrt(ssxx*ssyy)).toFixed(5));
	}
    }
    
}


    

module.exports = Kmer;



