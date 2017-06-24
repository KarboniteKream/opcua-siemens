import * as types from "../mutation-types";
import axios from "axios";

const state = {
	all: [],
};

const getters = {
	screens: (state) => state.all,
	components: (state) => {
		if (state.all.length === 0) {
			return null;
		}

		return state.all[0].components;
	},
};

const actions = {
	async loadTags(context) {
		if (context.rootState.devices.selected === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.selected;
			let response = await axios.get(`/api/devices/${deviceID}/screens`);
			context.commit(types.LOAD_SCREENS, response.data);
		} catch (err) {
			console.log(err);
		}
	},
};

const mutations = {
	[types.LOAD_SCREENS](state, screens) {
		state.all = screens;
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
