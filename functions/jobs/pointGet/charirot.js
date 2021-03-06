const functions = require("firebase-functions");
const puppeteer = require("puppeteer");
const admin = require("firebase-admin");
const config = require("./data.json");

let page, browser;

exports.runCharirot = runCharirot;
exports.runPayment = runPayment;

async function getBrowserPage() {
  const isDebug = process.env.NODE_ENV !== "production";

  const launchOptions = {
    headless: isDebug ? false : true,
    args: ["--no-sandbox"],
  };

  browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["stylesheet", "image", "font"].indexOf(req.resourceType()) >= 0) {
      req.abort();
    } else {
      req.continue();
    }
  });
  return page;
}

exports.pointCharirot = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 260,
  })
  .region("asia-northeast1")
  .pubsub.schedule("every day 12:00")
  .timeZone("Asia/Tokyo")
  .onRun(async (context) => {
    await runCharirot(context);
  });

exports.paymentCharirot = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 260,
  })
  .region("asia-northeast1")
  .pubsub.schedule("every day 15:00")
  .timeZone("Asia/Tokyo")
  .onRun(async (context) => {
    await runPayment(context);
  });

async function runPayment(context) {
  if (!page) {
    page = await getBrowserPage();
  }
  await page.goto("https://www.chariloto.com/login");
  await page.type("#chariloto_id", config.charirot.id);
  await page.type("#password", config.charirot.pw);
  let loadPromise = page.waitForNavigation();
  await page.click("[name=button]");
  await loadPromise;

  await page.goto("https://www.chariloto.com/bank_statements/new_withdraw");
  await page.type(
    "#mypage_bank_statement_withdrawal_form_pincode",
    config.charirot.pn
  );
  loadPromise = page.waitForNavigation();
  await page.click("[name=commit]");
  await loadPromise;
}

async function runCharirot(context) {
  if (!page) {
    page = await getBrowserPage();
  }
  await page.goto("https://www.chariloto.com/login");
  await page.type("#chariloto_id", config.charirot.id);
  await page.type("#password", config.charirot.pw);
  let loadPromise = page.waitForNavigation();
  await page.click("[name=button]");
  await loadPromise;

  await page.goto("https://www.chariloto.com/bank_statements/new_deposit");
  await page.type("#js-input", "10");
  loadPromise = page.waitForNavigation();
  await page.click("[name=commit]");
  await loadPromise;

  await page.type(
    "#mypage_bank_statement_deposit_form_pincode",
    config.charirot.pn
  );
  loadPromise = page.waitForNavigation();
  await page.click("[name=commit]");
  await loadPromise;
}
