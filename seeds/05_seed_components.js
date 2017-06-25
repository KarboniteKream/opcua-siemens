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
				value: {
					RGB: "#FF00FF",
				},
				delta: {},
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
				value: {
					RGB: "#FF0000",
				},
				delta: {},
				conditions: [{
					tag: "Sensor1",
					value: false,
				}],
				operator: "AND",
			}, {
				type: "border",
				value: {
					RGB: "#000000",
				},
				delta: {},
				conditions: [],
				operator: "AND",
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
					x: 200,
					y: 100,
				},
				delta: {
					tag: "Data_PushSection1State",
					start: 0,
					end: 2,
				},
				conditions: [],
				operator: "AND",
			}],
		}),
	}, {
		id: 3,
		screen_id: 1,
		name: "Arrow1",
		data: JSON.stringify({
			shape: "triangle",
			position: {
				x: 200,
				y: 100,
			},
			size: {
				w: 100,
				h: 100,
			},
			direction: "right",
			attributes: [],
		}),
	}]);
};
