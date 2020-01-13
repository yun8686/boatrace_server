const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const db = admin.firestore();

exports.runGetSchedule = runGetSchedule;

let browser;
async function initBrowser () {
  if (browser) return browser;
  const isDebug = process.env.NODE_ENV !== 'production'

  const launchOptions = {
    headless: isDebug ? false : true,
    args: ['--no-sandbox'],
  }

  return browser = await puppeteer.launch(launchOptions)
}

exports.getSchedule = functions
.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.region('asia-northeast1')
.pubsub.schedule('every day 07:00')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  await runGetSchedule(context);
});

async function runGetSchedule(context){
  browser = await initBrowser();
  const page = await browser.newPage();
  function convertUTCtoJST(date) {
    return new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000)+9*60*60*1000);
  }
  const getDate = (date)=>{
    date = new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000)+9*60*60*1000);
    console.log("date", date);
    return (date.getFullYear() + ("0"+(date.getMonth()+1)).slice(-2) + ("0"+(date.getDate())).slice(-2));
  };
  const now = new Date();
  const dateText = getDate(now);
  var url = "https://www.boatrace.jp/owpc/pc/race/index?hd=" + dateText;
  console.log("url goto start");
  await page.goto(url, {waitUntil: 'domcontentloaded'});
  console.log("url goto end");
  // 出走表URLリストを取得
  const urls = await page.evaluate(async()=>{
    var list = document.querySelectorAll('li a[href]');
    var urls = [];
    list.forEach(v=>{
      if(v.innerHTML == "出走表") {
        var li = v.parentElement.parentElement.parentElement.parentElement.children;
        var jouname = li[0].querySelector("img").alt;
        jouname = jouname.slice(0, jouname.length-1);
        var days = li[li.length-4].innerText.split(String.fromCharCode(10))[1];
        urls.push({
          href: v.href,
          days: days,
          jouname : jouname,
        });
      };
    });
    return urls;
  });
  const urlData = urls.map(url=>{
    return {
      url: url.href,
      jcd: url.href.match(/jcd=(\d+)/)[1],
      days: url.days,
      jouname: url.jouname,
    };
  })

  const dataList = [];
  for(const data of urlData){
    await page.goto(data.url, {waitUntil: 'domcontentloaded'});
    const map = dataList[dataList.length] = data;
    map.timeList = await page.evaluate(async()=>{
      const arr = [];
      const timeList = document.querySelectorAll('.h-mt10 tbody tr td');
      for(let i=1;i<=12;i++){
        const time = timeList[i].innerText;
        arr.push({time, name: "特選", info: "曇り|風速 1m|波高 1cm"});
      }
      return arr;
    });
  }

  console.log(dataList);
  await db.collection("schedules").doc(dateText).set({
    dataList: dataList,
  });
}
