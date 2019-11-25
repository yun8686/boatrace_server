
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

exports.pointRakuten = functions.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.pubsub.schedule('every day 12:00')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  await runRakuten(context);
});

async function runRakuten(context){
  if (!page) {
    page = await getBrowserPage();
  }
  await page.goto('https://bet.keiba.rakuten.co.jp/bank/deposit/');
  await page.type('#loginInner_u', config.rakuten.id);
  await page.type('#loginInner_p', config.rakuten.pw);
  loadPromise = page.waitForNavigation();
  await page.click('[value="ログイン"]');
  await loadPromise;
  await page.type('#depositingInputPrice', "1000");
  loadPromise = page.waitForNavigation();
  await page.click('#depositingInputButton');
  await loadPromise;

  await page.type('[name="pin"]', config.rakutenkeiba.pw);
  loadPromise = page.waitForNavigation();
  await page.click('#depositingConfirmButton');
  await loadPromise;
  process.exit();
}
