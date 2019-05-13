const logger = require('./../app/loadLogger').logger;
const program = require('commander');
const Type = require('type-of-is');
const fs = require('fs');
const fasta = require('bionode-fasta');
const fastq = require('bionode-fastq');
const s3 = require('aws-sdk/clients/s3');
const Promise = require('bluebird');
const zlib = require('zlib');

// Kmer.js
const kmerConstructor = require('./../kmer');
// Initialize
var kmer;


function getProfile(k, seqpath){
  if (!Type.is(k, Number)) throw TypeError("readProfile expects a Number k as its first positional argument");
    else if (!Type.is(seqpath, String)) throw TypeError("readProfile expects a String seqpath as its second positional argument");
    else {
	return new Promise(function(resolve, reject){
	    logger.debug(`Determining format and compression for '${seqpath}`);
	    kmer = new kmerConstructor(k);
	    if (seqpath.indexOf('.fa') === -1 && seqpath.indexOf('.fasta') === -1 && seqpath.indexOf('.fq') === -1 && seqpath.indexOf('.fastq') === -1) {
		let err = new Error(`seqpath '${seqpath}' is neither a fasta nor a fastq file`);
		logger.debug(err);
		reject(err);
	    } else if (seqpath.indexOf("s3://") > -1) { // Handling an s3 filestream
		logger.info(`Creating profile from S3 object '${seqpath}'`);
		let pathsegs = seqpath.replace('s3://', '').split('/');
		let params = {
		    bucket: pathsegs[0],
		    path: pathsegs.slice(1)
		};
		s3.headObject(params, function(err, metadata){
		    if (err && err.code === 'NotFound'){
			let err = new Error(`S3 object '${seqpath}' was not found or inaccessible`);
			logger.debug(err);
			reject(err);
		    } else if (seqpath.indexOf('.fa') > -1 || seqpath.indexOf('.fasta') > -1) {
			if (seqpath.endsWith('.gz')) {
			    logger.debug(`Streaming profile from gzipped fasta '${seqpath}'`);
			    s3.getObject(params).createReadStream()
				.pipe(zlib.createUnzip())
				.pipe(fasta.obj())
				.pipe(kmer.streamingUpdate())
				.on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(kmer.profile);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			} else {
			    logger.debug(`Streaming profile from S3 uncompressed fasta '${seqpath}'`);
			    s3.getObject(params).createReadStream()
				.pipe(fasta.obj())
				.pipe(kmer.streamingUpdate())
				.on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(kmer.profile);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			}
		    } else if (seqpath.indexOf('.fq') > -1 || seqpath.indexOf('.fastq') > -1) {
			if (seqpath.endsWith('.gz')) {
			    logger.debug(`Streaming profile from S3 compressed fastq '${seqpath}'`);
			    s3.getObject(params).createReadStream()
				.pipe(zlib.createUnzip())
				.pipe(fastq.obj())
				.pipe(kmer.streamingUpdate())
				.on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(kmer.profile);
				}).on('error', function(err){
				    logger.error(err);
				    reject(err);
				});
			} else {
			    logger.debug(`Streaming profile from S3 uncompressed fastq '${seqpath}'`);
			    s3.getObject(params).createReadStream()
				.pipe(fastq.obj())
				.pipe(kmer.streamingUpdate())
				.on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(kmer.profile);
				}).on('error', function(err){
				    logger.error(err);
				    reject(err);
				});			    
			}
		    }
		});
	    } else { // Reading file on local storage
		fs.access(seqpath, fs.constants.R_OK, function(err){
		    if (err) {
			logger.debug(err);
			let err = new Error(`Filepath ${seqpath} is not accessible`);
			logger.debug(err);
			reject(err);
		    } else if (seqpath.indexOf('.fa') > -1 || seqpath.indexOf('.fasta') > -1) {
			if (seqpath.endsWith('.gz')){
			    logger.debug(`Creating profile from gzipped fasta '${seqpath}'`);
			    fs.createReadStream(seqpath)
				.pipe(zlib.createUnzip())
				.pipe(fasta.obj())
				.pipe(kmer.streamingUpdate())
				.on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(kmer.profile);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			} else {
			    logger.debug(`Creating profile from uncompressed fasta '${seqpath}'`);
			    fs.createReadStream(seqpath, {encoding: "UTF-8"})
				.pipe(fasta.obj())
				.pipe(kmer.streamingUpdate())
				.on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(kmer.profile);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			}
		    } else if (seqpath.indexOf('.fq') > -1 || seqpath.indexOf('.fastq') > -1) {
			if (seqpath.endsWith('.gz')){
			    logger.debug(`Creating profile from gzipped fastq '${seqpath}'`);
			    fs.createReadStream(seqpath)
				.pipe(zlib.createUnzip())
				.pipe(fastq.obj())
				.pipe(kmer.streamingUpdate())
				.on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(kmer.profile);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			} else {
			    logger.debug(`Creating profile from uncompressed fastq '${seqpath}'`);
			    fs.createReadStream(seqpath, {encoding: "UTF-8"})
				.pipe(fastq.obj())
				.pipe(kmer.streamingUpdate())
				.on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    resolve(kmer.profile);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			}
		    }
		});
	    }
	});
    }
}


function readFasta(seqpath){
    let data = [];
    if (!Type.is(seqpath, String)) throw TypeError("readProfile expects a String seqpath as its second positional argument");
    else {
	return new Promise(function(resolve, reject){
	    logger.debug(`Determining format and compression for '${seqpath}`);
	    if (seqpath.indexOf('.fa') === -1 && seqpath.indexOf('.fasta') === -1 && seqpath.indexOf('.fq') === -1 && seqpath.indexOf('.fastq') === -1) {
		let err = new Error(`seqpath '${seqpath}' is neither a fasta nor a fastq file`);
		logger.debug(err);
		reject(err);
	    } else if (seqpath.indexOf("s3://") > -1) { // Handling an s3 filestream
		logger.info(`Reading sequence objects from S3 object '${seqpath}'`);
		let pathsegs = seqpath.replace('s3://', '').split('/');
		let params = {
		    bucket: pathsegs[0],
		    path: pathsegs.slice(1)
		};
		s3.headObject(params, function(err, metadata){
		    if (err && err.code === 'NotFound'){
			let err = new Error(`S3 object '${seqpath}' was not found or inaccessible`);
			logger.debug(err);
			reject(err);
		    } else if (seqpath.indexOf('.fa') > -1 || seqpath.indexOf('.fasta') > -1) {
			if (seqpath.endsWith('.gz')) {
			    logger.debug(`Streaming sequence objects from gzipped fasta '${seqpath}'`);
			    s3.getObject(params).createReadStream()
				.pipe(zlib.createUnzip())
				.pipe(fasta.obj())
				.on('data', function(d){
				    data.push(d);
				}).on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(data);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			} else {
			    logger.debug(`Streaming sequence objects from S3 uncompressed fasta '${seqpath}'`);
			    s3.getObject(params).createReadStream()
				.pipe(fasta.obj())
				.on('data', function(d){
				    data.push(d);
				}).on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(data);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			}
		    } else if (seqpath.indexOf('.fq') > -1 || seqpath.indexOf('.fastq') > -1) {
			if (seqpath.endsWith('.gz')) {
			    logger.debug(`Streaming sequence objects from S3 compressed fastq '${seqpath}'`);
			    s3.getObject(params).createReadStream()
				.pipe(zlib.createUnzip())
				.pipe(fastq.obj())
				.on('data', function(d){
				    data.push(d);
				}).on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(data);
				}).on('error', function(err){
				    logger.error(err);
				    reject(err);
				});
			} else {
			    logger.debug(`Streaming sequence objects from S3 uncompressed fastq '${seqpath}'`);
			    s3.getObject(params).createReadStream()
				.pipe(fastq.obj())
				.on('data', function(d){
				    data.push(d);
				}).on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(data);
				}).on('error', function(err){
				    logger.error(err);
				    reject(err);
				});			    
			}
		    }
		});
	    } else { // Reading file on local storage
		fs.access(seqpath, fs.constants.R_OK, function(err){
		    if (err) {
			logger.debug(err);
			let err = new Error(`Filepath ${seqpath} is not accessible`);
			logger.debug(err);
			reject(err);
		    } else if (seqpath.indexOf('.fa') > -1 || seqpath.indexOf('.fasta') > -1) {
			if (seqpath.endsWith('.gz')){
			    logger.debug(`Reading sequence objects from gzipped fasta '${seqpath}'`);
			    fs.createReadStream(seqpath)
				.pipe(zlib.createUnzip())
				.pipe(fasta.obj())
				.on('data', function(d){
				    data.push(d);
				}).on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(data);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			} else {
			    logger.debug(`Reading sequence objects from uncompressed fasta '${seqpath}'`);
			    fs.createReadStream(seqpath, {encoding: "UTF-8"})
				.pipe(fasta.obj())
				.on('data', function(d){
				    data.push(d);
				}).on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(data);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			}
		    } else if (seqpath.indexOf('.fq') > -1 || seqpath.indexOf('.fastq') > -1) {
			if (seqpath.endsWith('.gz')){
			    logger.debug(`Reading sequence objects from gzipped fastq '${seqpath}'`);
			    fs.createReadStream(seqpath)
				.pipe(zlib.createUnzip())
				.pipe(fastq.obj())
				.on('data', function(d){
				    data.push(d);
				}).on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    delete kmer;
				    resolve(data);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			} else {
			    logger.debug(`Reading sequence objects from uncompressed fastq '${seqpath}'`);
			    fs.createReadStream(seqpath, {encoding: "UTF-8"})
				.pipe(fastq.obj())
				.on('data', function(d){
				    data.push(d);
				}).on('finish', function(){
				    logger.info(`Finished reading from '${seqpath}'...`);
				    resolve(data);
				}).on('error', function(err){
				    logger.debug(err);
				    reject(err);
				});
			}
		    }
		});
	    }
	});
    }
}


module.exports = {
    getProfile: getProfile,
    readFasta: readFasta
}





			   
