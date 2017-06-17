"use strict";

const Bookshelf = require("../database");

require("./data");

module.exports = Bookshelf.model("Tag", {
	tableName: "tags",
	hasTimestamps: true,

	data: function() {
		return this.hasMany("Data");
	},
});
