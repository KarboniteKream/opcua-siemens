import axios from "axios";

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
	setActiveDevice(context, id) {
		context.commit(types.SET_ACTIVE_DEVICE, id);
	},
};

const mutations = {
	[types.LOAD_DEVICES](state, devices) {
		state.all = devices;
	},
	[types.SET_ACTIVE_DEVICE](state, id) {
		state.active = id;
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
