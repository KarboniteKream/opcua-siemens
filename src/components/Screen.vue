<template>
<div class="screen">
	<canvas id="canvas" width="1280" height="800"></canvas>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "screen",
	computed: {
		...mapGetters({
			tags: "namedTags",
			components: "components",
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

			for (let component of this.components) {
				ctx.fillStyle = "#000000";

				let position = { ...component.position };
				let size = { ...component.size };

				for (let attribute of component.attributes) {
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

							position.x += (attribute.value.x - component.position.x) * delta;
							position.y += (attribute.value.y - component.position.y) * delta;

							break;
					}
				}

				switch (component.shape) {
					case "rectangle":
						ctx.fillRect(position.x, position.y, size.w, size.h);
						break;

					case "circle":
						ctx.beginPath();
						ctx.arc(position.x + size.r, position.y + size.r, size.r, 2 * Math.PI, false);
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
