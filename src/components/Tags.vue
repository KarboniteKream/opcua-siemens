<template>
<div class="tags">
	<b-table striped hover :items="tags" :fields="fields">
		<template slot="actions" scope="field">
			<span class="pointer fa" :class="field.item.monitor ? 'fa-eye' : 'fa-eye-slash'" />
		</template>
		<template slot="value" scope="field">
			TODO
		</template>
	</b-table>
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
