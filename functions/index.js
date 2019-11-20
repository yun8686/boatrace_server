const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const getOdds = require('./jobs/getOdds');
const getResults = require('./jobs/getResults');
const getPointGetBoat = require('./jobs/pointGet/boatrace');

Object.assign(exports, getOdds);
Object.assign(exports, getResults);
Object.assign(exports, getPointGetBoat);
