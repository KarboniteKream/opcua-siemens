"use strict";

exports.seed = (knex) => {
	return knex("devices").insert([{
		id: 1,
		name: "Siemens PLC-238",
		description: "Klemen Košir, Žan Palčič",
		ip: "193.2.72.238",
	}, {
		id: 2,
		name: "Siemens PLC-241",
		description: "Anže Medved",
		ip: "193.2.72.241",
	}]);
};
