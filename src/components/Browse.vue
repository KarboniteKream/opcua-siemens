<template>
<div class="browse">
	<b-breadcrumb :items="path" @click="changePath($event.idx)"></b-breadcrumb>
	<!-- FIXME: Issue with bootstrap v4.0.0-alpha.6 -->
	<div class="table-responsive">
		<b-table :items="nodes" :fields="fields" hover striped @row-clicked="openPath($event.name)">
			<template slot="name" scope="field">
				<span :class='["icon", getIcon(field.item.class)]'></span>
				<span>{{ field.value }}</span>
			</template>
		</b-table>
	</div>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "browse",
	data() {
		return {
			fields: {
				name: {
					label: "Name",
				},
				id: {
					label: "Node ID",
				},
				class: {
					label: "Type",
				},
			},
		};
	},
	computed: {
		...mapGetters([
			"path",
			"nodes",
		]),
	},
	methods: {
		...mapActions([
			"changePath",
			"openPath",
		]),
		getIcon(type) {
			switch (type) {
				case "Object":
					return "fa fa-folder";

				case "VariableType":
					return "fa fa-file";

				case "Variable":
					return "fa fa-file-text";
			}
		},
	},
	mounted() {
		this.changePath(0);
	},
};
</script>

<style scoped>
.icon {
	margin-right: 10px;
}
</style>
