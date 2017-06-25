"use strict";

const bcrypt = require("bcrypt");

exports.seed = (knex) => {
	return knex("users").insert([{
		id: 1,
		email: "klemen.kosir@kream.io",
		password: bcrypt.hashSync("test123", 10),
	}]);
};
