import * as types from "../mutation-types";
import axios from "axios";

const state = {
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
	async loadTags(context) {
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
};

const mutations = {
	[types.LOAD_TAGS](state, tags) {
		state.all = tags;
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
