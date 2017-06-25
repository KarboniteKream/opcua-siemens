"use strict";

const Bookshelf = require("../database");

module.exports = Bookshelf.model("User", {
	tableName: "users",
	hasTimestamps: true,

	parse: (user) => {
		delete user.updated_at;
		delete user.created_at;

		return user;
	},
});
