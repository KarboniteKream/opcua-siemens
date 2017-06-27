import axios from "../axios";

import * as types from "../mutation-types";

const state = {
	active: null,
	all: [],
};

const getters = {
	activeDevice: (state) => {
		let device = state.all.find((device) => device.id === state.active);

		if (typeof device === "undefined") {
			device = {
				name: "Loading ...",
			};
		}

		return device;
	},
	// TODO: How can we use this with mapState()?
	devices: (state) => state.all,
};

const actions = {
	async loadDevices(context) {
		try {
			let response = await axios.get("/api/devices");
			context.commit(types.LOAD_DEVICES, response.data);

			if (context.state.active === null) {
				context.commit(types.SET_ACTIVE_DEVICE, response.data[0].id);
			}
		} catch (err) {
			console.log(err);
		}
	},
	async createDevice(context, data) {
		try {
			let response = await axios.post("/api/devices", data);
			context.commit(types.CREATE_DEVICE, response.data);
			context.commit(types.SET_ACTIVE_DEVICE, response.data.id);
		} catch (err) {
			console.log(err);
		}
	},
	setActiveDevice(context, id) {
		context.commit(types.SET_ACTIVE_DEVICE, id);
	},
	async deleteDevice(context, id) {
		try {
			await axios.delete(`/api/devices/${id}`);
			context.commit(types.DELETE_DEVICE, id);

			if (context.state.active === null) {
				context.commit(types.SET_ACTIVE_DEVICE, state.devices[0].id || null);
			}
		} catch (err) {
			console.log(err);
		}
	}
};

const mutations = {
	[types.LOAD_DEVICES](state, devices) {
		state.all = devices;
	},
	[types.CREATE_DEVICE](state, device) {
		state.all.push(device);
	},
	[types.SET_ACTIVE_DEVICE](state, id) {
		state.active = id;
	},
	[types.DELETE_DEVICE](state, id) {
		let devices = state.all;

		for (let i = 0; i < devices.length; i++) {
			if (devices[i].id === id) {
				devices.splice(i, 1);
				break;
			}
		}
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
