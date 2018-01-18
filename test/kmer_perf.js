#!/bin/env node

const kmers = require('./../');
const Benchmark = require('benchmark');
var suite = new Benchmark.Suite



function constantN(k){
    const s = "helloworld";
    for (i = 1; i < s.length; i++){
	suite.add(`kmers() with string 'helloworld' (length 10) and k = ${i}`, function(){
	    kmers(s, i);
	});
    }
    return suite;
};

function constantK(){
    let min = 10;
    let max = 100;
    for (i = min; i < max; i++){
	let s = Array(i).fill(1).join('');
	let k = Math.floor(i*0.45);
	suite.add(`kmers() with string '${s}' (length ${s.length}) and k = ${k}`, function(){
	    kmers(s, k);
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
