"use strict";

const Bookshelf = require("../database");

require("./tag");
require("./user");

module.exports = Bookshelf.model("Group", {
	tableName: "groups",
	hasTimestamps: true,

	parse: (group) => {
		delete group.updated_at;
		delete group.created_at;

		return group;
	},

	user: function() {
		return this.belongsTo("User");
	},

	tags: function() {
		return this.belongsToMany("Tag", "group_tags");
	},
});
