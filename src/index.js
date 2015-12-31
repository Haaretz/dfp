import boily from './foo';

// Correct version will be set by 'rollup'
boily.version = 'VERSION';

// Only for development mode
if ( process.env.NODE_ENV !== 'production' ) {
	boily.dev = '123';
}

export default boily;
