import axios from "axios";
import * as types from "../mutation-types";

const state = {
	socket: null,
	all: [],
};

const getters = {
	// TODO: How can we use this with mapState()?
	tags: (state) => state.all,
	namedTags: (state) => state.all.reduce((acc, tag) => {
		acc[tag.name] = tag.value;
		return acc;
	}, {}),
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

		if (context.rootState.devices.selected === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.selected;
			let response = await axios.get(`/api/devices/${deviceID}/tags`);
			context.commit(types.LOAD_TAGS, response.data);
		} catch (err) {
			console.log(err);
		}
	},
	async toggleMonitor(context, item) {
		context.commit(types.TOGGLE_MONITOR, item.id);

		if (context.rootState.devices.selected === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.selected;
			await axios.put(`/api/devices/${deviceID}/tags/${item.id}`, { monitor: item.monitor });
		} catch (err) {
			console.log(err);
		}
	},
	async writeTag(context, data) {
		context.commit(types.UPDATE_TAG, data);

		if (context.rootState.devices.selected === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.selected;
			await axios.put(`/api/devices/${deviceID}/tags/${data.id}`, { value: data.value });
		} catch (err) {
			console.log(err);
		}
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
			if (tag.id !== id) {
				continue;
			}

			tag.monitor = !tag.monitor;
		}
	},
	[types.UPDATE_TAG](state, data) {
		for (let tag of state.all) {
			if (tag.name !== data.name) {
				continue;
			}

			tag.value = data.value;
		}
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
