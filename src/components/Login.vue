<template>
<div class="login">
	<div class="row">
		<div class="col-4"></div>
		<div class="col-4 text-center">
			<h2>Login</h2>
			<b-form-input type="email" placeholder="E-mail" v-model="email" autofocus></b-form-input>
			<b-form-input type="password" placeholder="Password" v-model="password"></b-form-input>
			<b-button variant="primary" class="pointer" @click="login">Login</b-button>
		</div>
		<div class="col-4"></div>
	</div>
</div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

export default {
	name: "login",
	data() {
		return {
			email: "",
			password: "",
		};
	},
	methods: {
		async login() {
			let response = await axios.post("/api/auth/login", {
				email: this.email,
				password: this.password,
			});

			localStorage.setItem("token", response.data.accessToken);
			localStorage.setItem("refresh_token", response.data.refreshToken);

			await this.loadDevices();
			this.$router.push("/");
		},
		...mapActions([
			"loadDevices",
		]),
	},
};
</script>

<style scoped>
h2 {
	display: block;
	margin-bottom: 30px;
}

input {
	margin-bottom: 10px;
}

button {
	margin-top: 20px;
}
</style>
