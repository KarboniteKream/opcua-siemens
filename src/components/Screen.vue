<template>
<div class="screen">
	<canvas id="canvas" width="1280" height="800"></canvas>
	<div class="editor row">
		<div class="components col-md-3">
			<h3>Components</h3>
			<ul v-if="activeComponent !== null">
				<li v-for="component in components" :key="component.id" :class="['pointer', component.id === activeComponent.id ? 'bold' : '']">
					<span @click="setActiveComponent(component.id)">{{ component.name }}</span> <span class="fa fa-trash pull-right" @click="deleteComponent(component.id)"></span>
				</li>
				<hr></hr>
				<span class="pointer" @click="newComponent">+ New component</span>
			</ul>
		</div>
		<div class="properties col-md-9">
			<div class="row" v-if="activeComponent !== null">
				<div class="col-sm-6">
					<h3>Properties</h3>
					<label>Name</label>
					<b-form-input type="text" v-model="activeComponent.name"></b-form-input>
					<label>Shape</label>
					<b-form-select v-model="activeComponent.shape" :options="shapes"></b-form-select>
					<template v-if="activeComponent.shape === 'triangle'">
						<label>Direction</label>
						<b-form-select v-model="activeComponent.direction" :options="directions"></b-form-select>
					</template>
					<label>Position</label>
					<div class="row">
						<b-input-group left="X" class="col-6">
							<b-form-input type="number" v-model="activeComponent.position.x"></b-form-input>
						</b-input-group>
						<b-input-group left="Y" class="col-6">
							<b-form-input type="number" v-model="activeComponent.position.y"></b-form-input>
						</b-input-group>
					</div>
					<label>Size</label>
					<div class="row">
						<template v-if="activeComponent.shape !== 'circle'">
							<b-input-group left="W" class="col-6">
								<b-form-input type="number" v-model="activeComponent.size.w"></b-form-input>
							</b-input-group>
							<b-input-group left="H" class="col-6">
								<b-form-input type="number" v-model="activeComponent.size.h"></b-form-input>
							</b-input-group>
						</template>
						<template v-if="activeComponent.shape === 'circle'">
							<b-input-group left="R" class="col-6">
								<b-form-input type="number" v-model="activeComponent.size.r"></b-form-input>
							</b-input-group>
						</template>
					</div>
				</div>
				<div class="col-sm-6">
					<h3>Attributes</h3>
					<div v-for="(attribute, aidx) in activeComponent.attributes" :key="aidx">
						<label>Type</label>
						<b-form-select v-model="attribute.type" :options="attributes"></b-form-select>
						<label>Value</label>
						<template v-if="attribute.type === 'color' || attribute.type === 'border'">
							<b-input-group left="RGB">
								<b-form-input type="text" v-model="attribute.value.RGB"></b-form-input>
							</b-input-group>
						</template>
						<template v-if="attribute.type === 'position'">
							<div class="row">
								<b-input-group left="X" class="col-6">
									<b-form-input type="number" v-model="attribute.value.x"></b-form-input>
								</b-input-group>
								<b-input-group left="Y" class="col-6">
									<b-form-input type="number" v-model="attribute.value.y"></b-form-input>
								</b-input-group>
							</div>
						</template>
						<template v-if="attribute.type === 'position'">
							<label>Delta</label>
							<div class="delta row">
								<b-input-group left="Tag" class="col-12">
									<b-form-input type="text" v-model="attribute.delta.tag"></b-form-input>
								</b-input-group>
								<b-input-group left="Start" class="col-6">
									<b-form-input type="number" v-model="attribute.delta.start"></b-form-input>
								</b-input-group>
								<b-input-group left="End" class="col-6">
									<b-form-input type="number" v-model="attribute.delta.end"></b-form-input>
								</b-input-group>
							</div>
						</template>
						<label>Conditions</label>
						<div class="condition row" v-for="(condition, cidx) in attribute.conditions" :key="cidx">
							<b-input-group left="Tag" class="col-12">
								<b-form-input type="text" v-model="condition.tag"></b-form-input>
							</b-input-group>
							<div class="col-12">
								<b-form-select class="comparator" v-model="condition.comparator" :options="comparators"></b-form-select>
							</div>
							<b-input-group left="Value" class="col-12">
								<b-form-input type="text" v-model="condition.value"></b-form-input>
							</b-input-group>
							<div class="remove col-12">
								<span class="block pointer" @click="deleteCondition(aidx, cidx)">&times; Remove condition</span>
							</div>
						</div>
						<span class="block pointer" @click="newCondition(aidx)">+ New condition</span>
						<label>Operator</label>
						<b-form-select class="operator" v-model="attribute.operator" :options="operators"></b-form-select>
						<span class="block pointer" @click="deleteAttribute(aidx)">&times; Remove attribute</span>
						<hr></hr>
					</div>
					<span class="pointer add-new" @click="newAttribute">+ New attribute</span>
				</div>
			</div>
			<b-button variant="primary" class="pointer" @click="saveComponent(activeComponent)">Save</b-button>
		</div>
	</div>
</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
	name: "screen",
	data() {
		return {
			shapes: {
				rectangle: "Rectangle",
				circle: "Circle",
				triangle: "Triangle",
			},
			directions: {
				up: "Up",
				down: "Down",
				left: "Left",
				right: "Right",
			},
			attributes: {
				color: "Color",
				position: "Position",
				border: "Border",
			},
			operators: [
				"AND",
				"OR",
			],
			comparators: [
				"===",
				"!==",
				">",
				"<",
				">=",
				"<=",
			],
			activeComponent: null,
		};
	},
	computed: {
		...mapGetters({
			tags: "namedTags",
			components: "components",
			active: "activeComponent",
			screens: "screens",
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
				ctx.strokeStyle = "#000000";

				let position = { ...component.position };
				let size = { ...component.size };
				let drawBorder = false;

				for (let attribute of (component.attributes || [])) {
					if (typeof attribute.operator === "undefined") {
						attribute.operator = "AND";
					}

					let enabled = attribute.operator === "AND";

					if (typeof attribute.conditions === "undefined" || attribute.conditions.length === 0) {
						enabled = true;
					}

					for (let condition of (attribute.conditions || [])) {
						let left = this.tags[condition.tag];
						let op = condition.comparator;
						let right = condition.value;

						if (attribute.operator === "AND" && this.evaluate(left, op, right) === false) {
							enabled = false;
							break;
						} else if (attribute.operator === "OR" && this.evaluate(left, op, right) === true) {
							enabled = true;
							break;
						}
					}

					if (enabled === false) {
						continue;
					}

					switch (attribute.type) {
						case "color":
							ctx.fillStyle = attribute.value.RGB;
							break;

						case "border":
							ctx.strokeStyle = attribute.value.RGB;
							drawBorder = true;
							break;

						case "position":
							if (typeof attribute.delta === "undefined" || attribute.delta.tag === "") {
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

				ctx.beginPath();

				switch (component.shape) {
					case "rectangle":
						ctx.rect(position.x, position.y, size.w, size.h);
						break;

					case "circle":
						ctx.arc(position.x + size.r, position.y + size.r, size.r, 2 * Math.PI, false);
						break;

					case "triangle":
						switch (component.direction) {
							case "up":
								ctx.moveTo(position.x, position.y + size.h);
								ctx.lineTo(position.x + (size.w / 2), position.y);
								ctx.lineTo(position.x + size.w, position.y + size.h);
								ctx.lineTo(position.x, position.y + size.h);
								break;

							case "down":
								ctx.moveTo(position.x, position.y);
								ctx.lineTo(position.x + size.w, position.y);
								ctx.lineTo(position.x + (size.w / 2), position.y + size.h);
								ctx.lineTo(position.x, position.y);
								break;

							case "left":
								ctx.moveTo(position.x, position.y + (size.h / 2));
								ctx.lineTo(position.x + size.w, position.y);
								ctx.lineTo(position.x + size.w, position.y + size.h);
								ctx.lineTo(position.x, position.y + (size.h / 2));
								break;

							case "right":
								ctx.moveTo(position.x, position.y);
								ctx.lineTo(position.x + size.w, position.y + (size.h / 2));
								ctx.lineTo(position.x, position.y + size.h);
								ctx.lineTo(position.x, position.y);
								break;
						}
						break;
				}

				ctx.fill();

				if (drawBorder === true) {
					ctx.stroke();
				}
			}
		},
		evaluate(left, op, right) {
			switch (op) {
				case "===": return left === right;
				case "!==": return left !== right;
				case "<":   return left < right;
				case ">":   return left > right;
				case "<=":  return left <= right;
				case ">=":  return left >= right;
			}
		},
		newComponent() {
			this.activeComponent = {
				id: null,
				screen_id: this.screens[0].id,
				name: "",
				shape: "rectangle",
				position: {
					x: null,
					y: null,
				},
				size: {
					w: null,
					h: null,
					r: null,
				},
				direction: null,
				attributes: [],
			};
		},
		newAttribute() {
			this.activeComponent.attributes.push({
				type: "color",
				value: {},
				conditions: [],
				operator: "AND",
			});
		},
		newCondition(attributeIdx) {
			this.activeComponent.attributes[attributeIdx].conditions.push({
				tag: "",
				comparator: "===",
				value: "",
			});
		},
		setActiveComponent(id) {
			this.setActive(id);
			this.activeComponent = JSON.parse(JSON.stringify(this.active));
		},
		deleteAttribute(idx) {
			this.activeComponent.attributes.splice(idx, 1);
		},
		deleteCondition(attributeIdx, conditionIdx) {
			this.activeComponent.attributes[attributeIdx].conditions.splice(conditionIdx, 1);
		},
		...mapActions({
			loadScreens: "loadScreens",
			setActive: "setActiveComponent",
			saveComponent: "saveComponent",
			deleteComponent: "deleteComponent",
		}),
	},
	async mounted() {
		await this.loadScreens();

		this.activeComponent = JSON.parse(JSON.stringify(this.active));

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
	margin-bottom: 30px;
}

.editor {
	margin-bottom: 50px;
}

.components h3 {
	margin-bottom: 20px;
}

.properties h3 {
	margin-bottom: 0px;
}

.properties .col-sm-6 {
	margin-bottom: 40px;
}

ul {
	padding-left: 0px;
	margin-bottom: 40px;
}

li {
	list-style: none;
}

label {
	margin-top: 20px;
}

button:focus {
	outline: none;
}

.add-new {
	display: inline-block;
	margin-top: 20px;
}

.delta .col-12,
.condition .col-12 {
	margin-bottom: 10px;
}

.condition .remove {
	margin-bottom: 25px;
}

span.pointer:hover {
	color: rgba(44, 62, 80, 0.65);
}

.block {
	display: block;
}

.operator {
	margin-bottom: 10px;
}

.comparator {
	width: 100%;
}

label {
	display: block;
}
</style>
