"use strict";

exports.up = (knex) => {
	return knex.schema.createTable("screens", (table) => {
		table.charset("utf8");
		table.collate("utf8_unicode_ci");

		table.increments("id").unsigned().primary();
		table.integer("device_id").unsigned().notNullable().references("devices.id")
			.onDelete("CASCADE").index("screens_device_id_index");
		table.string("name", 63).notNullable();
		table.timestamps(false, true);
	});
};

exports.down = (knex) => {
	return knex.schema.dropTable("screens");
};
