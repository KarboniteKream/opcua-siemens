import axios from "axios";

import * as types from "../mutation-types";

const state = {
	socket: null,
	all: [],
	active: null,
	history: [],
};

const getters = {
	// TODO: How can we use this with mapState()?
	tags: (state) => state.all,
	namedTags: (state) => state.all.reduce((acc, tag) => {
		acc[tag.name] = tag.value;
		return acc;
	}, {}),
	history: (history) => state.history,
};

const actions = {
	initSocket(context) {
		if (context.state.socket !== null) {
			return;
		}

		let socket = new WebSocket("ws://localhost:1107/tags");
		socket.onmessage = (message) => {
			context.commit(types.UPDATE_TAG, JSON.parse(message.data));
		};

		context.commit(types.INIT_SOCKET, socket);
	},
	async loadTags(context) {
		await context.dispatch("initSocket");

		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			let response = await axios.get(`/api/devices/${deviceID}/tags`);
			context.commit(types.LOAD_TAGS, response.data);
		} catch (err) {
			console.log(err);
		}
	},
	async toggleMonitor(context, item) {
		context.commit(types.TOGGLE_MONITOR, item.id);

		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			await axios.put(`/api/devices/${deviceID}/tags/${item.id}`, {
				id: item.id,
				name: item.name,
				monitor: item.monitor,
			});
		} catch (err) {
			console.log(err);
		}
	},
	async writeTag(context, data) {
		context.commit(types.UPDATE_TAG, data);

		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			await axios.put(`/api/devices/${deviceID}/tags/${data.id}`, { value: data.value });
		} catch (err) {
			console.log(err);
		}
	},
	async loadTagHistory(context, id) {
		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			let response = await axios.get(`/api/devices/${deviceID}/tags/${id}/history`);
			context.commit(types.LOAD_TAG_HISTORY, response.data);
		} catch (err) {
			console.log(err);
		}
	},
	selectTag(context, id) {
		context.commit(types.SELECT_TAG, id);
	},
};

const mutations = {
	[types.INIT_SOCKET](state, socket) {
		state.socket = socket;
	},
	[types.LOAD_TAGS](state, tags) {
		state.all = tags;
	},
	[types.TOGGLE_MONITOR](state, id) {
		for (let tag of state.all) {
			if (tag.id === id) {
				tag.monitor = !tag.monitor;
				break;
			}
		}
	},
	[types.UPDATE_TAG](state, data) {
		for (let tag of state.all) {
			if (tag.name === data.name) {
				tag.value = data.value;

				if (tag.id === state.active) {
					state.history.unshift({
						id: null,
						tag_id: data.id,
						timestamp: new Date(),
						type: null,
						value: data.value,
					});
				}

				break;
			}
		}
	},
	[types.LOAD_TAG_HISTORY](state, data) {
		state.history = data;
	},
	[types.SELECT_TAG](state, id) {
		state.active = id;
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
