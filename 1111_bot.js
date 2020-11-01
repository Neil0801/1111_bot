const ng = require('nightmare');
const nightmare = ng({ show: true, width: 1024, height: 960 }); //瀏覽器
const { JSDOM } = require('jsdom');
const fs = require('fs');
const { window } = new JSDOM("");
const $ = require('jquery')(window); //jq
const util = require('util');
const exec = util.promisify( require('child_process').exec );
const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};
let arrayLength = '';
const reg = / &nbsp /g
let url = 'https://www.1111.com.tw'
let keyword = 'Node.js' //職位名稱
let html 
let arrLink = []
let arrResult = []


async function init(){
    if( ! await fs.existsSync(`./1111_bot/downloads`) ){
        await fs.mkdirSync(`./1111_bot/downloads`, {recursive: true});
    }
} 
async function go(){
     await nightmare
    .goto(url, headers)
    .wait(500)
    .type('input#ks',keyword)
    .wait(200)
    .click('input#c0Cht')
    .wait('div#llllmenu_list')
    .click('div#llllmenu_list>ul:nth-of-type(1)>li:nth-of-type(1)>a>input')
    .wait(200)
    .click('div#llllmenu_list>ul:nth-of-type(1)>li:nth-of-type(2)>a>input')
    .wait(200)
    .click('input#smSure')
    .wait(200)
    .click('input#searchjobGo')
}


async function scroll(){
    await nightmare
    .wait(200)

    let innerHeightOfWindow = 0
    let totalOffset = 0;
    try {
        while(totalOffset <= innerHeightOfWindow){
            innerHeightOfWindow = await nightmare.evaluate(() => {
                return document.documentElement.scrollHeight;
            });
    
            totalOffset += 500;
    
            await nightmare
            .scrollTo(totalOffset, 0)
            .wait(500);
    
            console.log(`totalOffset = ${totalOffset}, innerHeightOfWindow = ${innerHeightOfWindow}`);
        }
    } catch (error) {
        console.log(error)
    }
    
    html = await nightmare
    .evaluate(() => {
        return document.documentElement.innerHTML;
    })
}
async function getLink(){
    try {
        $(html)
        .find('li.loaded')
        .each(
            (_,elm)=>{
                $(elm)
                .find('div>ul')
                .each(
                    (_,e)=>{
                        let _i = $(e)
                        .find('li:nth-of-type(1)>div.it-md>div:nth-of-type(1)>a:nth-of-type(1)')
                        let link = url + _i.attr('href')
                        arrLink.push(link)
                    }
                )
            }
        )
    } catch (error) {
        console.log(error)
    }
    arrayLength = '數量' + arrLink.length
    console.log(arrayLength)
}
async function getDetileInfo(){
    let num = 1 
    for (let i of arrLink) {
        try {
            console.log(num)
            let arrContent = []
            let inHtml = 
                await nightmare
                .goto(i, headers)
                .wait(500)
                .evaluate(() => {
                    return document.documentElement.innerHTML;
                })
            
            let top = $(inHtml)
                .find('section#visual')
            let main = $(inHtml)
                .find('section#incontent>div>div.floatL.w65')

            let name = top
                .find('div#menu>div>div.logoTitle>h1').text()
            let company = top
                .find('div#menu>div>div.logoTitle>ul>li.ellipsis>a').text()
            let companyUrl = 
                url + top.find('div#menu>div>div.logoTitle>ul>li.ellipsis>a').attr('href')
            
            let link = await nightmare
            .evaluate(() => {
                return window.location.href;
            })

            let dest = $(inHtml).find('.floatL.w65')
            let destMore = $(dest).find('article:nth-of-type(1)>ul.dataList')

            let _content = $(dest).find('article:nth-of-type(1)>ul>li>p').each(
                (_,elm)=>{
                    let text = elm.innerHTML
                    arrContent.push(text)
                }
            )
            for(let i of arrContent){
                try {
                    i.replace(reg,'')
                } catch (error) {
                    continue
                }
            }
            let place = destMore.find('li:nth-of-type(2)>div.listContent').text()
            let time = destMore.find('li:nth-of-type(3)>div.listContent').text()
            let rest = destMore.find('li:nth-of-type(4)>div.listContent').text()
            let money = destMore.find('li:nth-of-type(5)>div.listContent').text()
            let jb_type = destMore.find('li:nth-of-type(6)>div.listContent').text()
            let jb_cat = destMore.find('li:nth-of-type(7)>div.listContent').text()
            let person = destMore.find('li:nth-of-type(8)>div.listContent').text()
            let date = destMore.find('li:nth-of-type(9)>div.listContent').text()
            let nicee = destMore.find('dd>ul>div').text()


            let dest2 = dest.find('article:nth-of-type(2)>ul.dataList')
            let need = []
            dest2.find('li:nth-of-type(6)>div.listContent>p').each(
                (_,elm)=>{
                    let text = $(elm).text()
                    need.push(text)
                })
            let _personNeed = {
                '身份類別': dest2.find('li:nth-of-type(1)>div.listContent').text(),
                '學歷限制' : dest2.find('li:nth-of-type(2)>div.listContent').text(),
                '科系限制' : dest2.find('li:nth-of-type(3)>div.listContent>a').text(),
                '工作經驗' : dest2.find('li:nth-of-type(4)>div.listContent').text(),
                '電腦專長' : dest2.find('li:nth-of-type(5)>div.listContent').text(),
                '附加條件' : need
                }
            let objDetaile = {
                'link' : link,
                '職位名稱' : name,
                '公司名稱' : company,
                '公司連結' : companyUrl,
                '描述' : arrContent,
                '地點' : place,
                '上班時間' : time,
                '休假' : rest,
                '工作待遇' : money,
                '工作性質' : jb_type,
                '職務類別' : jb_cat,
                '需求人數' : person,
                '到職日期' : date, 
                '工作福利' : nicee,
                '要求條件' : _personNeed
            }
            arrResult.push(objDetaile)
            objDetaile = {}
            num = num + 1
        } catch (error) {
            console.log(error)
        }
    }
    

}

async function final(){
    await nightmare.end(function() {
        console.log(`關閉 nightmare`);
    });

    await fs.writeFileSync(`./1111_bot/downloads/${arrayLength}.json`,JSON.stringify(arrResult,null,4))
}
async function asyncArray(functionList){
    for(let func of functionList){
        await func();
    }
}

(
    async function (){
        await asyncArray([
            init, //初始化目錄
            go, //進入1111
            scroll, //滾動頁面取得動態生成資料
            getLink, //取得每個職位連結
            getDetileInfo, //職位詳細資料
            final //寫入檔案
        ]).then(async ()=>{
            console.log('Done')
        });
    }
)()