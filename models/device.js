"use strict";

const Bookshelf = require("../database");

require("./tag");

module.exports = Bookshelf.model("Device", {
	tableName: "devices",
	hasTimestamps: true,

	parse: (data) => {
		delete data.updated_at;
		delete data.created_at;

		return data;
	},

	tags: function() {
		return this.hasMany("Tag");
	},
});
