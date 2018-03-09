#!/bin/env node
'use strict';
const Kmer      = require('./../');
const kmerArray = new Kmer(2).kmerArray;
const Benchmark = require('benchmark');
var suite = new Benchmark.Suite



function constantN(k){
    const s = "helloworld";
    for (var i = 1; i < s.length; i++){
	suite.add(`kmers() with string 'helloworld' (length 10) and k = ${i}`, function(){
	    kmerArray(s, i);
	});
    }
    return suite;
};

function constantK(){
    var min = 10;
    var max = 100;
    for (var i = min; i < max; i++){
	var s = Array(i).fill(1).join('');
	var k = Math.floor(i*0.45);
	suite.add(`kmerArray() with string '${s}' (length ${s.length}) and k = ${k}`, function(){
	    kmerArray(s, k);
	});
    }
    return suite
}

suite.on("cycle", function(event){
    console.log(String(event.target));
}).on("complete", function(){
    console.log("Fastest is " + this.filter("fastest").map("name"));
});


constantN(3).run();
constantK().run();
