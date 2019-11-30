
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

exports.runSokupad=runSokupad;

async function runSokupad(context){
  if (!page) {
    page = await getBrowserPage();
  }

  await page.goto('https://www.ipat.jra.go.jp/');
  await page.type('[name=inetid]', config.sokupad.inet);
  loadPromise = page.waitForNavigation();
  await page.click('[title=ログイン]');
  await loadPromise;

  await page.type('[name=i]', config.sokupad.join);
  await page.type('[name=p]', config.sokupad.pw);
  await page.type('[name=r]', config.sokupad.rars);
  loadPromise = page.waitForNavigation();
  await page.click('[title=ネット投票メニューへ]');
  await loadPromise;

  const newPagePromise = new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())));
  await waitClick(page, '[ng-click="vm.clickPayment()"]');
  page = await newPagePromise;

  loadPromise = page.waitForNavigation();
  await waitClick(page, '.btn-payment');
  await loadPromise;

  await page.type('#NYUKIN_ID', '100');
  loadPromise = page.waitForNavigation();
  await waitClick(page, '.btn-green');
  await loadPromise;

  await page.type('#PASS_WORD_ID', config.sokupad.pw);
  page.on('dialog', async dialog => {dialog.accept();});
  loadPromise = page.waitForNavigation();
  await waitClick(page, '.btn-green');
  await loadPromise;


}

async function waitClick(page, selector){
  console.log(selector, "start")
  await page.waitForSelector(selector, {visible: true});
  console.log(selector, "wait")
  await page.click(selector);
  console.log(selector, "end")
}
