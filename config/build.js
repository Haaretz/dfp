var fs = require('fs')
var rollup = require('rollup')
var uglify = require('uglify-js')
var babel = require('rollup-plugin-babel')
var replace = require('rollup-plugin-replace')
var pack = require('../package.json')
var banner = require('./banner')

// update main file
var main = fs
  .readFileSync('src/index.js', 'utf-8')
  .replace(/plugin\.version = '[\d\.]+'/, "plugin.version = '" + pack.version + "'")
fs.writeFileSync('src/index.js', main)

rollup.rollup({
  entry: 'src/index.js',
  plugins: [
    babel({
      presets: ['es2015-rollup']
    })
  ]
})
// Standalone Dev Build
.then(function () {
  return rollup.rollup({
    entry: 'src/index.js',
    plugins: [
      replace({
        'process.env.NODE_ENV': "'development'"
      }),
      babel({
        presets: ['es2015-rollup']
      })
    ]
  })
  .then(function (bundle) {
    return write('dist/' + pack.name + '.js', bundle.generate({
      format: 'umd',
      banner: banner,
      moduleName: 'redric'
    }).code)
  })
})
.then(function () {
  // Standalone Production Build
  return rollup.rollup({
    entry: 'src/index.js',
    plugins: [
      replace({
        'process.env.NODE_ENV': "'production'"
      }),
      babel({
        presets: ['es2015-rollup']
      })
    ]
  })
  .then(function (bundle) {
    var code = bundle.generate({
      format: 'umd',
      moduleName: 'redric'
    }).code
    var minified = banner + '\n' + uglify.minify(code, {
      fromString: true
    }).code
    return write('dist/' + pack.name + '.min.js', minified)
  })
})
.catch(logError)

function toUpper (_, c) {
  return c ? c.toUpperCase() : ''
}

const classifyRE = /(?:^|[-_\/])(\w)/g
function classify (str) {
  return str.replace(classifyRE, toUpper)
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function write (dest, code) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err)
      console.log(blue(dest) + ' ' + getSize(code))
      resolve()
    })
  })
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}