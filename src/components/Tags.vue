<template>
<div class="tags">
	<!-- FIXME: Issue with bootstrap v4.0.0-alpha.6 -->
	<div class="table-responsive">
		<b-table :items="tags" :fields="fields" hover striped>
			<template slot="actions" scope="field">
				<span :class='["pointer", "fa", field.item.monitor ? "fa-eye" : "fa-eye-slash"]' @click="toggleMonitor(field.item)"></span>
				<span class="pointer fa fa-pencil" @click="showModal(field.item)"></span>
				<span class="pointer fa fa-area-chart" @click="showGraph(field.item)"></span>
			</template>
		</b-table>
	</div>
	<b-modal ref="modal" title="Update tag value" ok-title="Save" @ok="writeTag(newData)">
		<b-form-input ref="input" type="text" placeholder="New value" v-model="newData.value" autofocus></b-form-input>
	</b-modal>
	<b-modal ref="graph" title="Tag history" size="lg" ok-only>
		<chart :data="tagHistory"></chart>
	</b-modal>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import * as d3 from "d3";
import Chart from "./Chart";

export default {
	name: "tags",
	components: {
		Chart,
	},
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
			tagHistory: [],
		};
	},
	computed: {
		...mapGetters([
			"tags",
			"history",
		]),
	},
	methods: {
		showModal(item) {
			this.newData = { ...item };
			this.$refs.modal.show();
			this.$refs.input.focus();
		},
		async showGraph(item) {
			await this.loadTagHistory(item.id);
			this.selectTag(item.id);
			this.tagHistory = JSON.parse(JSON.stringify(this.history));
			this.$refs.graph.show();
		},
		...mapActions([
			"loadTags",
			"toggleMonitor",
			"writeTag",
			"loadTagHistory",
			"selectTag",
		]),
	},
	mounted() {
		this.loadTags();
	},
	watch: {
		history() {
			this.tagHistory = JSON.parse(JSON.stringify(this.history));
		},
	},
};
</script>

<style scoped>
.fa-eye,
.fa-eye-slash,
.fa-pencil {
	margin-right: 5px;
}
</style>
