"use strict";

const Bookshelf = require("../database");

require("./tag");

module.exports = Bookshelf.model("Data", {
	tableName: "data",
	hasTimestamps: true,

	parse: (data) => {
		delete data.updated_at;
		delete data.created_at;

		switch (data.type) {
			case "Boolean":
				data.value = data.value === "1";
				break;

			default:
				break;
		}

		return data;
	},

	tag: function() {
		return this.belongsTo("Tag");
	},
});
