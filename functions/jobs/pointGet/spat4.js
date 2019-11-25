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

exports.pointSpat4 = functions.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.pubsub.schedule('every day 12:00')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  await runSpat4(context);
});

exports.runSpat4 = runSpat4;

async function runSpat4(context){
  if (!page) {
    page = await getBrowserPage();
  }
  await page.goto('https://www.spat4.jp/keiba/pc');
  await page.type('#MEMBERNUMR', config.spat4.joinNo);
  await page.type('#MEMBERIDR', config.spat4.userID);
  let loadPromise = page.waitForNavigation();
  await page.click('[name=B1]');
  await loadPromise;

  await page.goto('https://www.spat4.jp/keiba/pc?HANDLERR=P600S');
  await page.type('#ENTERR', '100');
  loadPromise = page.waitForNavigation();
  await page.click('[value=入金指示確認へ]');
  await loadPromise;

  await page.type('#MEMBERPASSR', config.spat4.pw);
  await page.click('[value=入金指示する]')


}
