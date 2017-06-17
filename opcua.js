"use strict";

const opcua = require("node-opcua");
const moment = require("moment");

const Tag = require("./models/tag");
const Data = require("./models/data");

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

function browse(connection, id = "RootFolder") {
	return new Promise((resolve, reject) => {
		connection.session.browse(id, (err, result) => {
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

				// eslint-disable-next-line default-case
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

function browsePath(connection, path = "RootFolder") {
	return new Promise(async (resolve, reject) => {
		let folders = path.replace(/\/+/g, "/").replace(/\/$/, "").split("/");

		if (folders[0] !== "") {
			return reject("Path must start with a slash.");
		}

		try {
			let nodes = await browse(connection, "RootFolder");

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
				nodes = await browse(connection, next.id);
			}

			return resolve(nodes);
		} catch (err) {
			return reject(err);
		}
	});
}

function read(connection, ids, attribute = opcua.AttributeIds.Value) {
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

		connection.session.read(nodes, 0, (err, _, data) => {
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

function createSubscription(connection) {
	return new opcua.ClientSubscription(connection.session, {
		publishingEnabled: true,
	});
}

function terminateSubscription(subscription) {
	subscription.terminate();
}

async function monitor(subscription, node) {
	let tag = await Tag.where({
		name: node.name,
	}).fetch();

	if (tag === null) {
		tag = await Tag.forge({
			name: node.name,
			node_id: node.id,
		}).save();
	}

	let item = subscription.monitor({
		nodeId: node.id,
		attributeId: opcua.AttributeIds.Value,
	}, {}, opcua.read_service.TimestampsToReturn.Neither);

	item.on("changed", (data) => {
		let timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
		console.log(`${timestamp} | [${node.name}] ${data.value.value}`);

		Data.forge({
			tag_id: tag.id,
			value: data.value.value,
			type: data.value.dataType.key,
		}).save();
	});
}

module.exports = {
	createConnection,
	closeConnection,
	browsePath,
	read,
	createSubscription,
	terminateSubscription,
	monitor,
};
