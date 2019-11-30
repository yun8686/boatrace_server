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

exports.pointOddsPark = functions.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.region('asia-northeast1')
.pubsub.schedule('every day 12:00')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  await runOddsPark(context);
});

exports.runOddsPark = runOddsPark;

async function runOddsPark(context){
  if (!page) {
    page = await getBrowserPage();
  }
  await page.goto('https://www.oddspark.com/auth/NbNyukin.do');
  await page.type('[name=SSO_ACCOUNTID]', config.oddspark.id);
  await page.type('[name=SSO_PASSWORD]', config.oddspark.pw);
  let loadPromise = page.waitForNavigation();
  await page.click('#btn-login');
  await loadPromise;

  await page.type('[name=INPUT_PIN]', config.oddspark.pin);
  loadPromise = page.waitForNavigation();
  await page.click('[name=送信]');
  await loadPromise;

  await page.type('#nyukin', '1');
  loadPromise = page.waitForNavigation();
  await page.click('.btn2');
  await loadPromise;

  await page.type('#touhyoPassword', config.oddspark.pin);
  loadPromise = page.waitForNavigation();
  await page.click('.btn2');
  await loadPromise;
}
