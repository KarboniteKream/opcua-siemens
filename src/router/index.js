import Vue from "vue";
import Router from "vue-router";
import Home from "@/components/Home";
import Devices from "@/components/Devices";
import Tags from "@/components/Tags";
import Browse from "@/components/Browse";

Vue.use(Router);

export default new Router({
	mode: "history",
	routes: [{
		path: "/",
		name: "Home",
		component: Home,
	}, {
		path: "/devices",
		name: "Devices",
		component: Devices,
	}, {
		path: "/tags",
		name: "Tags",
		component: Tags,
	}, {
		path: "/Browse",
		name: "Browse",
		component: Browse,
	}],
});
