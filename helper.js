const username = require('./global').username
const db = require('./connection').db


exports.getUrl = (url) => {
    return `https://twitter.com/${username}${url}`
}

exports.strFollowingtoInt = (followingNumber) => {
    const strFollNum = followingNumber[0].replace(".", "") && followingNumber[0].replace(",", "")
    const intFollNum = parseInt(strFollNum)
    return intFollNum;
}

exports.getUserArrayFromDb = async () => {
    let followingArrayFromDb = [];
    let followingListFromDb = await db('following')
        .select('username')
        .where({ status: "following" })
        .then((result, err) => {
            return JSON.parse(JSON.stringify(result))
        })

    for (let i = 0; i < followingListFromDb.length; i++) {
        followingArrayFromDb[i] = followingListFromDb[i].username
    }
    return followingArrayFromDb;
}
exports.getAllUsernameFromDb = async (uniqueTotalUser) => {
    for (let username of uniqueTotalUser) {
        try {
            await db('following').insert({ username: username, status: "following" }).then((result, err) => { console.log(result) }) //working
        } catch (error) { }
    }
}

exports.getNewFollowingUser = async (followingArrayFromBrowser, followingArrayFromDb) => {
    return (followingArrayFromBrowser.filter(x => !followingArrayFromDb.includes(x)));
}

exports.getNewunfollowedUser = async (followingArrayFromBrowser, followingArrayFromDb) => {
return (followingArrayFromDb.filter(x => !followingArrayFromBrowser.includes(x)));
}

exports.removeSlashes = (stringWithSlashes) => {
    return stringWithSlashes.replace("/", "")
}

exports.rowDataToArray = (rowdata) => {
    return JSON.parse(JSON.stringify(rowdata))
}

exports.getLinkforCompare = async (table, limit) => {
    let linkListArray = [];
    let linkListFromDb = await db(table,)
        .where({})
        .select("link")
        .limit(limit)
        .orderBy("id", "desc")
        .then((result, err) => {
            return JSON.parse(JSON.stringify(result))
        })

    for (let i = 0; i < linkListFromDb.length; i++) {
        linkListArray[i] = linkListFromDb[i].link
    }
    return linkListArray;
}
exports.compareGetNewLink = (linkArrayFromBrowser, linkArrayFromDb) => {
    return (linkArrayFromBrowser.filter(x => !linkArrayFromDb.includes(x)))
}

exports.getTweetId = (link) => {
    for (let i = 0; i < 3; i++) {
        link = link.substring(link.indexOf("/") + 1)
    }
    if (link.includes("media")) {
        link = link.slice(0, link.lastIndexOf('/'))
    }
    return link;
}
exports.getLastItemFromArray = (array) => {
    let index = array.length - 1;
    return array[index]
}
exports.getPhotoUrl = (tweetlink) => {
    let id = this.getTweetId(tweetlink)
    return `https://tweets-as-an-image.herokuapp.com/tweet?twitterHandle=${username}&id=${id}&theme=dark&maxwidth=600&height=800&lang=en&random=64`
}
exports.getRetweetPhotoUrl = (tweetlink) => {
    let retweetOwnerUsername = this.getTweetOwnerUsername(tweetlink)
    let id = this.getTweetId(tweetlink)
    return `https://tweets-as-an-image.herokuapp.com/tweet?twitterHandle=${retweetOwnerUsername}&id=${id}&theme=dark&maxwidth=600&height=800&lang=en`
}
exports.getTweetOwnerUsername = (tweetlink) => {
    let owner;
    owner = tweetlink.substring(tweetlink.indexOf("/") + 1)
    owner = owner.slice(0, owner.lastIndexOf('/'))
    owner = owner.slice(0, owner.lastIndexOf('/'))
    return owner;
}
exports.getLikesOwnerUsername = (tweetlink) => {
    let owner;
    owner = tweetlink.substring(tweetlink.indexOf("/") + 1)
    owner = owner.slice(0, owner.lastIndexOf('/'))
    owner = owner.slice(0, owner.lastIndexOf('/'))
    return owner;
}
exports.addAllFollowingtoDb = async (page,index) => {
    let totalUser = [];

    await page.goto(this.getUrl("/following"), { waitUntil: 'networkidle0' });

    const twitterSelector = "section"
    const userNameSelector = `.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l`

    await page.waitForSelector(twitterSelector)

    for (let i = 0; i < index; i++) { //150 128 yakaladı
        const elements = await page.$$(twitterSelector)

        for (let elem of elements) {
            let getUserName = await elem.$$eval(userNameSelector, (users) => users.map((users) => users.getAttribute('href'))) // multiple
            console.log(getUserName)
            totalUser =  totalUser.concat(getUserName) //arraylarü üstüne ekleme
        }
        console.log(i)
        await autoScroll(page)
    }


    const followingArrayFromBrowser =  [...new Set(totalUser)]; //remove if already exist
    
    for( elem of followingArrayFromBrowser){

        if(  !(await db('following').where({username:elem}))[0]){
            console.log("heree")
            await db('following').insert({ username: elem,status:"following" }).then((result, err) => { if (err) throw err; console.log("Setted all following to db ! ") }) //working
        }
    }


}

exports.removeMediaTags = (tweetlinks) => {
    for( let i = tweetlinks.length - 1 ; i >= 0; i--){ 
        if ( tweetlinks[i].includes("media_tags") ){   
            tweetlinks.splice(i, 1); 
        }
    }
	return tweetlinks
}
exports.twitterIntentGenarator = (intentTweetMsg,tweetlink) => {
    let message =intentTweetMsg
    let url = `https://twitter.com${tweetlink}`
    var start_text = 'https://twitter.com/intent/tweet?text=';
const generated_tweet = encodeURIComponent(message);
  const generated_url = "&url=" + encodeURIComponent(url);

    const intentTweet = start_text + generated_tweet + generated_url
    return intentTweet;
}

exports.delay = ms => new Promise(res => setTimeout(res,ms))