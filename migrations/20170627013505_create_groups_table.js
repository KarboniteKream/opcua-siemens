"use strict";

exports.up = (knex) => {
	return knex.schema.createTable("groups", (table) => {
		table.charset("utf8");
		table.collate("utf8_unicode_ci");

		table.increments("id").unsigned().primary();
		table.integer("user_id").unsigned().notNullable().references("users.id")
			.onDelete("CASCADE").index("groups_user_id_index");
		table.integer("device_id").unsigned().notNullable().references("devices.id")
			.onDelete("CASCADE").index("groups_device_id_index");
		table.string("name");
		table.timestamps(false, true);
	});
};

exports.down = (knex) => {
	return knex.schema.dropTable("groups");
};
