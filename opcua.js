"use strict";

const opcua = require("node-opcua");

const Tag = require("./models/tag");
const Data = require("./models/data");

let CONNECTION = null;
let SUBSCRIPTION = null;

let SOCKETS = [];

function createConnection(url) {
	return new Promise((resolve, reject) => {
		const client = new opcua.OPCUAClient();

		client.connect(url, (err) => {
			if (err !== null) {
				reject(err);
				return;
			}

			client.createSession((err, session) => {
				if (err !== null) {
					reject(err);
					return;
				}

				CONNECTION = {
					client,
					session,
				};

				resolve();
			});
		});
	});
}

function closeConnection() {
	return new Promise((resolve, reject) => {
		CONNECTION.session.close((err) => {
			if (err !== null) {
				reject(err);
				return;
			}

			CONNECTION.client.disconnect(() => {
				resolve();
			});
		});
	});
}

function browse(id = "RootFolder") {
	return new Promise((resolve, reject) => {
		CONNECTION.session.browse(id, (err, result) => {
			if (err !== null) {
				reject(err);
				return;
			}

			if (result.length === 0) {
				reject("No nodes found.");
				return;
			}

			let nodes = [];

			for (let reference of result[0].references) {
				if (reference.isForward === false) {
					continue;
				}

				let name = reference.displayName.text;

				if (name === "FolderType") {
					continue;
				}

				let ns = `ns=${reference.browseName.namespaceIndex};`;
				let identifier = reference.nodeId.value;

				switch (reference.nodeId.identifierType.key) {
					case "NUMERIC":
						identifier = "i=" + identifier;
						break;

					case "STRING":
						identifier = "s=" + identifier;
						break;

					case "GUID":
						identifier = "g=" + identifier;
						break;

					case "OPAQUE":
						identifier = "b=" + identifier;
						break;

					default:
						break;
				}

				nodes.push({
					name: name,
					id: ns + identifier,
					class: reference.nodeClass.key,
				});
			}

			resolve(nodes);
		});
	});
}

function browsePath(path = "RootFolder") {
	return new Promise(async (resolve, reject) => {
		let folders = path.replace(/\/+/g, "/").replace(/\/$/, "").split("/");

		if (folders[0] !== "") {
			return reject("Path must start with a slash.");
		}

		try {
			let nodes = await browse("RootFolder");

			for (let i = 1; i < folders.length; i++) {
				let next = null;

				for (let node of nodes) {
					if (node.name !== folders[i]) {
						continue;
					}

					next = node;
				}

				if (next === null) {
					return reject(`Folder '${folders[i]}' does not exist.`);
				}

				// eslint-disable-next-line no-await-in-loop
				nodes = await browse(next.id);
			}

			return resolve(nodes);
		} catch (err) {
			return reject(err);
		}
	});
}

function read(ids, attribute = opcua.AttributeIds.Value) {
	return new Promise((resolve, reject) => {
		if (ids instanceof Array === false) {
			// eslint-disable-next-line no-param-reassign
			ids = [ids];
		}

		let nodes = [];

		for (let id of ids) {
			nodes.push({
				nodeId: id,
				attributeId: attribute,
			});
		}

		CONNECTION.session.read(nodes, 0, (err, _, data) => {
			if (err !== null) {
				reject(err);
				return;
			}

			let values = data.map((datum) => {
				return datum.value.value;
			});

			if (values.length === 1) {
				values = values[0];
			}

			resolve(values);
		});
	});
}

async function monitor(node) {
	let tag = await Tag.where({
		name: node.name,
	}).fetch();

	if (tag === null) {
		tag = await Tag.forge({
			name: node.name,
			node_id: node.id,
			monitor: true,
		}).save();
	}

	if (tag.get("monitor") === false) {
		await tag.save({
			monitor: true,
		});
	}

	let item = SUBSCRIPTION.monitor({
		nodeId: node.id,
		attributeId: opcua.AttributeIds.Value,
	}, {}, opcua.read_service.TimestampsToReturn.Neither);

	item.on("changed", (data) => {
		Data.forge({
			tag_id: tag.id,
			value: data.value.value,
			type: data.value.dataType.key,
			timestamp: data.sourceTimestamp,
		}).save();

		SOCKETS = SOCKETS.filter((socket) => socket.readyState === 1);

		for (let socket of SOCKETS) {
			if (socket.readyState !== 1) {
				return;
			}

			socket.send(JSON.stringify({
				name: node.name,
				value: data.value.value,
			}));
		}
	});
}

function start(url) {
	return new Promise(async (resolve, reject) => {
		try {
			await createConnection(url);

			SUBSCRIPTION = new opcua.ClientSubscription(CONNECTION.session, {
				publishingEnabled: true,
			});

			let monitoredTags = (await Tag.where({
				monitor: true,
			}).fetchAll()).toJSON();

			for (let tag of monitoredTags) {
				monitor({
					name: tag.name,
					id: tag.node_id,
				});
			}

			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
}

function stop() {
	closeConnection();
}

function addSocket(socket) {
	SOCKETS.push(socket);
}

module.exports = {
	start,
	stop,
	browsePath,
	read,
	monitor,
	addSocket,
};
