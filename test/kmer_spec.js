'use-strict';
const expect = require("chai").expect;
const through2 = require('through2');
const fs = require('fs');
const fasta = require('bionode-fasta');

const kmerConstructor = require('./../');

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
			kmerConstructor(undefined);
		    }).to.throw(TypeError, "takes an integer as its first positional argument");;
		});
		it("throws a TypeError when run with a String", function(){
		    expect(function(){
			kmerConstructor('');
		    }).to.throw(TypeError, "takes an integer as its first positional argument");
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmerConstructor(true);
		    }).to.throw(TypeError, "takes an integer as its first positional argument");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			kmerConstructor([]);
		    }).to.throw(TypeError, "takes an integer as its first positional argument");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			kmerConstructor({});
		    }).to.throw(TypeError, "takes an integer as its first positional argument");
		});
		it("throws a TypeError when run with a floating point number", function(){
		    expect(function(){
			kmerConstructor(4.4)
		    }).to.throw(TypeError, "This was a float");
		});
	    });
	    describe("invalid second positional argument", function(){
		// Passing undefined to a named argument with a default value leads to default value
		// Passing an empty string *counts* as undefined, and thus the default value of 'ATCG' is used
		xit("throws a TypeError when run with an empty String", function(){
		    expect(function(){
			kmerConstructor(k, '');
		    }).to.throw(TypeError, "expects the optional second positional argument to have a length > 1");
		});
		it("throws a TypeError when run with an Number", function(){
		    expect(function(){
			kmerConstructor(k, 1)
		    }).to.throw(TypeError, "expects the optional second positional argument to be a String")
		});
		it("throws a TypeError when run with a boolean", function(){
		    expect(function(){
			kmerConstructor(k, true);
		    }).to.throw(TypeError, "expects the optional second positional argument to be a String");
		});
		it("throws a TypeError when run with an Array", function(){
		    expect(function(){
			kmerConstructor(k, []);
		    }).to.throw(TypeError, "expects the optional second positional argument to be a String");
		});
		it("throws a TypeError when run with an Object", function(){
		    expect(function(){
			kmerConstructor(k, {});
		    }).to.throw(TypeError, "expects the optional second positional argument to be a String");
		});
	    });
	});
	describe("when run with proper arguments", function(){
	    var kmer;
	    var k
	    before(function(){
		k = 2
		kmer = kmerConstructor(2)
	    });
	    it("returns an Object", function(){
		expect(kmer).to.be.an.instanceof(Object);
	    });
	    it("has a 'profile' attribute", function(){
		expect(kmer).to.have.property('profile');
	    });
	    it("the 'profile' has a # of combinations equal to n^k, where n is the size of the alphabet", function(){
		// Because k = 2 and alphabet size is 4: 4^2 = 16
		var uniqueKmers = Math.pow(4, k);
		expect(Object.keys(kmer.profile)).to.have.lengthOf(uniqueKmers);
	    });
	    it("has a 'kmerArray' attribute", function(){
		expect(kmer).to.have.property('kmerArray');
	    });
	    it("has a 'streamingUpdate' attribute", function(){
		expect(kmer).to.have.property('streamingUpdate');
	    });
	});
    });
    describe("kmerArray()", function(){
	var k;
	var kmer;
	before(function(done){
	    k = 3
	    kmer = kmerConstructor(k);
	    done();
	});
	describe("when run with improper arguments", function(){
	    describe("invalid first positional argument", function(){
		it("throws a TypeError when run on an undefined", function(){
		    expect(function(){
			kmer.kmerArray(undefined, 4)
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on a number", function(){
		    expect(function(){
			kmer.kmerArray(1, 4)
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on a boolean", function(){
		    expect(function(){
			kmer.kmerArray(true, 4)
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on an Array", function(){
		    expect(function(){
			kmer.kmerArray([], 4)
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on an object", function(){
		    expect(function(){
			kmer.kmerArray({}, 4)
		    }).to.throw(TypeError, "takes a String as its first positional argument");
		});
		it("throws a TypeError when run on a String whose length is < k", function(){
		    expect(function(){
			kmer.kmerArray("hello", 6)
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
			kmer.kmerArray(s, 4.4)
		    }).to.throw(TypeError, "This was a float");
		});
	    });
	});
	describe("when run with proper arguments", function(){
	    var s;
	    var substrings;
	    function theoreticalMaximumSimple(n, k){
		return n - k + 1
	    }

	    before(function(){
		s="helloworld";
		substrings=["hel", "ell", "llo", "low", "owo", "wor", "orl", "rld"]

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
    describe("streamingUpdate()", function(){
	var kmer;
	before(function(){
	    kmer = kmerConstructor(2);
	});
	it("updates the profile when piped bionode sequence objects", function(done){
	    var testFasta = "./test/data/hexokinase-small.fa"
	    var expectedProfile = { AA: 604,
				    AC: 609,
				    AT: 508,
				    AG: 657,
				    CA: 725,
				    CC: 693,
				    CT: 615,
				    CG: 712,
				    TA: 215,
				    TC: 571,
				    TT: 352,
				    TG: 860,
				    GA: 832,
				    GC: 872,
				    GT: 523,
				    GG: 952 }
		fs.createReadStream(testFasta, {encoding: "UTF-8"})
		    .pipe(fasta.obj())
		    .pipe(kmer.streamingUpdate())
	        .on('finish', function(){
		    expect(kmer.profile).to.deep.equal(expectedProfile);
		    done()
		});





	}).timeout(10000);
    });

});
