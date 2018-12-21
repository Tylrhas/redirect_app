const { INTEGER, STRING, BOOLEAN } = require('sequelize')

module.exports = sequelize => sequelize.define('redirect', {
	id: {
		autoIncrement: true,
		primaryKey: true,
		type: INTEGER
	},
	domain_id: {
		type: INTEGER,
		notEmpty: true
	},
	path: {
		type: STRING,
		notEmpty: true
	},
	destination: {
		type: STRING,
		notEmpty: true
	},
	secure_destination: {
		type: BOOLEAN,
		allowNull: false,
		defaultValue: true
	},
	wildcard: {
		type: BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})