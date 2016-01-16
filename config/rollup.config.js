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
const dest  = p.resolve(`dist/boily.${production ? 'min.js' : 'js'}`);

const bundleConfig = {
	dest,
	format: 'umd',
	moduleName: 'Boily',
	banner: copyright,
	sourceMap: true,
	globals: {
		react: 'React',
	},
};

let babelConfig = JSON.parse(fs.readFileSync('.babelrc', 'utf8'));
babelConfig.babelrc = false;
babelConfig.presets = babelConfig.presets.map((preset) => {
	return preset === 'es2015' ? 'es2015-rollup' : preset;
});

let plugins = [
	babel(babelConfig),
	npm({
		jsnext: true,
		skip: [
			'react',
		],
	}),
	replace({
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
		exclude: 'node_modules/**',
		VERSION: pack.version,
	}),
];

if (production) {
	plugins.push(
		uglify({
			warnings: false,
		})
	);
}

let bundle = Promise.resolve(rollup({entry, plugins}));
bundle.then(({write}) => write(bundleConfig));

process.on('unhandledRejection', (reason) => {throw reason;});