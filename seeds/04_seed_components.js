"use strict";

exports.seed = (knex) => {
	return knex("components").insert([{
		id: 1,
		screen_id: 1,
		name: "TruckSection1",
		data: JSON.stringify({
			shape: "rectangle",
			position: {
				x: 200,
				y: 200,
			},
			size: {
				w: 100,
				h: 300,
			},
			attributes: [{
				type: "color",
				value: "#FF00FF",
				conditions: [{
					tag: "Sensor1",
					value: true,
				}, {
					tag: "Sensor2",
					value: true,
				}],
				operator: "OR",
			}, {
				type: "color",
				value: "#FF0000",
				conditions: [{
					tag: "Sensor1",
					value: false,
				}],
			}],
		}),
	}, {
		id: 2,
		screen_id: 1,
		name: "PushSection1",
		data: JSON.stringify({
			shape: "circle",
			position: {
				x: 100,
				y: 100,
			},
			size: {
				r: 50,
			},
			attributes: [{
				type: "position",
				value: {
					x: 250,
					y: 150,
				},
				delta: {
					tag: "Data_PushSection1State",
					start: 0,
					end: 2,
				},
			}],
		}),
	}]);
};
