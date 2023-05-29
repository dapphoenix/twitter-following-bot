
require('dotenv').config()
const puppeteer = require('puppeteer');
require = require("esm")(module/*, options*/)
const helper = require('./helper')
const scraper = require('./puppeteer')
const timeout = require('./global').timeout
const constant  = require('./global')
let counter = 0

startBot = async () => {
    const browser = await puppeteer.launch({ 
	headless: constant.isHeadless === "true",
	executablePath:"/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
	 });
    const page = await browser.newPage();
    while(counter> -1) {
        await twitterLoop(page,browser)
    }
    
}
startBot()

async function twitterLoop(page,browser) {
    try {
        
        await page.goto(helper.getUrl(""), { waitUntil: 'networkidle2' , timeout: timeout }); // first need to go for set cookies
   
        await page.setViewport({
            width: 600,
            height: 800
        });
		
		await login(page,browser)
		await page.goto(helper.getUrl(""), { waitUntil: 'networkidle2' , timeout: timeout }); // first need to go for set cookies

        if (counter % 30 == 0) {
            await scraper.checkAllFollowing(page, 3000)
        } else {
            await scraper.checkOnlyNewTopFollowing(page, 30)
        }
		
		 //*/


    } catch (error) {
        console.log(error)
        await browser.close()
        await startBot()
    } finally {
		counter++;
		await browser.close()
		await startBot()
    }

}

const usernameInputSelector = constant.usernameInputSelector
const usernameNextSelector = constant.usernameNextSelector
const passwordInputSelector = constant.passwordInputSelector 
const loginButton = constant.loginButton 
const tusername = constant.tusername 
const tpassword = constant.tpassword 
async function login(page, browser) {
        await page.goto(constant.loginUrl, { waitUntil: 'networkidle2' , timeout: timeout }); // first need to go for set cookies
   
        await page.waitForSelector(usernameInputSelector)
        await page.click(usernameInputSelector)
        await page.type(usernameInputSelector, tusername, {delay: 20})

        await page.click(usernameNextSelector)
        await page.waitForSelector(passwordInputSelector)

        await page.type(passwordInputSelector, tpassword, {delay: 20})
        
		await Promise.all([page.click(loginButton), page.waitForNavigation()]);

}
