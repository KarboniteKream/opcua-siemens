<template>
<div class="tags">
	<!-- FIXME: Issue with bootstrap v4.0.0-alpha.6 -->
	<div class="table-responsive">
		<b-table :items="tags" :fields="fields" hover striped>
			<template slot="actions" scope="field">
				<span :class='["pointer", "fa", field.item.monitor ? "fa-eye" : "fa-eye-slash"]' />
			</template>
			<template slot="value" scope="field">
				TODO
			</template>
		</b-table>
	</div>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "devices",
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
		};
	},
	computed: {
		...mapGetters([
			"tags",
		]),
	},
	methods: {
		...mapActions([
			"loadTags",
		]),
	},
	mounted() {
		this.loadTags();
	},
}
</script>
