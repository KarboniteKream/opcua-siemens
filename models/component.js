"use strict";

const Bookshelf = require("../database");

require("./screen");

module.exports = Bookshelf.model("Component", {
	tableName: "components",
	hasTimestamps: true,

	parse: (component) => {
		if (typeof component.data !== "undefined") {
			Object.assign(component, JSON.parse(component.data));
		}

		delete component.data;
		delete component.updated_at;
		delete component.created_at;

		return component;
	},

	screen: function() {
		return this.belongsTo("Screen");
	},
});
