const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


Object.assign(exports, require('./jobs/getOdds'));
Object.assign(exports, require('./jobs/getResults'));
Object.assign(exports, require('./jobs/pointGet/boatrace'));
Object.assign(exports, require('./jobs/pointGet/charirot'));
Object.assign(exports, require('./jobs/pointGet/rakuten'));
Object.assign(exports, require('./jobs/pointGet/spat4'));
Object.assign(exports, require('./jobs/pointGet/oddsPark'));
Object.assign(exports, require('./jobs/pointGet/keirin'));
Object.assign(exports, require('./jobs/pointGet/autorace'));
