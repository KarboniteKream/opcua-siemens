"use strict";

const Bookshelf = require("../database");

require("./tag");

module.exports = Bookshelf.model("Device", {
	tableName: "devices",
	hasTimestamps: true,

	parse: (device) => {
		delete device.updated_at;
		delete device.created_at;

		return device;
	},

	tags: function() {
		return this.hasMany("Tag");
	},
});
