import * as types from "../mutation-types";
import axios from "axios";

const state = {
	path: ["Root"],
	all: [],
};

const getters = {
	path: (state) => state.path.map((text, idx) => ({ text, idx })),
	// TODO: How can we use this with mapState()?
	nodes: (state) => state.all,
};

const actions = {
	async changePath(context, idx) {
		let path = context.state.path.slice(1);

		if (idx !== context.state.path.length - 1) {
			path = path.slice(0, idx);
			context.commit(types.UPDATE_BREADCRUMB, context.state.path.slice(0, idx + 1));
		}

		path = "/" + path.join("/");

		if (context.rootState.devices.selected === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.selected;
			let response = await axios.get(`/api/browse${path}`);
			context.commit(types.LOAD_NODES, response.data);
		} catch (err) {
			console.log(err);
		}
	},
	openPath(context, name) {
		context.commit(types.UPDATE_BREADCRUMB, [...context.state.path, name]);
		// TODO: Is there a better way?
		context.dispatch("changePath", context.state.path.length - 1);
	},
};

const mutations = {
	[types.LOAD_NODES](state, nodes) {
		// TODO: Add "Up" action.
		state.all = nodes;
	},
	[types.UPDATE_BREADCRUMB](state, path) {
		state.path = path;
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
