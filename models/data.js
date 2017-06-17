"use strict";

const Bookshelf = require("../database");

require("./tag");

module.exports = Bookshelf.model("Data", {
	tableName: "data",
	hasTimestamps: true,

	tag: function() {
		return this.belongsTo("Tag");
	},
});
