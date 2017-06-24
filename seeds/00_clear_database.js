"use strict";

exports.seed = async (knex, Promise) => {
	await Promise.all([
		knex("data").truncate(),
		knex("components").truncate(),
	]);

	await Promise.all([
		knex("screens").delete(),
		knex("tags").delete(),
		knex("devices").delete(),
	]);

	return Promise.all([
		knex.raw("ALTER TABLE data AUTO_INCREMENT = 1"),
	]);
};
