"use strict";

exports.up = (knex) => {
	return knex.schema.createTable("data", (table) => {
		table.charset("utf8");
		table.collate("utf8_unicode_ci");

		table.increments("id").unsigned().primary();
		table.integer("tag_id").unsigned().notNullable().references("tags.id")
			.onDelete("CASCADE").index("data_tag_id_index");
		table.string("value", 63).notNullable();
		table.string("type", 63).notNullable();
		table.specificType("timestamp", "TIMESTAMP(3)").notNullable().index("data_timestamp_index");
		table.timestamps(false, true);
	});
};

exports.down = (knex) => {
	return knex.schema.dropTable("data");
};
