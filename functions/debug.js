//require('./jobs/pointSite/moppy').runMoppy();
//require('./jobs/pointGet/sokupad').runSokupad().then(()=>{process.exit()});
//require('./jobs/pointGet/keirin').runPayment();
//require('./jobs/pointGet/autorace').runPayment();

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
require('./jobs/kyotei/getSchedule').runGetSchedule();
