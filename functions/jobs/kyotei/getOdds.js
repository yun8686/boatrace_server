const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const db = admin.firestore();

let page

async function getBrowserPage () {
  const isDebug = process.env.NODE_ENV !== 'production'

  const launchOptions = {
    headless: isDebug ? false : true,
    args: ['--no-sandbox']
  }

  const browser = await puppeteer.launch(launchOptions)
  return browser.newPage()
}

exports.getOdds = functions
.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.pubsub.schedule('every 5 minutes from 8:00 to 20:50')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  if (!page) {
    page = await getBrowserPage()
  }
  const getDate = (date)=>{return (date.getFullYear() + (""+(date.getMonth()+1)).slice(-2) + (""+(date.getDate())).slice(-2));};
  var url = "http://www.boatrace.jp/owpc/pc/race/index";
  console.log("url goto start");
  await page.goto(url, {waitUntil: 'domcontentloaded'});
  console.log("url goto end");
  var urls = await page.evaluate(async()=>{
    var list = document.querySelectorAll('li a[href]');
    var urls = [];
    list.forEach(v=>{
      if(v.innerHTML == "オッズ") urls.push(v.href);
    });
    return urls;
  });

  const urlDataSet = urls.map(url=>{
    return {
      url: url.replace("odds3t", "odds2tf"),
      rno: url.match(/rno=(\d+)/)[1],
      jcd: url.match(/jcd=(\d+)/)[1],
      hd: url.match(/hd=(\d+)/)[1],
    };
  });

  for(let urlData of urlDataSet){
    let url = urlData.url;
    await page.goto(url, {waitUntil: 'domcontentloaded'});
    let oddsData = await page.evaluate(async()=>{
      const arr = [];
      const x = document.querySelectorAll('.is-p3-0 td');
      x.forEach((v, i)=>{
        if(i%2==1){
          arr.push(v.innerText);
        }
      });
      const map = {};
      let idx = 0;
      for(var i=1;i<=5;i++)for(var j=1;j<=6;j++){
        let key = j + " " + i;
        if(i>=j) key = (j) + " " + (i+1);
        map[key] = arr[idx++];
      }

      let oddsTime = null;
      try{
        oddsTime = document.querySelectorAll('.tab4_refreshText')[0].innerText.match(/(\d+:\d+)/)[1];
      }catch(e){}

      return {
        oddsTime: oddsTime,
        data: map,
      };
    });
    await db.collection(urlData.hd).doc(urlData.jcd + "_" + urlData.rno)
    .collection('2todds').doc(oddsData.oddsTime||'end').set(Object.assign(urlData, {
      oddsTime: oddsData.oddsTime,
      odds: oddsData.data,
    }));
    console.log(oddsData);
  }
});
