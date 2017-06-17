"use strict";

const opcua = require("./opcua");

async function main() {
	let url = "opc.tcp://192.168.1.105:4870";

	try {
		let connection = await opcua.createConnection(url);
		let nodes = await opcua.browsePath(connection, "/Objects/WinCC RT Advanced/Tags");
		console.log(nodes);
		let data = await opcua.read(connection, ["ns=4;s=Key", "ns=4;s=Sensor5"]);
		console.log(data);

		let node = {
			name: "Key",
			id: "ns=4;s=Key",
			class: "Variable",
		};

		let subscription = opcua.createSubscription(connection);
		opcua.monitor(subscription, node);

		setTimeout(() => {
			opcua.terminateSubscription();
			opcua.closeConnection(connection);
		}, 30000);
	} catch (err) {
		console.log(err);
	}
}

main();
