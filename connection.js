require('dotenv').config()
const knex = require('knex')

exports.db = knex({
	client: 'mysql',
	connection: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password : '',
		database: process.env.DB_DATABASE
	}
});

exports.checkUsernameIsExist = (username) => {

}
