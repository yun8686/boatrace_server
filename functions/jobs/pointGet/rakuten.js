
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
.region('asia-northeast1')
.pubsub.schedule('every day 12:00')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  await runRakuten(context);
});

exports.runRakuten=runRakuten;

async function runRakuten(context){
  if (!page) {
    page = await getBrowserPage();
  }

  // rakuten keiba
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


  // e-shinbun bet
  await page.goto('https://www.e-shinbun.net/account/?ref=ebet&path=http%3A%2F%2Fbet.e-shinbun.net%2F');
  loadPromise = page.waitForNavigation();
  await page.click("[type=image]");
  await loadPromise;

  loadPromise = page.waitForNavigation();
  await page.click("[alt=続ける]");
  await loadPromise;

  loadPromise = page.waitForNavigation();
  await page.click("[alt=入金]");
  await loadPromise;

  await page.type('#StatementAmount', "100");
  loadPromise = page.waitForNavigation();
  await page.click(".std_btn");
  await loadPromise;

  await page.type('#UserPassword', config.eshinbun.pw);
  loadPromise = page.waitForNavigation();
  await page.click('[onclick="hasTransacted();"]');
  await loadPromise;



}
