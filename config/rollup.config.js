import * as p from 'path';
import * as fs from 'fs';
import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import pack from '../package.json';

const development = process.argv[2] === 'dev';
const production = process.argv[2] === 'prod';
const es6 = process.argv[3] === 'es6';
const cjs = process.argv[3] === 'cjs';

if ( development ) {
	process.env.NODE_ENV = 'development'
} else {
	process.env.NODE_ENV = 'production'
}

/*
 * Banner
 **/
const copyright =
	'/*!\n' +
	' * ' + pack.name + ' v' + pack.version + '\n' +
	' * (c) ' + new Date().getFullYear() + ' ' + pack.author.name + '\n' +
	' * Released under the ' + pack.license + ' License.\n' +
	' */'

const entry = p.resolve('src/index.js');
const dest  = p.resolve(`dist/boily.${production ? 'min.js' : es6 ? 'es6.js' : cjs ? 'cjs.js' : 'js'}`);

const bundleConfig = {
	dest,
	format: es6 ? 'es6' : cjs ? 'cjs' : 'umd',
	moduleName: 'Boily',
	banner: copyright,
	sourceMap: false // set to false to generate sourceMap
};

const babelConfig = JSON.parse(fs.readFileSync('.babelrc', 'utf8'));
babelConfig.babelrc = false;
babelConfig.presets = babelConfig.presets.map((preset) => {
	return preset === 'es2015' ? 'es2015-rollup' : preset;
});

const plugins = [
	babel(babelConfig),
	npm({
		jsnext: true,
		main: true
	}),
	replace({
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
		exclude: 'node_modules/**',
		VERSION: pack.version
	}),
];

if (production && !es6) {
	plugins.push(
		uglify({
			warnings: false,
			compress: {
				screw_ie8: true,
				dead_code:true,
				unused: true,
				drop_debugger:true, //
				booleans:true // various optimizations for boolean context, for example !!a ? b : c → a ? b : c
			},
			mangle: {
				screw_ie8: true
			}
		})
	);
}

Promise.resolve(rollup({entry, plugins})).then(({write}) => write(bundleConfig));

process.on('unhandledRejection', (reason) => {throw reason;});