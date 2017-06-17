"use strict";

// Load .env configuration.
require("dotenv").load();

const opcua = require("./opcua");
const Bookshelf = require("./database");

opcua.start(process.env.OPC_URL).then(async () => {
	let nodes = await opcua.browsePath("/Objects/WinCC RT Advanced/Tags");
	let data = await opcua.read(["ns=4;s=Key", "ns=4;s=Sensor5"]);

	console.log(nodes);
	console.log(data);

	setTimeout(() => {
		Bookshelf.knex.destroy();
		opcua.stop();
	}, 30000);
});
