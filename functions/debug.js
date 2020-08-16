//require('./jobs/pointSite/moppy').runMoppy();
//require('./jobs/pointGet/sokupad').runSokupad().then(()=>{process.exit()});
//require('./jobs/pointGet/keirin').runPayment();
//require('./jobs/pointGet/autorace').runPayment().then(()=>{process.exit()});

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp({
  databaseURL: "https://boatrace-66b99.firebaseio.com",
  credential: admin.credential.cert(require("./config.json")),
});

// require("./jobs/pointGet/charirot")
//   .runCharirot()
//   .then(() => process.exit());

require("./jobs/pointGet/boatrace").runPayment();
//require("./jobs/kyotei/getSchedule").runGetSchedule();
//require('./jobs/kyotei/getOdds').runGetOdds();
//require('./jobs/kyotei/updateOdds').runUpdateOdds();
