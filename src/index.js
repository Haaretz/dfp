import DFP from './dfp';
import globalConfig from './globalConfig';
import { version as v } from './version';

// DFP version is based on the package.json
DFP.version = v || 'VERSION';

/*
 // Only for development mode
 if ( process.env.NODE_ENV !== 'production' ) {
 DFP.dev = '123';
 }
 */

export const config = globalConfig;
export const version = DFP.version;
export default DFP;
