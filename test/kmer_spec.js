'use-strict';
const expect = require("chai").expect;
kmers = require("./../");

describe("kmers()", function(){
    describe("when run with improper arguments", function(){
	describe("invalid first positional argument", function(){
	    it("throws a TypeError when run on an undefined", function(){
		expect(function(){
		    kmers(undefined, 4)
		}).to.throw(TypeError, "takes a String as its first positional argument");
	    });
	    it("throws a TypeError when run on a number", function(){
		expect(function(){
		    kmers(1, 4)
		}).to.throw(TypeError, "takes a String as its first positional argument");
	    });
	    it("throws a TypeError when run on a boolean", function(){
		expect(function(){
		    kmers(true, 4)
		}).to.throw(TypeError, "takes a String as its first positional argument");
	    });
	    it("throws a TypeError when run on an Array", function(){
		expect(function(){
		    kmers([], 4)
		}).to.throw(TypeError, "takes a String as its first positional argument");
	    });
	    it("throws a TypeError when run on an object", function(){
		expect(function(){
		    kmers({}, 4)
		}).to.throw(TypeError, "takes a String as its first positional argument");
	    });
	    it("throws a TypeError when run on a String whose length is < k", function(){
		expect(function(){
		    kmers("hello", 6)
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
		    kmers(s, undefined);
		}).to.throw(TypeError, "takes an integer as its second and final positional argument");;
	    });
	    it("throws a TypeError when run with a String", function(){
		expect(function(){
		    kmers(s, '');
		}).to.throw(TypeError, "takes an integer as its second and final positional argument");
	    });
	    it("throws a TypeError when run with a boolean", function(){
		expect(function(){
		    kmers(s, true);
		}).to.throw(TypeError, "takes an integer as its second and final positional argument");
	    });
	    it("throws a TypeError when run with an Array", function(){
		expect(function(){
		    kmers(s, []);
		}).to.throw(TypeError, "takes an integer as its second and final positional argument");
	    });
	    it("throws a TypeError when run with an Object", function(){
		expect(function(){
		    kmers(s, {});
		}).to.throw(TypeError, "takes an integer as its second and final positional argument");
	    });
	    it("throws a TypeError when run with a floating point number", function(){
		expect(function(){
		    kmers(s, 4.4)
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
	    expect(kmers(s, 3)).to.be.an.instanceof(Array);
	});
	it("returns the theoretical maximum (n!/(n-k)! = n-k+1) substrings", function(){
	    // Test all cases where 0 < k < n and prove that the theoretically correct number of substrings is calculated.
	    for (i=1; i < s.length; i++){
		var maxLength = theoreticalMaximumSimple(s.length, i);
		expect(kmers(s, i)).to.have.lengthOf(maxLength);
	    }
	});
    });
});
