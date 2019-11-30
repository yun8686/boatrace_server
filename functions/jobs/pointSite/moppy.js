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
exports.runMoppy = runMoppy;
exports.pointBoat = functions.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.pubsub.schedule('every day 9:00')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  runMoppy();
});


async function runMoppy(){
  if (!page) {
    page = await getBrowserPage()
  }
  await page.goto('https://ssl.pc.moppy.jp/login/?page=gamecontents%2Fbingo%2F');
  await page.type('[name=mail]', config.moppy.email);
  await page.type('[name=pass]', config.moppy.pass);
  loadPromise = page.waitForNavigation();
  await page.click('[type=submit].a-btn__login');
  await loadPromise;

  if(true){
    await page.goto('http://pc.moppy.jp/gamecontents/bingo/');
    await page.goto('https://pc.moppy.jp/gamecontents/bingo/play.php');
    loadPromise = page.waitForNavigation();
    await page.waitForSelector('#play');
    await page.click('#play');
    await loadPromise;
  }
  if(true){
    await quizGame(page,{
      url: 'http://ad-contents.jp/quiz/moppy/?user_id='+config.moppy.adcontents,
      selectors:[
        "[value=クイズに進む]",
        "[value=スタンプ獲得]",
      ],
      in_selectors:[
        "[value=回答する]",
        "[value=次に進む]",
      ],
    });
  }
  if(true){
    await quizGame(page,{
      url: 'http://ad-contents.jp/eitango/moppy/?user_id='+config.moppy.adcontents,
      selectors:[
        "[value=スタート]",
        "[value=スタンプ獲得]",
      ],
      in_selectors:[
        "[value=回答する]",
        "[value=次の問題へ]",
      ],
    });
  }
  if(true){
    await quizGame(page,{
      url: 'http://ad-contents.jp/calculate/moppy/?user_id='+config.moppy.adcontents,
      selectors:[
        "[value=スタート]",
        "[value=スタンプ獲得]",
      ],
      in_selectors:[
        "[value=回答する]",
        "[value=次の問題へ]",
      ],
    });
  }
  if(true){
    await quizGame(page,{
      url: 'http://ad-contents.jp/calendar/moppy/?user_id='+config.moppy.adcontents,
      selectors:[
        "[value=プレイ開始]",
        "[value=スタンプ獲得]",
      ],
      in_selectors:[
        "[value=回答する]",
        "[value=次に進む]",
      ],
    });
  }
}


async function quizGame(page, {
  url, selectors, in_selectors
}){
  await page.goto(url);
  await waitClick(page, selectors[0]);
  while(true){
    await page.waitForSelector('[name=submit]');
    let flg = await page.evaluate((in_selectors) => {
      if(!document.querySelector(in_selectors[0])){
        if(document.querySelector(in_selectors[1])){
          document.querySelector(in_selectors[1]).click();
          return true;
        }else{
          return false;
        }
      };
      var arr = document.querySelectorAll('[name=select_num]');
      var len = arr.length;
      arr[~~(Math.random()*len)].click();
      document.querySelector(in_selectors[0]).click();
      return true;
    }, in_selectors);
    if(!flg)break;
  }
  loadPromise = page.waitForNavigation();
  await waitClick(page, selectors[1]);
  await loadPromise;
}
async function waitClick(page, selector){
  console.log(selector, "start")
  await page.waitForSelector(selector, {visible: true});
  console.log(selector, "wait")
  await page.click(selector);
  console.log(selector, "end")
}
