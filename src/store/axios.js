import axios from "axios";

let instance = axios.create();

instance.interceptors.request.use((config) => {
	let token = localStorage.getItem("token");

	if (typeof token !== "undefined") {
		config.headers.authorization = `Bearer ${token}`;
	}

	return config;
}, (err) => {
	return Promise.reject(err);
});

instance.interceptors.response.use((config) => {
	return config;
}, (err) => {
	return Promise.reject(err);
});

export default instance;
