import * as p from 'path';
import * as fs from 'fs';
import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-js';
import filesize from 'rollup-plugin-filesize';
import pack from './../package.json';


const development = process.argv[2] === 'dev';
const production = process.argv[2] === 'prod';
const es6 = process.argv[3] === 'es6';

if (development) {
  process.env.NODE_ENV = 'development';
} else {
  process.env.NODE_ENV = 'production';
}

/*
 * Banner
 **/
const copyright =
  '/*!\n' +
  ' * ' + pack.name + ' v' + pack.version + '\n' +
  ' * (c) ' + new Date().getFullYear() + ' ' + pack.author.name + '\n' +
  ' * Released under the ' + pack.license + ' License.\n' +
  ' */';

const entry = p.resolve('./src/index.js');
const dest  = p.resolve(`./dist/${pack.name.toLowerCase()}.${production ? 'min.js' : es6 ? 'es6.js' : 'js'}`);

const bundleConfig = {
  dest,
  format: es6 ? 'es' : 'umd',
  moduleName: `${pack.name}`,
  exports: `named`,
  banner: copyright,
  sourceMap: true, // set to false to skip generate sourceMap
};

const babelConfig = JSON.parse(fs.readFileSync('.babelrc', 'utf8'));

babelConfig.babelrc = false;
babelConfig.presets = babelConfig.presets.map((preset) => {
  return preset === 'es2015' ? ['es2015', {"modules": false}] : preset;
});
// babelConfig.externalHelpers = false;
// babelConfig.runtimeHelpers = true;

const plugins = [
  json(),
  babel(babelConfig),
  nodeResolve({
    jsnext: true,
    main: true
  }),
  //eslint({ rules: {
  /* your options */
  //} }),
  filesize(),
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
    VERSION: pack.version
  })
];


if (production && !es6) {
  plugins.push(
    uglify({
      warnings: false,
      compress: {
        screw_ie8: true,
        dead_code: true,
        unused: true,
        drop_debugger: true, //
        booleans: true // various optimizations for boolean context, for example !!a ? b : c → a ? b : c
      },
      mangle: {
        screw_ie8: true
      }
    }, minify)
  );
}

Promise.resolve(rollup({entry, plugins}))
  .then(
    (bundle) => {
      bundle.write(bundleConfig);
    });

process.on('unhandledRejection', (reason) => {throw reason;});
