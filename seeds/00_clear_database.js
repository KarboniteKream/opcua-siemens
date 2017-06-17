"use strict";

exports.seed = async (knex, Promise) => {
	await Promise.all([
		knex("data").truncate(),
	]);

	await Promise.all([
		knex("tags").delete(),
	]);

	return Promise.all([
		knex.raw("ALTER TABLE data AUTO_INCREMENT = 1"),
		knex.raw("ALTER TABLE tags AUTO_INCREMENT = 1"),
	]);
};
