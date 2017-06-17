"use strict";

exports.up = (knex) => {
	return knex.schema.createTable("tags", (table) => {
		table.charset("utf8");
		table.collate("utf8_unicode_ci");

		table.increments("id").unsigned().primary();
		table.string("name", 63).notNullable();
		table.string("node_id", 255).notNullable();
		table.boolean("monitor").notNullable();
		table.timestamps(false, true);
	});
};

exports.down = (knex) => {
	return knex.schema.dropTable("tags");
};
