const puppeteer = require('puppeteer');
const username = require('./global').username
const timeout = require('./global').timeout
const helper = require('./helper')
const db = require('./connection').db
const message = require('./message')
const telegram = require('./telegram')


exports.openBrowser = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://twitter.com", { waitUntil: 'networkidle0' , timeout : timeout});

    await browser.close()
}
exports.takeScreenshot = async (page, tweetlink) => {
    await page.goto(`https://tweets-as-an-image.herokuapp.com/tweet?twitterHandle=${username}&id=${tweetlink}&theme=dark&maxwidth=600&height=800&lang=en`, { waitUntil: 'networkidle0' }); // first need to go for set cookies

    const tweetImg = await page.$('img');
    await tweetImg.screenshot({
        path: `./screenshots/tweet/${tweetlink}.png`
    });

}
exports.checkTweets = async (page) => {
    await page.goto(helper.getUrl(""), { waitUntil: 'networkidle0' });

    let tweetlink = await page.$$eval('article a[dir="auto"]', (tweets) => tweets.map((tweet) => tweet.getAttribute('href')));
    tweetlink = helper.removeMediaTags(tweetlink)

    let oldTweetsFromDb = await helper.getLinkforCompare("tweets", 50)
    let newTweetLinks = await (helper.compareGetNewLink(tweetlink, oldTweetsFromDb))
    let newTweetLink = await helper.getLastItemFromArray(newTweetLinks)

    if (newTweetLinks.length > 0 && !newTweetLink.includes("media_tags") && newTweetLink != `/${username}`) {
        console.log("Just Tweeted !" + newTweetLink)

        if (!newTweetLink.includes(`${username}`)) {
            let imageUrl = helper.getRetweetPhotoUrl(newTweetLink);
            const retweetMsg = message.retweetedMessage(newTweetLink)
            const intentRetweetMsg = message.intentRetweetMsg()
            await db('tweets').insert({ link: newTweetLink }).then((result, err) => { if (err) throw err; console.log("New Tweet Added to Database!") }) //working
            await this.tweetIt(page, intentRetweetMsg, newTweetLink)
            telegram.sendPhoto(imageUrl, retweetMsg)
        } else {
            let imageUrl = helper.getPhotoUrl(newTweetLink);
            const tweetMsg = message.tweetedMessage(newTweetLink)
            const intentTweetMsg = message.intentTweetMsg()
            await db('tweets').insert({ link: newTweetLink }).then((result, err) => { if (err) throw err; console.log("New Tweet Added to Database!") }) //working
            await this.tweetIt(page, intentTweetMsg, newTweetLink)
            telegram.sendPhoto(imageUrl, tweetMsg)
        }
    } else {
        console.log("Has No New Tweet..")
    }


}
exports.checkLikes = async (page) => {

    await page.goto(helper.getUrl("/likes"), { waitUntil: 'networkidle0' });

    let tweetlink = await page.$$eval('article a[dir="auto"]', (tweets) => tweets.map((tweet) => tweet.getAttribute('href')));

    tweetlink = helper.removeMediaTags(tweetlink)
    let oldLikesFromDb = await helper.getLinkforCompare("likes", 50)
    let newLikesLinks = await (helper.compareGetNewLink(tweetlink, oldLikesFromDb))
    let newLikesLink = await helper.getLastItemFromArray(newLikesLinks)

    if (newLikesLinks.length > 0 && !newLikesLink.includes("media_tags") && newLikesLink != `/${username}`) {
        console.log("Just Liked !")
        const ownerTweet = await helper.getLikesOwnerUsername(newLikesLink)
        const imageUrl = helper.getPhotoUrl(newLikesLink);
        const tweetMsg = message.likedMessage(newLikesLink, ownerTweet)
        const intentLikeMsg = message.intentLikeMsg()
        await db('likes').insert({ link: newLikesLink, owner: ownerTweet }).then((result, err) => { if (err) throw err; console.log("New Liked Added to Database!") }) //working
        await this.tweetIt(page, intentLikeMsg, newLikesLink)
        try {
            telegram.sendPhoto(imageUrl, tweetMsg)
        } catch (error) {
            console.log(error)
        }

    } else {
        console.log("Has No New Like..")
    }
}
exports.checkReplies = async (page) => {
    await page.goto(helper.getUrl("/with_replies"), { waitUntil: 'networkidle0' });
    await autoScroll(page)
    let tweetlink = await page.$$eval('.css-1dbjc4n.r-j5o65s.r-qklmqi.r-1adg3ll.r-1ny4l3l a[dir="auto"]', (tweets) => tweets.map((tweet) => tweet.getAttribute('href')));
    tweetlink = helper.removeMediaTags(tweetlink)
    let oldTweetsFromDb = await helper.getLinkforCompare("tweets", 2000)
    let repliesLinkWoTweet = await (helper.compareGetNewLink(tweetlink, oldTweetsFromDb))
    let oldRepliesFromDb = await helper.getLinkforCompare("replies", 2000)
    let newRepliesLinks = await (helper.compareGetNewLink(repliesLinkWoTweet, oldRepliesFromDb))

    let newRepliesLink = await helper.getLastItemFromArray(newRepliesLinks)

    console.log(tweetlink)
    console.log(newRepliesLinks)
    console.log(newRepliesLink)


    if (newRepliesLinks.length > 0 && !newRepliesLink.includes("media_tags") && newRepliesLink != `/${username}`) {
        console.log("Just Replied !")
        const imageUrl = helper.getPhotoUrl(newRepliesLink);
        const tweetMsg = message.repliedMessage(newRepliesLink)
        const intentReplyMsg = message.intentReplyMsg()
        await db('replies').insert({ link: newRepliesLink }).then((result, err) => { if (err) throw err; console.log("New Replied Added to Database!") }) //working
        await this.tweetIt(page, intentReplyMsg, newRepliesLink)
        telegram.sendPhoto(imageUrl, tweetMsg)
    } else {
        console.log("Has No New Replies..")
    }
}
exports.getRepliedOwner = async (page, tweetLink) => {
    let tweetId = helper.getTweetId(tweetLink)
    await page.goto(helper.getUrl(`/status/${tweetId}`), { waitUntil: 'networkidle0' });
    TODO: "YARIM KALDI!!"


    const ownerTweet = await page.$$eval('article div[dir="auto"]', (tweets) => tweets.map((tweet) => tweet.textContent));
    console.log(ownerTweet)
    console.log(ownerTweet[0])
}
autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 200;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                //if (totalHeight >= scrollHeight) {
                if (3 >= 1) {

                    clearInterval(timer);
                    resolve();

                }
            }, 100);
        });
    });
}
exports.tweetIt = async (page, textMsg, tweetlink) => {
    let intentTweetUrl = helper.twitterIntentGenarator(textMsg, tweetlink)
    await page.goto(intentTweetUrl, { waitUntil: 'networkidle0' }); // first need to go for set cookies
    await page.click('[data-testid="tweetButton"]')
    console.log("tweeted it!")
}

exports.checkAllFollowing = async (page, index) => {
    let totalUser = [];

    await page.goto(helper.getUrl("/following"), { waitUntil: 'networkidle0',timeout: timeout });

    const twitterSelector = "section"
    const userNameSelector = `.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l`

    await page.waitForSelector(twitterSelector,{timeout:timeout})

 loop1:
    for (let i = 0; i < index; i++) { //150 128 yakaladı
        const elements = await page.$$(twitterSelector)

        for (let elem of elements) {
            let getUserName = await elem.$$eval(userNameSelector, (users) => users.map((users) => users.getAttribute('href'))) // multiple
            console.log(getUserName)
			console.log("*")
            totalUser = totalUser.concat(getUserName) //arraylarü üstüne ekleme
			if(await getUserName.includes('/Teddy_Lin')){
				break loop1;
			}
		
        }
        console.log(i)
        await autoScroll(page)
    }

    let followingArrayFromBrowser = [...new Set(totalUser)]; //remove if already exist
	console.log("followingArrayFromBrowser",followingArrayFromBrowser)
	if(followingArrayFromBrowser.length < 1400) {
		await helper.delay(1000000)
		return;
	}
	
    console.log("number of following: " + followingArrayFromBrowser.length)
    const followingArrayFromDb = await helper.getUserArrayFromDb()

    const newFollewedUser = await helper.getNewFollowingUser(followingArrayFromBrowser, followingArrayFromDb)
    console.log("followed " + newFollewedUser)
    

    if (newFollewedUser) {
        for (let i = 0; i < newFollewedUser.length; i++) {
			
            await db('following').insert({ username: newFollewedUser[i], status: "following" }).then((result, err) => { if (err) throw err; console.log("Setted all following to db ! ") }) //working
            
			const followedMessage = message.followingMessage(newFollewedUser[i])
            console.log(followedMessage)
            telegram.sendMessage(followedMessage)
            await helper.delay(1000)
			
        }
    } else {
        console.log("there is no new following...")
    }

    const newUnfollewedUser = await helper.getNewFollowingUser(followingArrayFromDb,followingArrayFromBrowser)

	
    if (newUnfollewedUser) {
		if(newUnfollewedUser.length < 25){
			 for (let i = 0; i < newUnfollewedUser.length; i++) {
            await db('following').where({ username: newUnfollewedUser[i] }).update({ status: 'unfollowed' }).then((result, err) => { if (err) throw err; console.log("it already in db, changed status to unfollowed from following") })
			const unfollowedMessage = message.unfollowedMessage(newUnfollewedUser[i]) // multiple unfollow
            console.log(unfollowedMessage)
            telegram.sendMessage(unfollowedMessage)
            await helper.delay(1000)
    }
		}
    
	}

}


exports.checkOnlyNewTopFollowing = async (page, index) => {
    let totalUser = [];

    await page.goto(helper.getUrl("/following"), { waitUntil: 'networkidle0' ,timeout: timeout });

    const twitterSelector = "section"
    const userNameSelector = `.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l`

    await page.waitForSelector(twitterSelector,{timeout:timeout})

    for (let i = 0; i < index; i++) { //150 128 yakaladı
        const elements = await page.$$(twitterSelector)

        for (let elem of elements) {
            let getUserName = await elem.$$eval(userNameSelector, (users) => users.map((users) => users.getAttribute('href'))) // multiple
            console.log(getUserName)
            totalUser = totalUser.concat(getUserName) //arraylarü üstüne ekleme
        }
        console.log(i)
        await autoScroll(page)
    }
    let followingArrayFromBrowser = [...new Set(totalUser)]; //remove if already exist

    console.log("number of following: " + followingArrayFromBrowser.length)
    const followingArrayFromDb = await helper.getUserArrayFromDb()
    console.log(followingArrayFromBrowser)

    const newFollewedUser = await helper.getNewFollowingUser(followingArrayFromBrowser, followingArrayFromDb)
    console.log("followed " + newFollewedUser)


    if (newFollewedUser) {
        for (let i = 0; i < newFollewedUser.length; i++) {
            await db('following').insert({ username: newFollewedUser[i], status: "following" }).then((result, err) => { if (err) throw err; console.log("Setted all following to db ! ") }) //working
            const followedMessage = message.followingMessage(newFollewedUser[i])
            console.log(followedMessage)
            telegram.sendMessage(followedMessage)
            await helper.delay(5000)
        }
    } else {
        console.log("there is no new following...")
    }

   
}

exports.reasonToFollow = async (page , username) => {
	
    await page.goto(helper.getUrl(username), { waitUntil: 'networkidle0' });

    let tweetlink = await page.$$eval('article a[dir="auto"]', (tweets) => tweets.map((tweet) => tweet.getAttribute('href')));

    tweetlink = helper.removeMediaTags(tweetlink)
    let oldLikesFromDb = await helper.getLinkforCompare("likes", 50)
    let newLikesLinks = await (helper.compareGetNewLink(tweetlink, oldLikesFromDb))
    let newLikesLink = await helper.getLastItemFromArray(newLikesLinks)

    if (newLikesLinks.length > 0 && !newLikesLink.includes("media_tags") && newLikesLink != `/${username}`) {
        console.log("Just Liked !")
        const ownerTweet = await helper.getLikesOwnerUsername(newLikesLink)
        const imageUrl = helper.getPhotoUrl(newLikesLink);
        const tweetMsg = message.likedMessage(newLikesLink, ownerTweet)
        const intentLikeMsg = message.intentLikeMsg()
        await db('likes').insert({ link: newLikesLink, owner: ownerTweet }).then((result, err) => { if (err) throw err; console.log("New Liked Added to Database!") }) //working
        await this.tweetIt(page, intentLikeMsg, newLikesLink)
        try {
            telegram.sendPhoto(imageUrl, tweetMsg)
        } catch (error) {
            console.log(error)
        }

    } else {
        console.log("Has No New Like..")
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms))
