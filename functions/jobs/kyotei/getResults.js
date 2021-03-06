const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const db = admin.firestore();

async function getBrowserPage () {
  const isDebug = process.env.NODE_ENV !== 'production'

  const launchOptions = {
    headless: isDebug ? false : true,
    args: ['--no-sandbox']
  }

  const browser = await puppeteer.launch(launchOptions)
  return browser.newPage()
}

let page;

exports.getResults = functions
.runWith({
  memory: '1GB',
  timeoutSeconds: 260,
})
.pubsub.schedule('every day 21:00')
.timeZone('Asia/Tokyo')
.onRun(async (context) => {
  if (!page) {
    page = await getBrowserPage()
  }
  const getDate = (date)=>{date.setHours(date.getHours()+date.getTimezoneOffset()/60+9); return (date.getFullYear() + (""+(date.getMonth()+1)).slice(-2) + (""+(date.getDate())).slice(-2));};
  var url = "http://www.boatrace.jp/owpc/pc/race/index";
  console.log("url goto start", url);
  await page.goto(url, {waitUntil: 'domcontentloaded'});
  console.log("url goto end", url);
  var urls = await page.evaluate(async()=>{
    var list = document.querySelectorAll('li a[href]');
    var urls = [];
    list.forEach(v=>{
      if(v.innerHTML == "結果一覧") urls.push(v.href);
    });
    return urls;
  });
  const urlDataSet = urls.map(url=>{
    console.log(url);
    return {
      url: url,
      jcd: url.match(/jcd=(\d+)/)[1],
      hd: url.match(/hd=(\d+)/)[1],
    };
  });

  for(let urlData of urlDataSet){
    let url = urlData.url;
    await page.goto(url, {waitUntil: 'domcontentloaded'});
    console.log(urlData);
    const results = await page.evaluate(async()=>{
      const arr = [];
      const trs = document.querySelectorAll('.table1 table')[0].querySelectorAll('tbody tr');
      trs.forEach(tr=>{
        const td = tr.querySelectorAll('td');
        if(td[1].innerText.indexOf("-") >= 0){
          arr.push({
            "rno": parseInt(td[0].innerText),
            "3t": td[1].innerText.split("-"),
            "3tc": td[2].innerText.match(/[\d,]+/)[0].replace(',','')-0,
            "2t": td[3].innerText.split("-"),
            "2tc": td[4].innerText.match(/[\d,]+/)[0].replace(',','')-0,
            "biko": td[5].innerText,
          });
        }else{
          arr.push({
            "rno": parseInt(td[0].innerText),
            "biko": td[5].innerText,
          });
        }
      });
      return arr;
    });
    for(const result of results){
        await db.collection(urlData.hd).doc(urlData.jcd + "_" + result.rno).set(result);
    }
    console.log(results);
  }
});
