const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const db = admin.firestore();

exports.runUpdateOdds = runUpdateOdds;

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

exports.updateOdds = functions
.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.region('asia-northeast1')
.pubsub.schedule('every 5 minutes from 8:00 to 20:50')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  await runUpdateOdds(context);
});

async function runUpdateOdds(context){
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
    return (date.getFullYear() + ("0"+(date.getMonth()+1)).slice(-2) + ("0"+(date.getDate())).slice(-2));
  };
  const getTime = (date)=>{
    date = new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000)+9*60*60*1000);
    return (("0"+date.getHours()).slice(-2)+":"+("0"+date.getMinutes()).slice(-2));
  };
  const now = new Date();
  const dateText = getDate(now);
  const timeText = getTime(now);


  const doc = await db.collection("schedules").doc(dateText).get();
  const list = doc.data().dataList;
  const oddsList = {};
  for(var i=0;i<list.length;i++){
    const data = list[i];
    const timeData = data.timeList.find(v=>v.time>timeText);

    if(!timeData)continue;
    // 直前情報を取得
    await page.goto(`http://www.boatrace.jp/owpc/pc/race/beforeinfo?rno=${timeData.rno}&jcd=${data.jcd}&hd=${dateText}`, {waitUntil: 'domcontentloaded'});
    timeData.info = await page.evaluate(async()=>{
      return document.querySelectorAll(".weather1_body")[0].innerText
              .split(String.fromCharCode(10)).filter(v=>v).join(",");
    });
    // ３連単オッズを取得
    await page.goto(`http://www.boatrace.jp/owpc/pc/race/odds3t?rno=${timeData.rno}&jcd=${data.jcd}&hd=${dateText}`, {waitUntil: 'domcontentloaded'});
    const oddsData = await page.evaluate(async()=>{
      var list = [], newList=[];
      document.querySelectorAll(".table1 .oddsPoint").forEach(v=>list.push(v.innerText));
      for(var j=0;j<6;j++){
       for(var i=0;i<20;i++){
        newList.push(list[j+i*6]);
       }
      }
      var oddsData = {
        min_odds: 1000,
        min_oddpth: "",
        oddsList: {},
      };
      var idx = 0;
      for(var a=1;a<=6;a++){
        for(var b=1;b<=6;b++){
          for(var c=1;c<=6;c++){
            if(a!=b && a!=c&& b!=c){
              const odds = newList[idx++]-0;
              const ptn = `${a}-${b}-${c}`;
              oddsData.oddsList[ptn] = odds;
              if(odds != 0 && odds < oddsData.min_odds){
                oddsData.min_odds = odds;
                oddsData.min_oddpth = ptn;
              }
            }
          }
        }
      }
      return oddsData;
    });

    // ２連単オッズを取得
    await page.goto(`http://www.boatrace.jp/owpc/pc/race/odds2tf?rno=${timeData.rno}&jcd=${data.jcd}&hd=${dateText}`, {waitUntil: 'domcontentloaded'});
    const odds2Data = await page.evaluate(async()=>{
      var list = [], newList=[];
      document.querySelectorAll(".table1 .oddsPoint").forEach(v=>list.push(v.innerText));
      for(var j=0;j<6;j++){
        for(var i=0;i<5;i++){
        newList.push(list[j+i*6]);
        }
      }
      var oddsData = {
        min_odds: 1000,
        min_oddpth: "",
        oddsList: {},
      };
      var idx = 0;
      for(var a=1;a<=6;a++){
        for(var b=1;b<=6;b++){
          if(a!=b){
            const odds = newList[idx++]-0;
            const ptn = `${a}-${b}`;
            oddsData.oddsList[ptn] = odds;
            if(odds != 0 && odds < oddsData.min_odds){
              oddsData.min_odds = odds;
              oddsData.min_oddpth = ptn;
            }
          }
        }
      }
      return oddsData;
    });

    timeData.oddsData = {
      min_odds: oddsData.min_odds,
      min_oddpth: oddsData.min_oddpth,
      min_odds2: odds2Data.min_odds,
      min_oddpth2: odds2Data.min_oddpth,
    };
    oddsList[data.jcd + "_" + timeData.rno] = {
      "3t": oddsData.oddsList,
      "2t": odds2Data.oddsList,
    };
  }
  await db.collection("schedules").doc(dateText).set({
    dataList: list,
  });
  await db.collection("odds").doc(dateText).set({
    dataList:oddsList,
  });
}
