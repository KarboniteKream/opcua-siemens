import Vue from "vue";
import Vuex from "vuex";

import createLogger from "vuex/dist/logger";

import devices from "./modules/devices";
import tags from "./modules/tags";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
	modules: {
		devices,
		tags,
	},
	strict: debug,
	plugins: debug ? [createLogger()] : [],
});
