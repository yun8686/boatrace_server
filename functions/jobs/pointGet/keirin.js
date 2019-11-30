const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const config = require('./data.json');

let page, browser;

async function getBrowserPage () {
  const isDebug = process.env.NODE_ENV !== 'production'

  const launchOptions = {
    headless: isDebug ? false : true,
    args: ['--no-sandbox']
  }

  browser = await puppeteer.launch(launchOptions)
  return browser.newPage()
}

exports.pointKeirin = functions.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.region('asia-northeast1')
.pubsub.schedule('every day 12:00')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  await runKeirin(context);
});

exports.runKeirin = runKeirin;

async function runKeirin(context){
  if (!page) {
    page = await getBrowserPage();
  }
  await page.goto('https://keirin.jp/pc/depositinstruct');
  await page.type('#txtnetVotingAutId', config.keirin.id);
  await page.type('#txtnetVotingPass', config.keirin.pw);
  let loadPromise = page.waitForNavigation();
  await page.click('#btnlogin');
  await loadPromise;

  await page.type('#UNQ_orexpandText_12', '1');
  loadPromise = page.waitForNavigation();
  await page.click('#UNQ_orbutton_36');
  await loadPromise;

  await page.type('#UNQ_pfInputText_14', config.keirin.pin);
  loadPromise = page.waitForNavigation();
  await page.click('#UNQ_orbutton_18');
  await loadPromise;

}
