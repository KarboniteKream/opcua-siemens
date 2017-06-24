"use strict";

exports.seed = (knex) => {
	return knex("screens").insert({
		id: 1,
		device_id: 1,
		name: "Fischertechnik",
	});
};
