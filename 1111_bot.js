const ng = require('nightmare');
const nightmare = ng({ show: true, width: 1024, height: 960 });
const { JSDOM } = require('jsdom');
const fs = require('fs');
const { window } = new JSDOM("");
const $ = require('jquery')(window);
const base64Img = require('base64-to-image')
const util = require('util');
const exec = util.promisify( require('child_process').exec );
const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};
let url = 'https://www.1111.com.tw'
let keyword = 'Node.js'
let html 
let arrLink = []
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
    
    console.log(arrLink.length)
}
async function getDetileInfo(){
    for (let i of arrLink) {
        try {
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

            let objDetaile = {
                '職位名稱' : name,
                '公司名稱' : company,
                '公司連結' : companyUrl
            }
            console.log(objDetaile)
        } catch (error) {
            console.log(error)
        }
    }
}
async function asyncArray(functionList){
    for(let func of functionList){
        await func();
    }
}

(
    async function (){
        await asyncArray([
            go,
            scroll,
            getLink,
            getDetileInfo
        ]).then(async ()=>{
            console.log('Done')
        });
    }
)()