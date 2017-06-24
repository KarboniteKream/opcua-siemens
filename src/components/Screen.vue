<template>
<div class="screen">
	<canvas id="canvas" width="1280" height="800"></canvas>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "screen",
	data() {
		return {
			elements: [{
				id: 1,
				name: "TruckSection1",
				shape: "rectangle",
				position: {
					x: 200,
					y: 200,
				},
				size: {
					w: 100,
					h: 300,
				},
				attributes: [{
					type: "color",
					value: "#FF00FF",
					conditions: [{
						tag: "Sensor1",
						value: true,
					}, {
						tag: "Sensor2",
						value: true,
					}],
					operator: "OR",
				}, {
					type: "color",
					value: "#FF0000",
					conditions: [{
						tag: "Sensor1",
						value: false,
					}],
				}],
			}, {
				id: 2,
				name: "PushSection1",
				shape: "circle",
				position: {
					x: 150,
					y: 150,
				},
				size: {
					r: 50,
				},
				attributes: [{
					type: "position",
					value: {
						x: 250,
						y: 150,
					},
					delta: {
						tag: "Data_PushSection1State",
						start: 0,
						end: 2,
					},
				}],
			}],
		};
	},
	computed: {
		...mapGetters({
			tags: "namedTags",
		}),
	},
	methods: {
		reset() {
			let numIntervals = setInterval(null, 1000);
			for (let i = 0; i < numIntervals; i++) {
				clearInterval(i);
				clearTimeout(i);
			}
		},
		draw() {
			let canvas = document.getElementById("canvas");
			let ctx = canvas.getContext("2d");

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (let element of this.elements) {
				ctx.fillStyle = "#000000";

				let position = { ...element.position };
				let size = { ...element.size };

				for (let attribute of element.attributes) {
					if (typeof attribute.conditions === "undefined") {
						attribute.conditions = [];
					}

					if (typeof attribute.operator === "undefined") {
						attribute.operator = "AND";
					}

					let enabled = attribute.operator === "AND";

					if (typeof attribute.conditions === "undefined" || attribute.conditions.length === 0) {
						enabled = true;
					}

					for (let condition of attribute.conditions) {
						let tagValue = this.tags[condition.tag];

						if (attribute.operator === "AND" && tagValue !== condition.value) {
							enabled = false;
							break;
						} else if (attribute.operator === "OR" && tagValue === condition.value) {
							enabled = true;
							break;
						}
					}

					if (enabled === false) {
						continue;
					}

					switch (attribute.type) {
						case "color":
							ctx.fillStyle = attribute.value;
							break;

						case "position":
							if (typeof attribute.delta === "undefined") {
								position = attribute.value;
								break;
							}

							let tagValue = Math.max(attribute.delta.start, Math.min(this.tags[attribute.delta.tag], attribute.delta.end));
							let delta = (tagValue - attribute.delta.start) / attribute.delta.end;

							position.x += (attribute.value.x - element.position.x) * delta;
							position.y += (attribute.value.y - element.position.y) * delta;

							break;
					}
				}

				switch (element.shape) {
					case "rectangle":
						ctx.fillRect(position.x, position.y, size.w, size.h);
						break;

					case "circle":
						ctx.beginPath();
						ctx.arc(position.x, position.y, size.r, 2 * Math.PI, false);
						ctx.fill();
						break;
				}
			}
		},
		...mapActions([
			"loadTags",
		]),
	},
	async mounted() {
		await this.loadTags();
		this.reset();
		this.draw();

		setInterval(this.draw, 100);

		setTimeout(() => {
			this.tags.Sensor1 = false;
		}, 2500);

		setTimeout(() => {
			this.tags.Data_PushSection1State = 1;
		}, 500);

		setTimeout(() => {
			this.tags.Data_PushSection1State = 2;
		}, 1000);

		setTimeout(() => {
			this.tags.Data_PushSection1State = 1;
		}, 1500);

		setTimeout(() => {
			this.tags.Data_PushSection1State = 0;
		}, 2000);
	},
	destroyed() {
		this.reset();
	},
};
</script>

<style scoped>
canvas {
	width: 100%;
	border: 1px solid black;
}
</style>
