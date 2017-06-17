"use strict";

const Bookshelf = require("../database");

require("./data");

module.exports = Bookshelf.model("Tag", {
	tableName: "tags",
	hasTimestamps: true,

	parse: (tag) => {
		tag.monitor = Boolean(tag.monitor);
		delete tag.updated_at;
		delete tag.created_at;

		return tag;
	},

	data: function() {
		return this.hasMany("Data");
	},
});
