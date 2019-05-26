'use-strict';
// BDD requirements
var chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

// Utilities
const through2 = require("through2");
const fs = require("fs");
const fasta = require("bionode-fasta");
const rewire = require("rewire");
const BigNumber = require("bignumber.js");
const Promise = require("bluebird");


// Module
var kmerConstructor = rewire("./../");

describe("kmerJS", function(){
    describe("kmer constructor", function(){
	var k;
	before(function(){
	    k = 2;
	});
	describe("when initialized with improper arguments", function(){
	    describe("invalid first positional argument", function(){
		it("throws a TypeError when run with undefined", function(){
		    expect(function(){
			new kmerConstructor(undefined);
		    }).to.throw(TypeError, "takes an integer as its first positional argument");;
		});
		it("throws a TypeError when run with a String", function(){
		    expect(function(){
			new kmerConstructor('');
		    }).to.throw(TypeError, "takes an integer as its first positional argument");
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			new kmerConstructor(true);
		    }).to.throw(TypeError, "takes an integer as its first positional argument");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			new kmerConstructor([]);
		    }).to.throw(TypeError, "takes an integer as its first positional argument");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			new kmerConstructor({});
		    }).to.throw(TypeError, "takes an integer as its first positional argument");
		});
		it("throws a TypeError when run with a floating point number", function(){
		    expect(function(){
			new kmerConstructor(4.4);
		    }).to.throw(TypeError, "This was a float");
		});
	    });
	    describe("invalid second positional argument", function(){
		it("throws a TypeError when run with an Number", function(){
		    expect(function(){
			new kmerConstructor(k, 1);
		    }).to.throw(TypeError, "expects the optional second positional argument to be a String");
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			new kmerConstructor(k, true);
		    }).to.throw(TypeError, "expects the optional second positional argument to be a String");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			new kmerConstructor(k, []);
		    }).to.throw(TypeError, "expects the optional second positional argument to be a String");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			new kmerConstructor(k, {});
		    }).to.throw(TypeError, "expects the optional second positional argument to be a String");
		});
		it("throws a TypeError when run with a String with length 1", function(){
		    expect(function(){
			new kmerConstructor(k, 'a');
		    }).to.throw(TypeError, "expects the optional second positional argument to have a length > 1");
		});
	    });
	});
	describe("when run with proper arguments", function(){
	    var kmer;
	    var k;
	    before(function(){
		k = 2;
		kmer = new kmerConstructor(2);
	    });
	    it("will *not* throw a TypeError when run with undefined", function(){
		expect(function(){
		    new kmerConstructor(k, undefined);
		}).to.not.throw(TypeError, "expects the optional second positional argument to be a String");
	    });
	    it("will *not* throw a TypeError when run with an empty String", function(){
		expect(function(){
		    new kmerConstructor(k, '');
		}).to.not.throw(TypeError, "expects the optional second positional argument to have a length > 1");
	    });

	    it("returns an instance of Kmer", function(){
		expect(kmer).to.be.an.instanceof(kmerConstructor);
	    });
	    it("has an 'k' attribute", function(){
		expect(kmer).to.have.property('k');
	    });
	    it("has an 'alphabet' attribute", function(){
		expect(kmer).to.have.property('alphabet');
	    });
	    it("has an 'notInAlphabet' attribute", function(){
		expect(kmer).to.have.property('notInAlphabet');
	    });
	    it("has an 'letterToBinary' attribute", function(){
		expect(kmer).to.have.property('letterToBinary');
	    });
	    it("has an 'binaryToLetter' attribute", function(){
		expect(kmer).to.have.property('binaryToLetter');
	    });
	    it("has an 'profileAsArray' attribute", function(){
		expect(kmer).to.have.property('profileAsArray');
	    });
	    it("has an 'kmerArray' attribute", function(){
		expect(kmer).to.have.property('kmerArray');
	    });
	    it("has an 'kmerFrequencies' attribute", function(){
		expect(kmer).to.have.property('kmerFrequencies');
	    });
	    it("has an 'streamingUpdate' attribute", function(){
		expect(kmer).to.have.property('streamingUpdate');
	    });
	    it("has an 'update' attribute", function(){
		expect(kmer).to.have.property('update');
	    });
	    it("has an 'profile' attribute", function(){
		expect(kmer).to.have.property('profile');
	    });
	    it("has an 'sequenceToBinary' attribute", function(){
		expect(kmer).to.have.property('sequenceToBinary');
	    });
	    it("has an 'binaryToSequence' attribute", function(){
		expect(kmer).to.have.property('binaryToSequence');
	    });
	    it("the 'profile' has a # of combinations equal to n^k, where n is the size of the alphabet", function(){
		// Because k = 2 and alphabet size is 4: 4^2 = 16
		var uniqueKmers = Math.pow(4, k);
		expect(Object.keys(kmer.profile)).to.have.lengthOf(uniqueKmers);
	    });

	});
    });
    describe("kmerArray()", function(){
	var k;
	var kmer;
	before(function(done){
	    k = 3;
	    kmer = new kmerConstructor(k);
	    done();
	});
	describe("when run with improper arguments", function(){
	    describe("invalid first positional argument", function(){
		it("throws a TypeError when run on an undefined", function(){
		    expect(function(){
			kmer.kmerArray(undefined, 4);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on a number", function(){
		    expect(function(){
			kmer.kmerArray(1, 4);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on a boolean", function(){
		    expect(function(){
			kmer.kmerArray(true, 4);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on an Array", function(){
		    expect(function(){
			kmer.kmerArray([], 4);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on an object", function(){
		    expect(function(){
			kmer.kmerArray({}, 4);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on a String whose length is < k", function(){
		    expect(function(){
			kmer.kmerArray("hello", 6);
		    }).to.throw(TypeError, "takes a String whose length > k as its first positional argument");
		});
	    });
	    describe("invalid second positional argument", function(){
		var s;
		before(function(){
		    s = "helloworld";
		});
		it("throws a TypeError when run with undefined", function(){
		    expect(function(){
			kmer.kmerArray(s, undefined);
		    }).to.throw(TypeError, "takes an integer as its second and final positional argument");;
		});
		it("throws a TypeError when run with a String", function(){
		    expect(function(){
			kmer.kmerArray(s, '');
		    }).to.throw(TypeError, "takes an integer as its second and final positional argument");
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.kmerArray(s, true);
		    }).to.throw(TypeError, "takes an integer as its second and final positional argument");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			kmer.kmerArray(s, []);
		    }).to.throw(TypeError, "takes an integer as its second and final positional argument");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			kmer.kmerArray(s, {});
		    }).to.throw(TypeError, "takes an integer as its second and final positional argument");
		});
		it("throws a TypeError when run with a floating point number", function(){
		    expect(function(){
			kmer.kmerArray(s, 4.4);
		    }).to.throw(TypeError, "This was a float");
		});
	    });
	});
	describe("when run with proper arguments", function(){
	    var s;
	    var substrings;
	    function theoreticalMaximumSimple(n, k){
		return n - k + 1;
	    }

	    before(function(){
		s="helloworld";
		substrings=["hel", "ell", "llo", "low", "owo", "wor", "orl", "rld"];

		function getRandomInt(max) {
		    return Math.floor(Math.random() * Math.floor(max));
		}
	    });
	    it("returns an Array", function(){
		expect(kmer.kmerArray(s, 3)).to.be.an.instanceof(Array);
	    });
	    it("returns the theoretical maximum (n!/(n-k)! = n-k+1) substrings", function(){
		// Test all cases where 0 < k < n and prove that the theoretically correct number of substrings is calculated.
		for (i=1; i < s.length; i++){
		    var maxLength = theoreticalMaximumSimple(s.length, i);
		    expect(kmer.kmerArray(s, i)).to.have.lengthOf(maxLength);
		}
	    });
	});
    });
    describe("kmerFrequencies()", function(){
	var k;
	var kmer;
	before(function(done){
	    k = 2;
	    kmer = new kmerConstructor(k);
	    done();
	});
	describe("when run with improper arguments", function(){
	    describe("invalid first positional argument", function(){
		it("throws a TypeError when run on an undefined", function(){
		    expect(function(){
			kmer.kmerFrequencies(undefined, 4);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on a number", function(){
		    expect(function(){
			kmer.kmerFrequencies(1, 4);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on a boolean", function(){
		    expect(function(){
			kmer.kmerFrequencies(true, 4);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on an Array", function(){
		    expect(function(){
			kmer.kmerFrequencies([], 4);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on an object", function(){
		    expect(function(){
			kmer.kmerFrequencies({}, 4);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on a String whose length is < k", function(){
		    expect(function(){
			kmer.kmerFrequencies("hello", 6);
		    }).to.throw(TypeError, "takes a String whose length > k as its first positional argument");
		});
		it("throws a TypeError when run on a string with letters not in the alphabet", function(){
		    expect(function(){
			kmer.kmerFrequencies("hello", 4);
		    }).to.throw(TypeError, "takes a String with letters from the alphabet");
		});
	    });
	    describe("invalid second positional argument", function(){
		var s;
		before(function(){
		    s = "helloworld";
		});
		it("throws a TypeError when run with undefined", function(){
		    expect(function(){
			kmer.kmerFrequencies(s, undefined);
		    }).to.throw(TypeError, "takes an integer as its second and final positional argument");;
		});
		it("throws a TypeError when run with a String", function(){
		    expect(function(){
			kmer.kmerFrequencies(s, '');
		    }).to.throw(TypeError, "takes an integer as its second and final positional argument");
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.kmerFrequencies(s, true);
		    }).to.throw(TypeError, "takes an integer as its second and final positional argument");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			kmer.kmerFrequencies(s, []);
		    }).to.throw(TypeError, "takes an integer as its second and final positional argument");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			kmer.kmerFrequencies(s, {});
		    }).to.throw(TypeError, "takes an integer as its second and final positional argument");
		});
		it("throws a TypeError when run with a floating point number", function(){
		    expect(function(){
			kmer.kmerFrequencies(s, 4.4);
		    }).to.throw(TypeError, "This was a float");
		});
	    });
	});
	describe("when run with proper arguments", function(){
	    var s;
	    var substrings;
	    function theoreticalMaximumSimple(n, k){
		return n - k + 1;
	    }

	    before(function(){
		alphabetLength = 4;
		s = "ACTGACTGACTG";
		frequencies = new Uint32Array([0, 3, 0, 0, 0, 0, 0, 3, 2, 0, 0, 0, 0, 0, 3, 0]);

	    });
	    it("returns an Uint32Array", function(){
		expect(kmer.kmerFrequencies(s, 2)).to.be.an.instanceof(Uint32Array);
	    });
	    it("returns the theoretical maximum (n!/(n-k)! = n-k+1) substrings' frequencies", function(done){
		// Test all cases where 0 < k < n and prove that the theoretically correct number of substrings is calculated.
		let range = Array.apply(null, {length: s.length}).map(Number.call, Number).map(function(i){
		    return new Promise(function(resolve, reject){
		    kmar = new kmerConstructor(i);
		    var maxProfileLength = Math.pow(4, i);
		    expect(kmar.kmerFrequencies(s, i)).to.have.lengthOf(maxProfileLength);
		    });
		});
		Promise.join(range).then(function(){
		    done();
		});
	    }).timeout(10000);
	    describe("when k is 2", function(){
		it("returns the correct frequencies for the string", function(){
		    expect(kmer.kmerFrequencies(s, 2)).to.deep.equal(frequencies);
		});
	    });
	});
    });
    describe("streamingUpdate()", function(){
	var kmer;
	var testFasta;
	before(function(){
	    testFasta = "./test/data/hexokinase-small.fa";
	    kmer = new kmerConstructor(2);
	});
	describe("when run improperly", function(){
	    it("throws a TypeError when the streamed inputs are not objects", function(){
		expect(new Promise(function(resolve, reject){
		    fs.createReadStream(testFasta, {encoding: "UTF-8"})
			.pipe(kmer.streamingUpdate())
			.on('error', function(error){
			    reject(error);
			});
		})).to.eventually.throw(TypeError, "expects the pipe to produce objects");
	    });
	    it("throws a TypeError when the streamed objects do not have a 'seq' attributed that is a String", function(){
		expect(new Promise(function(resolve, reject){
		    t = through2.obj(function(chunk, enc, callback){
			this.push(chunk);
		    }).on("error", function(err){
			reject(err);
		    });
		    t.pipe(kmer.streamingUpdate());
		    t.write({"hello": "world"});
		})).to.eventually.throw(TypeError, "expects the pipe to produce objects with a 'seq' attribute. See 'bionode-fasta' for examples.");
	    });
	});
	describe("when run with a proper BioNode file stream", function(){
	    it("updates the profile when piped bionode sequence objects", function(){

		var expectedProfile = new Uint32Array([604,
						       609,
						       657,
						       508,
						       725,
						       693,
						       712,
						       615,
						       832,
						       872,
						       952,
						       523,
						       215,
						       571,
						       860,
						       352]);
		expect(new Promise(function(resolve, reject){
		    fs.createReadStream(testFasta, {encoding: "UTF-8"})
			.pipe(fasta.obj())
			.pipe(kmer.streamingUpdate())
			.on('finish', function(){
			    resolve(kmer.profile);
			}).on("error", function(err){
			    throw err;
			    reject(err);
			});
		})).to.eventually.deep.equal(expectedProfile);
	    }).timeout(10000);
	});
    });
    describe("update()", function(){
	var kmer;
	var update;
	describe("when run with improper arguments", function(){
	    before(function(){
		kmer = new kmerConstructor(2);
	    });
	    it("throws a TypeError when run on undefined", function(){
		expect(function(){
		    kmer.update(undefined);
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run on a Number", function(){
		expect(function(){
		    kmer.update(1);
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run on a Boolean", function(){
		expect(function(){
		    kmer.update(true);
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run on an Array", function(){
		expect(function(){
		    kmer.update([]);
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run on an Object", function(){
		expect(function(){
		    kmer.update({});
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run on a String less than the kmer profile's value of k", function(){
		expect(function(){
		    kmer.update("1");
		}).to.throw(TypeError, "takes a String with length greater than 2 as its only positional argument");
	    });
	    it("throws a TypeError when run on a String with letters not in the pre-specified alphabet", function(){
		expect(function(){
		    kmer.update("1111");
		}).to.throw(TypeError, "takes a String with letters from the alphabet");
	    });
	});
	describe("when run with proper arguments", function(){
	    before(function(){
		kmer = new kmerConstructor(2);
	    });
	    it("updates the profile with counts from the string", function(){
		var expectedProfile = new Uint32Array([2,
						       0,
						       0,
						       0,
						       0,
						       0,
						       0,
						       0,
						       0,
						       0,
						       0,
						       0,
						       0,
						       0,
						       0,
						       0]);
		kmer.update("AAA");
		expect(kmer.profile).to.deep.equal(expectedProfile);
	    });
	});
    });
    describe("sequenceToBinary()", function(){
	var kmer;
	before(function(){
	    kmer = new kmerConstructor(3);
	});
	describe("when run with improper arguments", function(){
	    describe("invalid positional argument", function(){
		it("throws a TypeError when run on an undefined", function(){
		    expect(function(){
			kmer.sequenceToBinary(undefined);
		    }).to.throw(TypeError, "takes a String as its only positional argument");
		});
		it("throws a TypeError when run on a number", function(){
		    expect(function(){
			kmer.sequenceToBinary(1);
		    }).to.throw(TypeError, "takes a String as its only positional argument");
		});
		it("throws a TypeError when run on a boolean", function(){
		    expect(function(){
			kmer.sequenceToBinary(true);
		    }).to.throw(TypeError, "takes a String as its only positional argument");
		});
		it("throws a TypeError when run on an Array", function(){
		    expect(function(){
			kmer.sequenceToBinary([]);
		    }).to.throw(TypeError, "takes a String as its only positional argument");
		});
		it("throws a TypeError when run on an object", function(){
		    expect(function(){
			kmer.sequenceToBinary({});
		    }).to.throw(TypeError, "takes a String as its only positional argument");
		});
		it("throws a TypeError when run on a String whose length is not k", function(){
		    expect(function(){
			kmer.sequenceToBinary("ACTG");
		    }).to.throw(TypeError, "takes a String with length equal to k as its only positional argument");
		});
		it("throws a TypeError when run on a String with invalid letters", function(){
		    expect(function(){
			kmer.sequenceToBinary("oof");
		    }).to.throw(TypeError, "takes a String with letters in the specified alphabet as its only positional argument");
		});
	    });
	});
	describe("when run with proper arguments", function(){
	    it("returns an integer when run with a string", function(){
		expect(kmer.sequenceToBinary("AAA")).to.equal(0);
		expect(kmer.sequenceToBinary("AAT")).to.equal(3);
		expect(kmer.sequenceToBinary("ATA")).to.equal(12);
		expect(kmer.sequenceToBinary("TAA")).to.equal(48);
	    });
	});
    });
    describe("binaryToSequence()", function(){
	var kmer;
	before(function(){
	    kmer = new kmerConstructor(3);
	});
	describe("when run with improper arguments", function(){
	    describe("invalid positional argument", function(){
		it("throws a TypeError when run on an undefined", function(){
		    expect(function(){
			kmer.binaryToSequence(undefined);
		    }).to.throw(TypeError, "takes a Number as its only positional argument");
		});
		it("throws a TypeError when run on a boolean", function(){
		    expect(function(){
			kmer.binaryToSequence(true);
		    }).to.throw(TypeError, "takes a Number as its only positional argument");
		});
		it("throws a TypeError when run on a String", function(){
		    expect(function(){
			kmer.binaryToSequence("hello world");
		    }).to.throw(TypeError, "takes a Number as its only positional argument");
		});
		it("throws a TypeError when run on an Array", function(){
		    expect(function(){
			kmer.binaryToSequence([]);
		    }).to.throw(TypeError, "takes a Number as its only positional argument");
		});
		it("throws a TypeError when run on an object", function(){
		    expect(function(){
			kmer.binaryToSequence({});
		    }).to.throw(TypeError, "takes a Number as its only positional argument");
		});
		it("throws a TypeError when run on a float", function(){
		    expect(function(){
			kmer.binaryToSequence(1.5);
		    }).to.throw(TypeError, "takes an integer as its only positional argument. This was a float");
		});
	    });
	});
	describe("when run with proper arguments", function(){
	    it("returns an integer when run with a string", function(){
		expect(kmer.binaryToSequence(0)).to.equal("AAA");
		expect(kmer.binaryToSequence(3)).to.equal("AAT");
		expect(kmer.binaryToSequence(12)).to.equal("ATA");
		expect(kmer.binaryToSequence(48)).to.equal("TAA");
	    });
	});	
    });

    describe("profileAsArray", function(){
	var numKmers;
	var k;
	var kmer;
	var alphabet;
	before(function(done){
	    k = 3;
	    alphabet = "ACGT";
	    kmer = new kmerConstructor(3);
	    numKmers = Math.pow(4, alphabet);
	    done();
	});
	describe("when run with improper arguments", function(){
	    describe("invalid first positional argument", function(){
		it("throws a TypeError when run on an undefined", function(){
		    expect(function(){
			kmer.profileAsArray(undefined, alphabet);
		    }).to.throw(TypeError, "takes a Number as its first positional argument");
		});
		it("throws a TypeError when run on a String", function(){
		    expect(function(){
			kmer.profileAsArray('', alphabet);
		    }).to.throw(TypeError, "takes a Number as its first positional argument");
		});
		it("throws a TypeError when run on a boolean", function(){
		    expect(function(){
			kmer.profileAsArray(true, alphabet);
		    }).to.throw(TypeError, "takes a Number as its first positional argument");
		});
		it("throws a TypeError when run on an Array", function(){
		    expect(function(){
			kmer.profileAsArray([], alphabet);
		    }).to.throw(TypeError, "takes a Number as its first positional argument");
		});
		it("throws a TypeError when run on an object", function(){
		    expect(function(){
			kmer.profileAsArray({}, alphabet);
		    }).to.throw(TypeError, "takes a Number as its first positional argument");
		});
		it("throws a TypeError when run on a float", function(){
		    expect(function(){
			kmer.profileAsArray(2.5, alphabet);
		    }).to.throw(TypeError, "takes an integer as its first positional argument. This was a float");
		});
	    });
	    describe("invalid second positional argument", function(){
		var k;
		var alphabet;
		before(function(){
		    k = 2;
		    alphabet = "ACGT";
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.profileAsArray(k, true);
		    }).to.throw(TypeError, "expects the optional second positional argument to be a String");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			kmer.profileAsArray(k, []);
		    }).to.throw(TypeError, "expects the optional second positional argument to be a String");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			kmer.profileAsArray(k, {});
		    }).to.throw(TypeError, "expects the optional second positional argument to be a String");
		});
		it("throws a TypeError when run with a String with length 1", function(){
		    expect(function(){
			kmer.profileAsArray(k, 'a');
		    }).to.throw(TypeError, "expects the optional second positional argument to have a length > 1");
		});
	    });
	});
	describe("when run with proper arguments", function(){
	    it("will *not* throw a TypeError when run with an undefined alphabet", function(){
		expect(function(){
		    kmer.profileAsArray(k, undefined);
		}).to.not.throw(TypeError, "expects the optional second positional argument to be a String");
	    });
	    it("will *not* throw a TypeError when run with an empty String alphabet", function(){
		expect(function(){
		    kmer.profileAsArray(k, '');
		}).to.not.throw(TypeError, "expects the optional second positional argument to have a length > 1");
	    });
	    it("returns an Uint32Array", function(){
		expect(kmer.profileAsArray(k)).to.be.an.instanceof(Uint32Array);
	    });
	    it("has length equal to 4^k", function(){
		var letters = "ACGT"; // 4 letters
		expect(kmer.profileAsArray(2, letters)).to.have.lengthOf(Math.pow(letters.length, 2));
		expect(kmer.profileAsArray(3, letters)).to.have.lengthOf(Math.pow(letters.length, 3));
	    });
	});
    });
    describe("TotalProfileCounts()", function(){
	var k;
	var kmer;
	var test;
	var expectedProfile; 

	before(function(done){
	    k = 2;
	    expectedProfile = new Uint32Array([604,
					       609,
					       657,
					       508,
					       725,
					       693,
					       712,
					       615,
					       832,
					       872,
					       952,
					       523,
					       215,
					       571,
					       860,
					       352]);
	    kmer = new kmerConstructor(k);
	    testFasta = "./test/data/hexokinase-small.fa";
	    fs.createReadStream(testFasta, {encoding: "UTF-8"})
		.pipe(fasta.obj())
		.pipe(kmer.streamingUpdate())
	        .on('finish', done);
	});

	it("returns a number", function(){
	    expect(kmer.TotalProfileCounts()).to.be.a('number');
	});
	it("returns a sum of profile counts", function(){
	    var expectedSum = Array.from(expectedProfile).reduce((a, b) => a + b);
	    expect(kmer.TotalProfileCounts()).to.equal(expectedSum);
	});
    });
    describe("frequency()", function(){
	var k;
	var kmer;
	var expectedProfile;
	before(function(){
	    k = 2;
	    expectedProfile = new Uint32Array([604,
					       609,
					       657,
					       508,
					       725,
					       693,
					       712,
					       615,
					       832,
					       872,
					       952,
					       523,
					       215,
					       571,
					       860,
					       352]);
	    kmer = new kmerConstructor(k);
	    kmer.profile = expectedProfile;
	    kmer.TotalProfileCounts();
	});

	describe("when run with improper arguments", function(){
	    it("throws a TypeError when run with a boolean", function(){
		expect(function(){
		    kmer.frequency(undefined);
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run with a boolean", function(){
		expect(function(){
		    kmer.frequency(true);
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run with an Array", function(){
		expect(function(){
		    kmer.frequency([]);
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run with an Object", function(){
		expect(function(){
		    kmer.frequency({});
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run with a String with length 1", function(){
		expect(function(){
		    kmer.frequency("A");
		}).to.throw(TypeError, `takes a String with length ${k} as its only positional argument`);
		expect(function(){
		    kmer.frequency("ATA");
		}).to.throw(TypeError, `takes a String with length ${k} as its only positional argument`);
	    });
	});
	describe("when run with proper arguments", function(){
	    it("returns a number", function(){
		expect(kmer.frequency("AA")).to.be.a('number');
	    });
	    it("returns the correct frequency", function(){
		expect(kmer.frequency("AA")).to.equal(604/10300);
	    });
	});
    });
    describe("transitionProbability()", function(){
	var k;
	var kmer;
	var expectedProfile;
	var seq1;
	var seq2;
	before(function(){
	    k = 2;
	    alphabet = "ACGT";
	    expectedProfile = new Uint32Array([604,
					       609,
					       657,
					       508,
					       725,
					       693,
					       712,
					       615,
					       832,
					       872,
					       952,
					       523,
					       215,
					       571,
					       860,
					       352]);
	    kmer = new kmerConstructor(k);
	    kmer.profile = expectedProfile;
	    kmer.TotalProfileCounts();
	    seq1 = "AA";
	    seq2 = "AT";
	});
	describe("when run with improper arguments", function(){
	    describe("invalid first positional argument", function(){
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.transitionProbability(undefined, seq2);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.transitionProbability(true, seq2);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			kmer.transitionProbability([], seq2);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			kmer.transitionProbability({}, seq2);
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run with a String with length != k", function(){
		    expect(function(){
			return kmer.transitionProbability("A", seq2);
		    }).to.throw(TypeError, `takes a sequence of length ${k} as its first positional argument`);
		    expect(function(){
			return kmer.transitionProbability("ATA", seq2);
		    }).to.throw(TypeError, `takes a sequence of length ${k} as its first positional argument`);
		});
	    });
	    describe("invalid second positional argument", function(){
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.transitionProbability(seq1, undefined);
		    }).to.throw(TypeError, "takes a String as its second positional argument");
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.transitionProbability(seq1, true);
		    }).to.throw(TypeError, "takes a String as its second positional argument");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			kmer.transitionProbability(seq1, []);
		    }).to.throw(TypeError, "takes a String as its second positional argument");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			kmer.transitionProbability(seq1, {});
		    }).to.throw(TypeError, "takes a String as its second positional argument");
		});
		it("throws a TypeError when run with a String whose length != k", function(){
		    expect(function(){
			return kmer.transitionProbability(seq1, "A");
		    }).to.throw(TypeError, `takes a sequence of length ${k} as its second positional argument`);
		    expect(function(){
			return kmer.transitionProbability(seq1, "ATA");
		    }).to.throw(TypeError, `takes a sequence of length ${k} as its second positional argument`);
		});
	    });
	});
	describe("when run with proper arguments", function(){
	    it("returns a number", function(){
		expect(kmer.transitionProbability("AA", "AT")).to.be.a('number');
	    });
	    it("throws a TypeError when the suffix of seq1 is not equal to the suffix of seq2", function(){
		expect(kmer.transitionProbability("AA", "TT")).to.equal(0);
	    });
	    it("returns the expected transition probability for a sequence", function(){
		var prefixProbs = [ 0.058640776699029125, // AA
				    0.05912621359223301, // AC
				    0.0637864077669903, // AG
				    0.04932038834951456 ]; // AT
		var expectedTransitionProbability = prefixProbs[3]/prefixProbs.reduce((a,b) => a+b);
		expect(kmer.transitionProbability("AA", "AT")).to.equal(expectedTransitionProbability);
	    });
	});
    });
    describe("probabilityOfSequence()", function(){
	var k;
	var kmer;
	var expectedProfile;
	var seq1;
	var seq2;
	var alphabet;
	before(function(){
	    k = 2;
	    alphabet = "ACGT";
	    expectedProfile = new Uint32Array([604,
					       609,
					       657,
					       508,
					       725,
					       693,
					       712,
					       615,
					       832,
					       872,
					       952,
					       523,
					       215,
					       571,
					       860,
					       352]);
	    kmer = new kmerConstructor(k);
	    kmer.profile = expectedProfile;
	    kmer.TotalProfileCounts();
	    seq1 = "AA";
	    seq2 = "AT";
	});
	describe("when run with an improper argument", function(){
	    it("throws a TypeError when run with a boolean", function(){
		expect(function(){
		    kmer.probabilityOfSequence(undefined);
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run with a boolean", function(){
		expect(function(){
		    kmer.probabilityOfSequence(true);
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run with an Array", function(){
		expect(function(){
		    kmer.probabilityOfSequence([]);
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run with an Object", function(){
		expect(function(){
		    kmer.probabilityOfSequence({});
		}).to.throw(TypeError, "takes a String as its only positional argument");
	    });
	    it("throws a TypeError when run with a String with length != k", function(){
		expect(function(){
		    kmer.probabilityOfSequence("A");
		}).to.throw(TypeError, "takes a String with length greater than " + k + " as its only positional argument");
		expect(function(){
		    kmer.probabilityOfSequence("AA");
		}).to.throw(TypeError, "takes a String with length greater than " + k + " as its only positional argument");
	    });
	    it("throws a TypeError when run a String with letters not in the residue alphabet", function(){
		expect(function(){
		    kmer.probabilityOfSequence("helloworld");
		}).to.throw(TypeError, "takes a String with letters from the alphabet '" + alphabet + "'" );
	    });
	});
	describe("when run with proper arguments", function(){
	    it("returns a number", function(){
		expect(kmer.probabilityOfSequence("AAT")).to.be.a('number');
	    });
	    it("returns the product of transition probabilities of the kmers", function(){
		var prefixProbs = [ 0.058640776699029125, // AA
				    0.05912621359223301, // AC
				    0.0637864077669903, // AG
				    0.04932038834951456 ]; // AT
		var expectedTransitionProbability = prefixProbs[3]/prefixProbs.reduce((a,b) => a+b);
		expect(Number(kmer.probabilityOfSequence("AAT").toFixed(10))).to.equal(Number(expectedTransitionProbability.toFixed(10)));
	    });
	});
    });
    describe("euclidean()", function(){
	var k;
	var kmer;
	var prof1;
	var prof2;
	var prof3;
	var alphabet;
	before(function(){
	    k = 2;
	    alphabet = "ACGT";
	    prof1 = new Uint32Array([4, 3]);
	    prof2 = new Uint32Array([12, 9]);
	    prof3 = new Uint32Array([4, 0]);
	    dist = 0;
	    kmer = new kmerConstructor(k);
	});
	describe("when run with an improper argument", function(){
	    describe("invalid first positional argument", function(){
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.euclidean(undefined);
		    }).to.throw(TypeError, "takes a Uint32Array as its first positional argument");
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.euclidean(true);
		    }).to.throw(TypeError, "takes a Uint32Array as its first positional argument");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			kmer.euclidean([]);
		    }).to.throw(TypeError, "takes a Uint32Array as its first positional argument");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			kmer.euclidean({});
		    }).to.throw(TypeError, "takes a Uint32Array as its first positional argument");
		});
		it("throws a TypeError when run with a String", function(){
		    expect(function(){
			kmer.euclidean("A");
		    }).to.throw(TypeError, "takes a Uint32Array as its first positional argument");
		});
	    });
	    describe("invalid second positional argument", function(){
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.euclidean(prof1, undefined);
		    }).to.throw(TypeError, "takes a Uint32Array as its second positional argument");
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.euclidean(prof1, true);
		    }).to.throw(TypeError, "takes a Uint32Array as its second positional argument");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			kmer.euclidean(prof1, []);
		    }).to.throw(TypeError, "takes a Uint32Array as its second positional argument");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			kmer.euclidean(prof1, {});
		    }).to.throw(TypeError, "takes a Uint32Array as its second positional argument");
		});
		it("throws a TypeError when run with a String", function(){
		    expect(function(){
			kmer.euclidean(prof1, "A");
		    }).to.throw(TypeError, "takes a Uint32Array as its second positional argument");
		});		
	    });
	});
	describe("when run with proper arguments", function(){
	    it("normalizes the vectors before euclidean distance", function(){
		expect(kmer.euclidean(prof1, prof1)).to.equal(0);
		expect(kmer.euclidean(prof1, prof2)).to.equal(0);
	    });
	    it("returns the correct distance of a pythagorean triple", function(){
		expect(kmer.euclidean(prof1, prof3)).to.equal(0.63245553);
	    });
	});
    });
    describe("correlation", function(){
	var k;
	var kmer;
	var prof1;
	var prof2;
	var alphabet;
	before(function(){
	    k = 2;
	    alphabet = "ACGT";
	    prof1 = new Uint32Array([1,2,3,4]);
	    prof2 = new Uint32Array([4,3,2,1]);
	    kmer = new kmerConstructor(k);
	});
	describe("when run with an improper argument", function(){
	    describe("invalid first positional argument", function(){
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.correlation(undefined);
		    }).to.throw(TypeError, "takes a Uint32Array as its first positional argument");
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.correlation(true);
		    }).to.throw(TypeError, "takes a Uint32Array as its first positional argument");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			kmer.correlation([]);
		    }).to.throw(TypeError, "takes a Uint32Array as its first positional argument");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			kmer.correlation({});
		    }).to.throw(TypeError, "takes a Uint32Array as its first positional argument");
		});
		it("throws a TypeError when run with a String", function(){
		    expect(function(){
			kmer.correlation("A");
		    }).to.throw(TypeError, "takes a Uint32Array as its first positional argument");
		});
	    });
	    describe("invalid second positional argument", function(){
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.correlation(prof1, undefined);
		    }).to.throw(TypeError, "takes a Uint32Array as its second positional argument");
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmer.correlation(prof1, true);
		    }).to.throw(TypeError, "takes a Uint32Array as its second positional argument");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			kmer.correlation(prof1, []);
		    }).to.throw(TypeError, "takes a Uint32Array as its second positional argument");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			kmer.correlation(prof1, {});
		    }).to.throw(TypeError, "takes a Uint32Array as its second positional argument");
		});
		it("throws a TypeError when run with a String", function(){
		    expect(function(){
			kmer.correlation(prof1, "A");
		    }).to.throw(TypeError, "takes a Uint32Array as its second positional argument");
		});		
	    });
	});
	describe("when run with proper arguments", function(){
	    it("returns a number", function(){
		expect(kmer.correlation(prof1, prof1)).to.be.a('number');
	    });
	    it("returns the correct (anti)correlation distance", function(){

		expect(kmer.correlation(prof1, prof1)).to.equal(1.00000);
		expect(kmer.correlation(prof1, prof2)).to.equal(-1.00000);
	    });
	});
    });
});
