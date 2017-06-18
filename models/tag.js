"use strict";

const Bookshelf = require("../database");

require("./data");
require("./device");

module.exports = Bookshelf.model("Tag", {
	tableName: "tags",
	hasTimestamps: true,

	parse: (tag) => {
		tag.monitor = Boolean(tag.monitor);
		delete tag.updated_at;
		delete tag.created_at;

		return tag;
	},

	device: function() {
		return this.belongsTo("Device");
	},

	data: function() {
		return this.hasMany("Data");
	},
});
