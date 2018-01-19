# README - Kmer.js
>A Javascript/NodeJS package for shredding strings into all possible substrings of length 'k'

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Linux Build][travis-image]][travis-url]
  [![Test Coverage][coveralls-image]][coveralls-url]
  
Kmer.js is a NodeJS package designed for data/science applications. It addresses the ['k-mer' problem](https://en.wikipedia.org/wiki/K-mer)(substrings of length from a string) in a simple and performant manner. This library produces all of the `n - k + 1` substrings of length `k` from a string of length `n`.

## Installation

OS X & Linux:

```sh
npm install --save kmer.js
```

## Usage Example

```javascript
>var kmers = require('kmer.js');
>var fourmers = kmers("hello world!", 4)
[ 'hell',
'ello',
'llo ',
'lo w',
'o wo',
' wor',
'worl',
'orld',
'rld!' ]
```

## Develoment

```sh
npm test # MochaJS specs
npm run-script bench # benchmark.js performance tests, varying n and k
```

## License

Created by Matthew Ralston - [Scientist, Programmer, Musician](http://matthewralston.us) - [Email](mailto:mrals89@gmail.com)

Distributed under the GPL v3.0 license. See `LICENSE.txt` for the copy distributed with this project. Open source software is not for everyone, but for those of us starting out and trying to put the ecosystem ahead of ego, we march into the information age with this ethos.

[https://github.com/MatthewRalston/kmer.js](https://github.com/MatthewRalston/kmer.js)

## Contributing

1. Fork it (<https://github.com/MatthewRalston/kmer.js/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request




[npm-image]: https://img.shields.io/npm/v/kmer.js.svg
[npm-url]: https://npmjs.org/package/kmer.js
[downloads-image]: https://img.shields.io/npm/dm/kmer.js.svg
[downloads-url]: https://npmjs.org/package/kmer.js
[travis-image]: https://img.shields.io/travis/MatthewRalston/kmer.js/master.svg?label=linux
[travis-url]: https://travis-ci.org/MatthewRalston/kmer.js
[coveralls-image]: https://img.shields.io/coveralls/MatthewRalston/kmer.js/master.svg
[coveralls-url]: https://coveralls.io/r/MatthewRalston/kmer.js?branch=master
