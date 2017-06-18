import Vue from "vue";
import Vuex from "vuex";
import BootstrapVue from "bootstrap-vue";

import App from "./App";
import router from "./router";
import store from "./store";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

Vue.config.productionTip = false;

Vue.use(Vuex);
Vue.use(BootstrapVue);

new Vue({
	el: "#app",
	router,
	store,
	render: h => h(App),
});
