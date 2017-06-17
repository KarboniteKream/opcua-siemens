"use strict";

const opcua = require("./opcua");
const Bookshelf = require("./database");

const Tag = require("./models/tag");

async function main() {
	let url = "opc.tcp://192.168.1.105:4870";

	try {
		let connection = await opcua.createConnection(url);
		let nodes = await opcua.browsePath(connection, "/Objects/WinCC RT Advanced/Tags");
		console.log(nodes);
		let data = await opcua.read(connection, ["ns=4;s=Key", "ns=4;s=Sensor5"]);
		console.log(data);

		let subscription = opcua.createSubscription(connection);

		let monitoredTags = (await Tag.where({
			monitor: true,
		}).fetchAll()).toJSON();

		for (let tag of monitoredTags) {
			opcua.monitor(subscription, {
				name: tag.name,
				id: tag.node_id,
			});
		}

		setTimeout(() => {
			Bookshelf.knex.destroy();
			opcua.terminateSubscription(subscription);
			opcua.closeConnection(connection);
		}, 30000);
	} catch (err) {
		console.log(err);
	}
}

main();
