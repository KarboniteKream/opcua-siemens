<template>
<div class="home">
	<div class="row">
		<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" v-for="device in devices" :key="device.id" @click="setActiveDevice(device.id)">
			<b-card :title="device.name" :sub-title="device.description" show-footer>
				<small slot="footer" class="text-muted">IP: {{ device.ip }}</small>
			</b-card>
		</div>
	</div>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "devices",
	computed: {
		...mapGetters([
			"devices",
		]),
	},
	methods: {
		...mapActions([
			"setActiveDevice",
		]),
	},
};
</script>
