import axios from "../axios";

import * as types from "../mutation-types";

const state = {
	socket: null,
	groups: [],
	all: [],
	active: null,
	history: [],
};

const getters = {
	// TODO: How can we use this with mapState()?
	groups: (state) => {
		return state.groups.map((group) => {
			group = { ...group };

			group.tags = group.tags.map((tag) => {
				return state.all.find((t) => {
					return t.id === tag.id;
				});
			});

			return group;
		});
	},
	tags: (state) => state.all,
	namedTags: (state) => state.all.reduce((acc, tag) => {
		acc[tag.name] = tag.value;
		return acc;
	}, {}),
	history: (state) => state.history,
};

const actions = {
	async initSocket(context) {
		if (context.state.socket !== null) {
			return;
		}

		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		let deviceID = context.rootState.devices.active;
		let socket = new WebSocket(`ws://${location.hostname}:1107/tags/${deviceID}`);

		socket.onmessage = (message) => {
			context.commit(types.UPDATE_TAG, JSON.parse(message.data));
		};

		context.commit(types.INIT_SOCKET, socket);
	},
	async loadTags(context) {
		await context.dispatch("initSocket");

		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			let response = await axios.get(`/api/devices/${deviceID}/tags`);
			context.commit(types.LOAD_TAGS, response.data);
		} catch (err) {
			console.log(err);
		}
	},
	async toggleMonitor(context, item) {
		context.commit(types.TOGGLE_MONITOR, item.id);

		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			await axios.put(`/api/devices/${deviceID}/tags/${item.id}`, {
				id: item.id,
				name: item.name,
				monitor: item.monitor,
			});
		} catch (err) {
			console.log(err);
		}
	},
	async writeTag(context, data) {
		context.commit(types.UPDATE_TAG, data);

		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			await axios.put(`/api/devices/${deviceID}/tags/${data.id}`, { value: data.value });
		} catch (err) {
			console.log(err);
		}
	},
	async loadTagHistory(context, id) {
		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			let response = await axios.get(`/api/devices/${deviceID}/tags/${id}/history`);
			context.commit(types.LOAD_TAG_HISTORY, response.data);
		} catch (err) {
			console.log(err);
		}
	},
	selectTag(context, id) {
		context.commit(types.SELECT_TAG, id);
	},
	async deleteTag(context, tag) {
		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			await axios.delete(`/api/devices/${deviceID}/tags/${tag.id}`);
            context.commit(types.DELETE_TAG, tag.id);
		} catch (err) {
			console.log(err);
		}
	},
	async loadGroups(context) {
		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			let response = await axios.get(`/api/devices/${deviceID}/groups`);
			context.commit(types.LOAD_GROUPS, response.data);
		} catch (err) {
			console.log(err);
		}
	},
	async createGroup(context, name) {
		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			let response = await axios.post(`/api/devices/${deviceID}/groups`, { name });
			response.data.tags = [];
			context.commit(types.CREATE_GROUP, response.data);
		} catch (err) {
			console.log(err);
		}
	},
	async addTagToGroup(context, data) {
		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;

            for (let group of context.state.groups) {
				if (group.name === data.group) {
					await axios.post(`/api/devices/${deviceID}/groups/${group.id}/tags`, { id: data.tag });
					context.commit(types.ADD_TAG_TO_GROUP, data);
					break;
				}
            }
		} catch (err) {
			console.log(err);
		}
	},
	async removeTagFromGroup(context, data) {
		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			let groupID = context.state.groups[data.groupIdx].id;

			await axios.delete(`/api/devices/${deviceID}/groups/${groupID}/tags/${data.tag.id}`);
			context.commit(types.REMOVE_TAG_FROM_GROUP, data);
		} catch (err) {
			console.log(err);
		}
	},
	async deleteGroup(context, idx) {
		if (context.rootState.devices.active === null) {
			// TODO: Wait for existing action to complete.
			await context.dispatch("loadDevices");
		}

		try {
			let deviceID = context.rootState.devices.active;
			let groupID = context.state.groups[idx].id;
			await axios.delete(`/api/devices/${deviceID}/groups/${groupID}`);
            context.commit(types.DELETE_GROUP, idx);
		} catch (err) {
			console.log(err);
		}
	},
};

const mutations = {
	[types.INIT_SOCKET](state, socket) {
		state.socket = socket;
	},
	[types.LOAD_TAGS](state, tags) {
		state.all = tags;
	},
	[types.TOGGLE_MONITOR](state, id) {
		for (let tag of state.all) {
			if (tag.id === id) {
				tag.monitor = !tag.monitor;
				break;
			}
		}
	},
	[types.UPDATE_TAG](state, data) {
		for (let tag of state.all) {
			if (tag.name === data.name) {
				tag.value = data.value;

				if (tag.id === state.active) {
					state.history.unshift({
						id: null,
						tag_id: data.id,
						timestamp: new Date(),
						type: null,
						value: data.value,
					});

					state.history = state.history.slice(0, 10);
				}

				break;
			}
		}
	},
	[types.LOAD_TAG_HISTORY](state, data) {
		state.history = data;
	},
	[types.SELECT_TAG](state, id) {
		state.active = id;
	},
	[types.DELETE_TAG](state, id) {
		let tags = state.all;

		for (let i = 0; i < tags.length; i++) {
			if (tags[i].id === id) {
				tags.splice(i, 1);
				break;
			}
		}
	},
	[types.LOAD_GROUPS](state, groups) {
		state.groups = groups;
	},
	[types.CREATE_GROUP](state, group) {
		state.groups.push(group);
	},
	[types.ADD_TAG_TO_GROUP](state, data) {
		for (let group of state.groups) {
			if (group.name === data.group) {
				for (let tag of state.all) {
					if (tag.id === data.tag) {
						group.tags.push(tag);
						break;
					}
				}
				break;
			}
		}
	},
	[types.REMOVE_TAG_FROM_GROUP](state, data) {
		let group = state.groups[data.groupIdx];

		for (let i = 0; i < group.tags.length; i++) {
			let tag = group.tags[i];

			if (tag.id === data.tag.id) {
				group.tags.splice(i, 1);
				break;
			}
		}
	},
	[types.DELETE_GROUP](state, idx) {
		state.groups.splice(idx, 1);
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
