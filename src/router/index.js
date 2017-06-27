import Vue from "vue";
import Router from "vue-router";
import Login from "@/components/Login";
import Home from "@/components/Home";
import Devices from "@/components/Devices";
import Tags from "@/components/Tags";
import Browse from "@/components/Browse";
import Screen from "@/components/Screen";

Vue.use(Router);

export default new Router({
	mode: "history",
	routes: [{
		path: "/",
		name: "Home",
		component: Home,
	}, {
		path: "/login",
		name: "Login",
		component: Login,
	}, {
		path: "/devices",
		name: "Devices",
		component: Devices,
	}, {
		path: "/tags",
		name: "Tags",
		component: Tags,
	}, {
		path: "/browse",
		name: "Browse",
		component: Browse,
	}, {
		path: "/screen",
		name: "Screen",
		component: Screen,
	}],
});
