"use strict";

exports.up = (knex) => {
	return knex.schema.createTable("group_tags", (table) => {
		table.charset("utf8");
		table.collate("utf8_unicode_ci");

		table.integer("group_id").unsigned().notNullable().references("groups.id")
			.onDelete("CASCADE").index("group_tags_group_id_index");
		table.integer("tag_id").unsigned().notNullable().references("tags.id")
			.onDelete("CASCADE").index("group_tags_tag_id_index");

		table.primary(["group_id", "tag_id"]);
	});
};

exports.down = (knex) => {
	return knex.schema.dropTable("group_tags");
};
