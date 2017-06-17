"use strict";

const connection = require("./knexfile");
const Knex = require("knex")(connection);
const Bookshelf = require("bookshelf")(Knex);

Bookshelf.plugin("registry");

module.exports = Bookshelf;
