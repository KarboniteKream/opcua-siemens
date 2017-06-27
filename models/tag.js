"use strict";

const Bookshelf = require("../database");

require("./data");
require("./device");
require("./group");

module.exports = Bookshelf.model("Tag", {
	tableName: "tags",
	hasTimestamps: true,

	parse: (tag) => {
		if (typeof tag.monitor !== "undefined") {
			tag.monitor = Boolean(tag.monitor);
		}

		delete tag.device_id;
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

	groups: function() {
		return this.belongsToMany("Group", "group_tags");
	},
});
