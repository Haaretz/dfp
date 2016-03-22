import DFP from './dfp';
import globalConfig from './globalConfig';

// Correct version will be set with the 'rollup-replace plugin'
DFP.version = 'VERSION';

//// Only for development mode
//if ( process.env.NODE_ENV !== 'production' ) {
//  DFP.dev = '123';
//}

export const config = globalConfig;
export default DFP;
