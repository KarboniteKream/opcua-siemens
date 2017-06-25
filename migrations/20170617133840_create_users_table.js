"use strict";

exports.up = (knex) => {
	return knex.schema.createTable("users", (table) => {
		table.charset("utf8");
		table.collate("utf8_unicode_ci");

		table.increments("id").unsigned().primary();
		table.string("email", 127).notNullable();
		table.string("password", 255).notNullable();
		table.timestamps(false, true);
	});
};

exports.down = (knex) => {
	return knex.schema.dropTable("users");
};
