<template>
	<svg class="chart" viewBox="0 0 700 350" preserveAspectRatio="xMidYMid meet"></svg>
</template>

<script>
import Vue from "vue";
import * as d3 from "d3";
import moment from "moment";

export default {
	name: "chart",
	props: ["data"],
	methods: {
		reformatData() {
			for (let datum of this.data) {
				if (datum.value === true || datum.value === false) {
					datum.value = datum.value ? 1 : 0;
				} else if (datum.value === "true" || datum.value === "false") {
					datum.value = datum.value === "true" ? 1 : 0;
				}
			}
		},
		renderChart() {
			d3.select(this.$el).selectAll("*").remove();

			this.reformatData();

			let margin = {
				top: 20,
				right: 20,
				bottom: 30,
				left: 50
			};

			let w = 700;
			let h = 350;

			let width = w - margin.left - margin.right;
			let height = h - margin.top - margin.bottom;

			let parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");

			let x = d3.scaleTime()
				.range([0, width])
				.domain(d3.extent(this.data, (d) => parseTime(d.timestamp)));

			let y = d3.scaleLinear()
				.range([height, 0])
				.domain([0, d3.max(this.data, (d) => d.value)]);

			let valueline = d3.line()
				.x((d) => x(parseTime(d.timestamp)))
				.y((d) => y(d.value));

			let svg = d3.select(this.$el)
				.attr("width", w)
				.attr("height", h)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			let d = svg.selectAll("path")
				.data([this.data]);

			d.enter().append("path")
				.merge(d)
				.attr("class", "line")
				.attr("d", valueline);

			svg.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));

			svg.append("g")
				.call(d3.axisLeft(y));
		},
	},
	mounted() {
		this.renderChart();
	},
	watch: {
		data: {
			handler: "renderChart",
			deep: true,
		},
	},
}
</script>

<style>
svg {
	width: 100%;
	height: 350px;
}

.chart .line {
	fill: none;
	stroke: steelblue;
	stroke-width: 2px;
}
</style>
