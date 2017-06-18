import Vue from "vue";
import Vuex from "vuex";
import devices from "./modules/devices";
import createLogger from "vuex/dist/logger";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
	modules: {
		devices,
	},
	strict: debug,
	plugins: debug ? [createLogger()] : [],
});
