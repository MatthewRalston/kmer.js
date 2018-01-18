# README - Kmer.js
>A Javascript/NodeJS package for shredding strings into all possible substrings of length 'k'

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads Stats][npm-downloads]][npm-url]

Kmer.js is a NodeJS package designed for data/science applications. It addresses the ['k-mer' problem](https://en.wikipedia.org/wiki/K-mer)(substrings of length from a string) in a simple and performant manner. This library produces all of the `n - k + 1` substrings of length `k` from a string of length `n`.

## Installation

OS X & Linux:

```sh
npm install --save kmer.js
```

## Usage Example

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

1. Fork it (<https://github.com/yourname/yourproject/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
