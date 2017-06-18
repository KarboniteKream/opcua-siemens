<template>
<div class="home">
	<h1>{{ msg }}</h1>
</div>
</template>

<script>
export default {
	name: "home",
	data() {
		return {
			msg: "OPC UA",
		};
	},
};
</script>

<style scoped>
a {
	color: #42b983;
}
</style>
