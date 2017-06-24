import Vue from "vue";
import Vuex from "vuex";

import createLogger from "vuex/dist/logger";

import devices from "./modules/devices";
import tags from "./modules/tags";
import browse from "./modules/browse";
import screen from "./modules/screen";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
	modules: {
		devices,
		tags,
		browse,
		screen,
	},
	strict: debug,
	plugins: debug ? [createLogger()] : [],
});
