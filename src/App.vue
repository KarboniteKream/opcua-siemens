<template>
<div id="app">
	<b-navbar toggleable>
		<b-nav-toggle target="navbar-collapse"></b-nav-toggle>
		<b-link class="navbar-brand" to="/">
			<span>OPC UA</span>
		</b-link>
		<b-collapse is-nav id="navbar-collapse">
			<b-nav is-nav-bar>
				<b-nav-item to="/devices">Device: {{ selectedDevice.name }}</b-nav-item>
				<b-nav-item to="/tags">Tags</b-nav-item>
				<b-nav-item to="/browse">Browse</b-nav-item>
				<b-nav-item to="/screen">Screen</b-nav-item>
			</b-nav>
			<b-nav is-nav-bar class="ml-auto">
				<b-nav-item-dropdown right>
					<template slot="text">
						<span class="bold">User</span>
					</template>
					<b-dropdown-item to="#">Profile</b-dropdown-item>
					<b-dropdown-item to="#">Logout</b-dropdown-item>
				</b-nav-item-dropdown>
			</b-nav>
		</b-collapse>
	</b-navbar>
	<div class="container">
		<router-view></router-view>
	</div>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "app",
	computed: {
		...mapGetters([
			"selectedDevice",
		]),
	},
	methods: {
		...mapActions([
			"loadDevices",
		]),
	},
	mounted() {
		this.loadDevices();
	},
};
</script>

<style>
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2C3E50;
}

nav.navbar {
	border-bottom: 1px solid rgba(0, 0, 0, 0.125);
	margin-bottom: 30px;
}

a {
	color: #42B983;
}

a:focus {
	outline: none;
}

.pointer {
	cursor: pointer;
}

.bold {
	font-weight: bold;
}
</style>
