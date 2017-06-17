"use strict";

const Bookshelf = require("../database");

require("./data");

module.exports = Bookshelf.model("Tag", {
	tableName: "tags",
	hasTimestamps: true,

	parse: (data) => {
		data.monitor = Boolean(data.monitor);
		return data;
	},

	data: function() {
		return this.hasMany("Data");
	},
});
