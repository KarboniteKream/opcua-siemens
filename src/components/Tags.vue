<template>
<div class="tags">
	<!-- FIXME: Issue with bootstrap v4.0.0-alpha.6 -->
	<div class="table-responsive">
		<b-table :items="tags" :fields="fields" hover striped>
			<template slot="actions" scope="field">
				<span :class='["pointer", "fa", field.item.monitor ? "fa-eye" : "fa-eye-slash"]' @click="toggleMonitor(field.item)"></span>
				<span class="pointer fa fa-pencil" @click="showModal(field.item)"></span>
			</template>
		</b-table>
	</div>
	<b-modal ref="modal" title="Update tag value" ok-title="Save" @ok="writeTag(newData)">
		<b-form-input ref="input" type="text" placeholder="New value" v-model="newData.value" autofocus></b-form-input>
	</b-modal>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "tags",
	data() {
		return {
			fields: {
				actions: {},
				name: {
					label: "Name",
					sortable: true,
				},
				node_id: {
					label: "Node ID",
					sortable: true,
				},
				value: {
					label: "Value",
				},
			},
			newData: {
				name: "",
				value: "",
			},
		};
	},
	computed: {
		...mapGetters([
			"tags",
		]),
	},
	methods: {
		showModal(item) {
			this.newData = { ...item };
			this.$refs.modal.show();
			this.$refs.input.focus();
		},
		...mapActions([
			"loadTags",
			"toggleMonitor",
			"writeTag",
		]),
	},
	mounted() {
		this.loadTags();
	},
}
</script>

<style scoped>
.fa-eye,
.fa-eye-slash {
	margin-right: 5px;
}
</style>
