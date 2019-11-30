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

exports.pointCharirot = functions.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.region('asia-northeast1')
.pubsub.schedule('every day 12:00')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  await runCharirot(context);
});

exports.runCharirot = runCharirot;

async function runCharirot(context){
  if (!page) {
    page = await getBrowserPage();
  }
  await page.goto('https://www.chariloto.com/login');
  await page.type('#chariloto_id', config.charirot.id);
  await page.type('#password', config.charirot.pw);
  let loadPromise = page.waitForNavigation();
  await page.click('[name=button]');
  await loadPromise;

  await page.goto('https://www.chariloto.com/bank_statements/new_deposit');
  await page.type('#js-input', '10');
  loadPromise = page.waitForNavigation();
  await page.click('[name=commit]');
  await loadPromise;

  await page.type('#mypage_bank_statement_deposit_form_pincode', config.charirot.pn);
  loadPromise = page.waitForNavigation();
  await page.click('[name=commit]');
  await loadPromise;

}
