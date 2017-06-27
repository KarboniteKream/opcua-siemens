<template>
<div class="tags">
	<div v-for="(group, idx) in groups" :key="group.id">
		<h2 class="group-name">{{ group.name }}</h2> <span class="pointer" @click="deleteGroup(idx)">&times; Remove</span>
		<div class="table-responsive">
			<b-table :items="group.tags" :fields="fields" hover striped>
				<template slot="actions" scope="field">
					<span :class='["pointer", "fa", field.item.monitor ? "fa-eye" : "fa-eye-slash"]' @click="toggleMonitor(field.item)"></span>
					<span class="pointer fa fa-pencil" @click="showModal(field.item)"></span>
					<span class="pointer fa fa-area-chart" @click="showGraph(field.item)"></span>
					<span class="pointer fa fa-tag" @click="showTagModal(field.item)"></span>
					<span class="pointer fa fa-times" @click="removeTagFromGroup({ tag: field.item, groupIdx: idx })"></span>
				</template>
			</b-table>
		</div>
	</div>
	<span class="new-group pointer" @click="showGroupModal">+ New group</span>
	<h2>All tags</h2>
	<div class="table-responsive">
		<b-table :items="tags" :fields="fields" hover striped>
			<template slot="actions" scope="field">
				<span :class='["pointer", "fa", field.item.monitor ? "fa-eye" : "fa-eye-slash"]' @click="toggleMonitor(field.item)"></span>
				<span class="pointer fa fa-pencil" @click="showModal(field.item)"></span>
				<span class="pointer fa fa-area-chart" @click="showGraph(field.item)"></span>
				<span class="pointer fa fa-trash" @click="deleteTag(field.item)"></span>
				<span class="pointer fa fa-tag" @click="showTagModal(field.item)"></span>
			</template>
		</b-table>
	</div>
	<b-modal ref="groupModal" title="New group" ok-title="Create" @ok="createGroup(newGroupName)">
		<b-form-input ref="groupInput" type="text" placeholder="Group name" v-model="newGroupName" autofocus></b-form-input>
	</b-modal>
	<b-modal ref="tagModal" title="Add to group" ok-title="Add" @ok="addTagToGroup({ tag: selectedTag, group: newGroup })">
		<b-form-select class="tag-groups" v-model="newGroup" :options="groups.map((group) => group.name)"></b-form-select>
	</b-modal>
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
			newGroupName: "",
			selectedTag: null,
			newGroup: null,
			newData: {
				name: "",
				value: "",
			},
			tagHistory: [],
		};
	},
	computed: {
		...mapGetters([
			"groups",
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
		showGroupModal(item) {
			this.$refs.groupModal.show();
			this.$refs.groupInput.focus();
		},
		showTagModal(item) {
			this.selectedTag = item.id;
			this.$refs.tagModal.show();
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
			"deleteTag",
			"loadGroups",
			"createGroup",
			"addTagToGroup",
			"removeTagFromGroup",
			"deleteGroup",
		]),
	},
	mounted() {
		this.loadGroups();
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
.fa-pencil,
.fa-area-chart,
.fa-trash,
.fa-tag {
	margin-right: 5px;
}

h2.group-name {
	display: inline-block;
	margin-right: 10px;
}

.new-group {
	display: block;
	margin-top: -10px;
	margin-bottom: 40px;
}

table {
	margin-bottom: 40px;
}

.tag-groups {
	width: 100%;
}
</style>
