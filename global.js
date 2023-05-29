require('dotenv').config()

exports.username = process.env.USERNAME;
exports.realname = process.env.REALNAME;
exports.timeout = process.env.TIMEOUT;
exports.isHeadless = process.env.IS_HEADLESS;
exports.usernameInputSelector = process.env.USERNAME_INPUT_SELECTOR;
exports.usernameNextSelector = process.env.USERNAME_NEXT_SELECTOR;
exports.passwordInputSelector = process.env.PASSWORD_INPUT_SELECTOR;
exports.loginButton = process.env.LOGIN_BUTTON;
exports.loginUrl = process.env.LOGIN_URL;

exports.tusername = process.env.T_USERNAME;
exports.tpassword = process.env.T_PASSWORD;
