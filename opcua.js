"use strict";

const opcua = require("node-opcua");

const Data = require("./models/data");
const Device = require("./models/device");
const Tag = require("./models/tag");

let DEVICES = [];

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

				resolve({
					client,
					session,
				});
			});
		});
	});
}

function closeConnection(connection) {
	return new Promise((resolve, reject) => {
		connection.session.close((err) => {
			if (err !== null) {
				reject(err);
				return;
			}

			connection.client.disconnect(() => {
				resolve();
			});
		});
	});
}

function browse(deviceID, id = "RootFolder") {
	return new Promise((resolve, reject) => {
		DEVICES[deviceID].connection.session.browse(id, (err, result) => {
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

function browsePath(deviceID, path = "RootFolder") {
	return new Promise(async (resolve, reject) => {
		let folders = path.replace(/\/+/g, "/").replace(/\/$/, "").split("/");

		if (folders[0] !== "") {
			return reject("Path must start with a slash.");
		}

		try {
			let nodes = await browse(deviceID, "RootFolder");

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
				nodes = await browse(deviceID, next.id);
			}

			return resolve(nodes);
		} catch (err) {
			return reject(err);
		}
	});
}

function read(deviceID, ids, attribute = opcua.AttributeIds.Value) {
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

		DEVICES[deviceID].connection.session.read(nodes, 0, (err, _, data) => {
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

function write(deviceID, ids, values, attribute = opcua.AttributeIds.Value) {
	return new Promise((resolve, reject) => {
		if (ids instanceof Array === false) {
			// eslint-disable-next-line no-param-reassign
			ids = [ids];
		}

		if (values instanceof Array === false) {
			// eslint-disable-next-line no-param-reassign
			values = [values];
		}

		let nodes = [];

		for (let i = 0; i < ids.length; i++) {
			nodes.push({
				nodeId: ids[i],
				attributeId: attribute,
				value: values[i],
			});
		}

		DEVICES[deviceID].connection.session.write(nodes, (err) => {
			if (err !== null) {
				reject(err);
				return;
			}

			resolve();
		});
	});
}

async function monitor(deviceID, node) {
	let tag = await Tag.where({
		device_id: deviceID,
		name: node.name,
	}).fetch();

	if (tag === null) {
		tag = await Tag.forge({
			device_id: deviceID,
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

	let item = DEVICES[deviceID].subscription.monitor({
		nodeId: tag.get("node_id"),
		attributeId: opcua.AttributeIds.Value,
	}, {}, opcua.read_service.TimestampsToReturn.Neither);

	item.on("changed", (data) => {
		if (data.statusCode.name === "BadNodeIdUnknown") {
			return;
		}

		Data.forge({
			tag_id: tag.id,
			value: data.value.value,
			type: data.value.dataType.key,
			timestamp: data.sourceTimestamp,
		}).save();

		DEVICES[deviceID].sockets = DEVICES[deviceID].sockets.filter((socket) => socket.readyState === 1);

		for (let socket of DEVICES[deviceID].sockets) {
			if (socket.readyState !== 1) {
				continue;
			}

			socket.send(JSON.stringify({
				name: node.name,
				value: data.value.value,
			}));
		}
	});

	DEVICES[deviceID].monitoredItems.push(item);
}

function terminate(deviceID, node) {
	let monitoredItems = DEVICES[deviceID].monitoredItems;

	for (let i = 0; i < monitoredItems.length; i++) {
		if (monitoredItems[i].itemToMonitor.nodeId.value === node.name) {
			monitoredItems[i].terminate(() => {
				monitoredItems.splice(i, 1);
			});

			break;
		}
	}
}

function start() {
	return new Promise(async (resolve, reject) => {
		try {
			let devices = (await Device.fetchAll()).toJSON();

			for (let device of devices) {
				// eslint-disable-next-line no-await-in-loop
				let connection = await createConnection(`opc.tcp://${device.ip}:4870`);
				let subscription = new opcua.ClientSubscription(connection.session, {
					publishingEnabled: true,
				});

				DEVICES[device.id] = {
					connection,
					subscription,
					monitoredItems: [],
					sockets: [],
				};

				// eslint-disable-next-line no-await-in-loop
				let monitoredTags = (await Tag.where({
					device_id: device.id,
					monitor: true,
				}).fetchAll()).toJSON();

				for (let tag of monitoredTags) {
					monitor(device.id, {
						name: tag.name,
						id: tag.node_id,
					});
				}
			}

			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
}

function stop() {
	for (let device of DEVICES) {
		closeConnection(device.connection);
	}
}

function add(device) {
	return new Promise(async (resolve, reject) => {
		try {
			console.log("ADDED");
			let connection = await createConnection(`opc.tcp://${device.ip}:4870`);
			let subscription = new opcua.ClientSubscription(connection.session, {
				publishingEnabled: true,
			});

			DEVICES[device.id] = {
				connection,
				subscription,
				monitoredItems: [],
				sockets: [],
			};

			console.log("ADDED");

			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
}

function addSocket(deviceID, socket) {
	DEVICES[deviceID].sockets.push(socket);
}

module.exports = {
	start,
	stop,
	add,
	browsePath,
	read,
	write,
	monitor,
	terminate,
	addSocket,
};
