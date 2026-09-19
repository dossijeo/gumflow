import {verifyPreservedCore} from './lib/preserved-core.mjs';
try {console.log('Unchanged 6.1 core and assets:',verifyPreservedCore());}
catch(e){console.error(e.message);process.exitCode=1;}
