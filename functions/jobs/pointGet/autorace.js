const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const config = require('./data.json');

exports.runDeposit = runDeposit;
exports.runPayment = runPayment;

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

exports.pointAutorace = functions.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.region('asia-northeast1')
.pubsub
.schedule('every day 12:00')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  await runDeposit(context);
});

exports.paymentAutorace = functions.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.region('asia-northeast1')
.pubsub
.schedule('every day 15:00')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  await runPayment(context);
});


async function runDeposit(context){
  if (!page) {
    page = await getBrowserPage();
    page.on('dialog', async dialog => {
      dialog.accept(); // OK
    });
  }
  await page.goto('https://pc.autoinet.jp/');
  await page.type('[name=userId]', config.autorace.id);
  await page.type('[name=password]', config.autorace.pw);
  let loadPromise = page.waitForNavigation();
  await page.click('[name=login]');
  await loadPromise;

  await page.type('[name=passNo]', config.autorace.pin);
  loadPromise = page.waitForNavigation();
  await page.click('[name=btnWireIn]');
  await loadPromise;

  await page.type('[name=wireInAmount]', "1");
  loadPromise = page.waitForNavigation();
  await page.click('[name=refer]');
  await loadPromise;
}

async function runPayment(context){
  if (!page) {
    page = await getBrowserPage();
    page.on('dialog', async dialog => {
      dialog.accept(); // OK
    });
  }
  await page.goto('https://pc.autoinet.jp/');
  await page.type('[name=userId]', config.autorace.id);
  await page.type('[name=password]', config.autorace.pw);
  let loadPromise = page.waitForNavigation();
  await page.click('[name=login]');
  await loadPromise;

  await page.type('[name=passNo]', config.autorace.pin);
  loadPromise = page.waitForNavigation();
  await page.click('[name=btnWireOut]');
  await loadPromise;

  await page.evaluate(async()=>{
    var a = document.querySelectorAll("font")[4].innerText;
    document.querySelector("[name=wireOutAmount]").value = parseInt(a);
  });
  loadPromise = page.waitForNavigation();
  await page.click('[name=refer]');
  await loadPromise;

}
