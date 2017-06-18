import * as types from "../mutation-types";
import axios from "axios";

const state = {
	selected: null,
	all: [],
};

const getters = {
	selectedDevice: (state) => {
		let device = state.all.find((device) => device.id === state.selected);

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
	loadDevices(context) {
		axios.get("/api/devices").then((response) => {
			context.commit(types.LOAD_DEVICES, response.data);

			if (context.state.selected === null) {
				context.commit(types.SET_SELECTED_DEVICE, response.data[0].id);
			}
		}, (err) => {
			console.log(err);
		});
	},
	setSelectedDevice(context, id) {
		context.commit(types.SET_SELECTED_DEVICE, id);
	},
};

const mutations = {
	[types.LOAD_DEVICES](state, devices) {
		state.all = devices;
	},
	[types.SET_SELECTED_DEVICE](state, id) {
		state.selected = id;
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
