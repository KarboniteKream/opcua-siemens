"use strict";

exports.up = (knex) => {
	return knex.schema.createTable("components", (table) => {
		table.charset("utf8");
		table.collate("utf8_unicode_ci");

		table.increments("id").unsigned().primary();
		table.integer("screen_id").unsigned().notNullable().references("screens.id")
			.onDelete("CASCADE").index("components_screen_id_index");
		table.string("name");
		table.json("data").notNullable();
		table.timestamps(false, true);
	});
};

exports.down = (knex) => {
	return knex.schema.dropTable("components");
};
