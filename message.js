const username = require('./global').username
const realname = require('./global').realname
const helper = require('./helper')

exports.followingMessage = (fusername) => {
    fusername = helper.removeSlashes(fusername)
    return `${realname} is now following @${fusername}\n\nhttps://twitter.com/${fusername}`
}
exports.unfollowedMessage = (fusername) => {
    fusername = helper.removeSlashes(fusername)
    return `${realname} unfollowed @${fusername}\n\nhttps://twitter.com/${fusername}`
}
exports.tweetedMessage = (tweetLink) => {
    return `${realname} just tweeted\n\nhttps://twitter.com${tweetLink}`
}
exports.retweetedMessage = (tweetLink) => {
    return `${realname} just retweeted\n\nhttps://twitter.com${tweetLink}`
}
exports.likedMessage = (tweetLink, owner) => {
    return `${realname} liked a tweet from @${owner}\n\nhttps://twitter.com${tweetLink}`
}
exports.repliedMessage = (tweetLink) => {
    return `${realname} replied a tweet\n\nhttps://twitter.com${tweetLink}`
}
exports.intentTweetMsg = () => {
    return `${realname} just tweeted`
}
exports.intentRetweetMsg = () => {
    return `${realname} just retweeted`
}
exports.intentLikeMsg = () => {
    return `${realname} liked a tweet`
}
exports.intentReplyMsg = () => {
    return `${realname} replied a tweet`
}
exports.intentFollowingMsg = (fusername) => {
    fusername = helper.removeSlashes(fusername)
    return `${realname} is now following @${fusername}`
}
exports.intentUnfollowedMsg = (fusername) => {
    fusername = helper.removeSlashes(fusername)
    return `${realname} unfollowed @${fusername}`
}