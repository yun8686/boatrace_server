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
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if(['stylesheet','image','font', 'script'].indexOf(req.resourceType())>=0){
      req.abort();
    } else {
      req.continue();
    }
  });

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
      hd: url.href.match(/hd=(\d+)/)[1],
      jcd: url.href.match(/jcd=(\d+)/)[1],
      days: url.days,
      jouname: url.jouname,
    };
  })

  const dataList = [];
  for(const data of urlData){
    const url = `https://www.boatrace.jp/owpc/pc/race/raceindex?jcd=${data.jcd}&hd=${data.hd}`
    await page.goto(url, {waitUntil: 'domcontentloaded'});
    const map = dataList[dataList.length] = data;
    map.timeList = await page.evaluate(async()=>{
      const arr = [];
      const tbodys = document.querySelectorAll(".table1 tbody");
      for(let i=0;i<12;i++){
        const td = tbodys[i].querySelectorAll("td");
        arr.push({
          rno: td[0].querySelector("a").href.match(/rno=(\d+)/)[1],
          raceno: td[0].innerText,
          time: td[1].innerText,
          racers: [
            td[4].innerText.split(String.fromCharCode(10)).reverse().join(":"),
            td[5].innerText.split(String.fromCharCode(10)).reverse().join(":"),
            td[6].innerText.split(String.fromCharCode(10)).reverse().join(":"),
            td[7].innerText.split(String.fromCharCode(10)).reverse().join(":"),
            td[8].innerText.split(String.fromCharCode(10)).reverse().join(":"),
            td[9].innerText.split(String.fromCharCode(10)).reverse().join(":"),
          ],
        });
//        arr.push({time, name: "特選", info: "曇り|風速 1m|波高 1cm"});
      }
      return arr;
    });
  }

  console.log(dataList);
  await db.collection("schedules").doc(dateText).set({
    dataList: dataList,
  });
}
