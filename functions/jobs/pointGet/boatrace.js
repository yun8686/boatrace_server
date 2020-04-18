const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const config = require('./data.json');

let page, browser;

exports.runPayment = runPayment;

async function getBrowserPage () {
  const isDebug = process.env.NODE_ENV !== 'production'

  const launchOptions = {
    headless: isDebug ? false : true,
    args: ['--no-sandbox']
  }

  browser = await puppeteer.launch(launchOptions)
  return browser.newPage()
}

exports.pointBoat = functions.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.region('asia-northeast1')
.pubsub.schedule('every day 9:00')
.timeZone('Asia/Tokyo')
.onRun(async (context)=>{
  await runPayment(context);
});


async function runPayment(context){
  if (!page) {
    page = await getBrowserPage()
  }
  await page.goto('https://ib.mbrace.or.jp/');
  console.log('goto');
  await page.type('#memberNo', config.boatrace.memberNo);
  await page.type('#pin', config.boatrace.pin);
  await page.type('#authPassword', config.boatrace.authPassword);

  const newPagePromise = new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())));
  await page.click('#loginButton');
  const newPage = await newPagePromise;
//  await newPage.waitForSelector('input[name="foo"]', {visible: true});

//  let loadPromise = page.waitForNavigation();
  console.log('page')
//  await loadPromise;
  await newPage.waitForSelector('#gnavi01', {visible: true});
  await newPage.click('#gnavi01');
  await newPage.click('#charge');
  await newPage.waitForSelector('#chargeInstructAmt', {visible: true});
  await newPage.type('#chargeInstructAmt', "1");
  await newPage.type('#chargeBetPassword', config.boatrace.chargeBetPassword);
  await newPage.click('#executeCharge');
  await newPage.waitForSelector('#ok', {visible: true});
  await newPage.click('#ok');
  try{
    await newPage.click('#ok');
    await newPage.click('#ok');
  }catch(e){
    console.log(e);
  }
}
