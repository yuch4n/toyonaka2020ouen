const https = require('https');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const { Parser } = require('json2csv');
let shop = [];

https.get('https://peraichi.com/landing_pages/view/toyonaka2020ouen', res => {
  let body = '';
  res.on('data', chunk => {
    body += chunk;
  });
  res.on('end', () => {
    const dom = new JSDOM(body);
    dom.window.document.querySelectorAll('.p-article--bdr__box').forEach((el)=> {
      // 店名
      let name = el.querySelector('h2').textContent.replace(/^[0-9]*\．/,'');

      // ジャンル
      let genre = (m = name.match(/.*[（(](.*)[）)]$/)) ? m[1] : '';

      // メニュー
      let menu = el.querySelectorAll('.col-sm .pera1-editable')[0].innerHTML;

      let info = el.querySelectorAll('.col-sm .pera1-editable')[1].innerHTML;
      // 住所
      let address = (m = info.match(/(豊中市.*?)<br>/)) ? m[1].replace(/\s$/g,'').replace(/^/,'大阪府') : '';

      // 電話番号
      let phone = (m = info.match(/<a href="tel:.*?>([0-9-\s]*)<\/a>/)) ? m[1].replace(/\s/g,'') : '';

      // 更新日
      let update = el.querySelectorAll('.col-sm .pera1-editable')[2].textContent;
      update = (m = update.match(/[0-9]{4}\/[0-9]{2}\/[0-9]{2}/)) ? m[0] : '';

      shop.push({"name":name,"genre":genre,"menu":menu,"address":address,"phone":phone,"update":update})
    })
    fs.writeFileSync('./toyonaka2020ouen.json', JSON.stringify(shop,null,'\t'));
    const fields = ['name','genre','menu','address','phone','update'];
    const parser = new Parser(fields);
    let csv = parser.parse(shop);
    csv = csv.replace(/<\/?p>/g,'').replace(/<\/?strong>/g,'').replace(/<\/?span.*?>/g,'');
    csv.match(/<a\s.*>.*<\/a>/g).forEach(m=> {
      let href = m.replace(/<a\shref="?"(.*?)"?".*?<\/a>/,'$1');
      csv = csv.replace(m, ' '+href+' ');
    });
    csv = csv.replace(/<br>/g, '\n');
    fs.writeFileSync('./toyonaka2020ouen.csv', csv, 'utf-8');
    //console.log(shop);
  });
})
