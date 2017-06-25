import * as types from "../mutation-types";
import axios from "axios";

const state = {
	all: [],
	active: null,
};

const getters = {
	screens: (state) => state.all,
	components: (state) => {
		if (state.all.length === 0) {
			return null;
		}

		return state.all[0].components;
	},
	activeComponent: (state) => {
		if (state.active === null || state.all.length === 0) {
			return null;
		}

		let active = state.all[0].components.find((component) => {
			return component.id === state.active;
		});

		if (active === null) {
			return null;
		}

		return { ...active };
	},
};

const actions = {
	async loadScreens(context) {
		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		await context.dispatch("loadTags");

		try {
			let deviceID = context.rootState.devices.active;
			let response = await axios.get(`/api/devices/${deviceID}/screens`);
			context.commit(types.LOAD_SCREENS, response.data);
		} catch (err) {
			console.log(err);
		}
	},
	setActiveComponent(context, id) {
		context.commit(types.SET_ACTIVE_COMPONENT, id);
	},
	deleteComponent(context, id) {
		context.commit(types.DELETE_COMPONENT, id);
	},
};

const mutations = {
	[types.LOAD_SCREENS](state, screens) {
		state.all = screens;

		if (screens.length > 0) {
			state.active = screens[0].id;
		}
	},
	[types.SET_ACTIVE_COMPONENT](state, id) {
		state.active = id;
	},
	[types.DELETE_COMPONENT](state, id) {
		console.log("TODO", id);
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
