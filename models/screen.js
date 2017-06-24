"use strict";

const Bookshelf = require("../database");

require("./component");
require("./device");

module.exports = Bookshelf.model("Screen", {
	tableName: "screens",
	hasTimestamps: true,

	parse: (screen) => {
		delete screen.updated_at;
		delete screen.created_at;

		return screen;
	},

	device: function() {
		return this.belongsTo("Device");
	},

	components: function() {
		return this.hasMany("Component");
	},
});
