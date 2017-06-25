"use strict";

exports.seed = (knex) => {
	const names = [
		"Data_Locations{0}_BlockID",
		"Data_Locations{2}_Instruction_Clockwise1",
		"Data_Locations{2}_Instruction_Time1",
		"Data_Locations{2}_Instruction_Clockwise2",
		"Data_Locations{2}_Instruction_Time2",
		"Data_Machine1State",
		"Data_Machine2State",
		"Data_MachineSection1State",
		"Data_MachineSection2State",
		"Data_PushSection1State",
		"Data_PushSection2State",
		"Data_TruckSection1State",
		"Data_TruckSection2State",
		"Key",
		"Machine1Clockwise",
		"Machine1Time",
		"Machine2Clockwise",
		"Machine2Time",
		"Motor1Move",
		"Sensor1",
		"Sensor2",
		"Sensor3",
		"Sensor4",
		"Sensor5",
	];

	let tags = [];

	for (let name of names) {
		tags.push({
			id: tags.length + 1,
			device_id: 1,
			name: name,
			node_id: `ns=4;s=${name}`,
			monitor: true,
		});
	}

	return knex("tags").insert(tags);
};
