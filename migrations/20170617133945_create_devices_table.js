"use strict";

exports.up = (knex) => {
	return knex.schema.createTable("devices", (table) => {
		table.charset("utf8");
		table.collate("utf8_unicode_ci");

		table.increments("id").unsigned().primary();
		table.string("name", 63).notNullable();
		table.string("description", 255).notNullable();
		table.string("ip", 15).notNullable();
		table.timestamps(false, true);
	});
};

exports.down = (knex) => {
	return knex.schema.dropTable("devices");
};
