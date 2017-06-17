"use strict";

// Load .env configuration.
require("dotenv").load();

const opcua = require("./opcua");
const Bookshelf = require("./database");

process.on("exit", cleanup);
process.on("SIGINT", cleanup);

function cleanup() {
	opcua.stop();
	Bookshelf.knex.destroy();

	// The server should never stop.
	process.exit(1);
}

opcua.start(process.env.OPC_URL).then(async () => {
	let nodes = await opcua.browsePath("/Objects/WinCC RT Advanced/Tags");
	let data = await opcua.read(["ns=4;s=Key", "ns=4;s=Sensor5"]);

	console.log(nodes);
	console.log(data);
});
