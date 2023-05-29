const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config()

 const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN 

const telegramChatId = process.env.TELEGRAM_CHAT_ID 

const telegramBot = new TelegramBot(telegramBotToken, { polling: false });

exports.sendMessage = (message) => {
    telegramBot.sendMessage(telegramChatId,message)
}

exports.sendPhoto = (url,caption) => {
    telegramBot.sendPhoto(telegramChatId,url,{caption:caption})
}
