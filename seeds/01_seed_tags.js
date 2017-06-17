"use strict";

exports.seed = (knex) => {
	return knex("tags").insert([{
		id: 1,
		name: "Key",
		node_id: "ns=4;s=Key",
		monitor: true,
	}]);
};
