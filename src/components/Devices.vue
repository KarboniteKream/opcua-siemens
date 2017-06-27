<template>
<div class="home">
	<div class="row">
		<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" v-for="device in devices" :key="device.id" @click="setActiveDevice(device.id)">
			<b-card :title="device.name" :sub-title="device.description" show-footer>
				<small slot="footer" class="text-muted"><span class="pull-left">IP: {{ device.ip }}</span> <span class="pointer pull-right" @click="deleteDevice(device.id)">Remove</span></small>
			</b-card>
		</div>
	</div>
	<span class="pointer" @click="showModal">+ New device</span>
	<b-modal ref="modal" title="New device" ok-title="Create" @ok="createDevice(newDeviceData)">
		<b-form-input ref="input" type="text" placeholder="Name" v-model="newDeviceData.name" autofocus></b-form-input>
		<b-form-input type="text" placeholder="Description" v-model="newDeviceData.description"></b-form-input>
		<b-form-input type="text" placeholder="IP" v-model="newDeviceData.ip"></b-form-input>
	</b-modal>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "devices",
	data() {
		return {
			newDeviceData: {
				name: "",
				description: "",
				ip: "",
			},
		};
	},
	computed: {
		...mapGetters([
			"devices",
		]),
	},
	methods: {
		showModal() {
			this.newDeviceData = {
				name: "",
				description: "",
				ip: "",
			};

			this.$refs.modal.show();
			this.$refs.input.focus();
		},
		...mapActions([
			"createDevice",
			"setActiveDevice",
			"deleteDevice",
		]),
	},
};
</script>

<style scoped>
.form-control {
	display: block;
	margin-bottom: 10px;
}
</style>
