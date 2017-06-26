"use strict";

// Load .env configuration.
require("dotenv").load();

const bodyParser = require("koa-bodyparser");
const bookshelf = require("./database");
const Koa = require("koa");
const opcua = require("./opcua");
const path = require("path");
const Router = require("koa-router");
const send = require("koa-send");
const serve = require("koa-static");
const websocket = require("koa-websocket");

const Component = require("./models/component");
const Data = require("./models/data");
const Device = require("./models/device");
const Screen = require("./models/screen");
const Tag = require("./models/tag");

process.on("exit", cleanup);
process.on("SIGINT", cleanup);

function cleanup() {
	opcua.stop();
	bookshelf.knex.destroy();

	// The server should never stop.
	process.exit(1);
}

opcua.start(process.env.OPC_URL);

const server = websocket(new Koa());
const wsRouter = new Router();
const router = new Router();

wsRouter.get("/tags", (ctx) => {
	opcua.addSocket(ctx.websocket);
});

router.get("/api/devices", async (ctx) => {
	let devices = (await Device.fetchAll()).toJSON();
	ctx.body = devices;
});

router.get("/api/devices/:id/screens", async (ctx) => {
	let screens = (await Screen.fetchAll({
		withRelated: ["components"],
	})).toJSON();

	ctx.body = screens;
});

router.put("/api/devices/:id/screens/:screen_id/components/:component_id", async (ctx) => {
	let model = await Component.where({
		id: ctx.params.component_id,
	}).fetch();

	if (model === null) {
		ctx.status = 500;
		ctx.body = "ERROR";
		return;
	}

	let component = {
		name: ctx.request.body.name,
	};

	delete ctx.request.body.id;
	delete ctx.request.body.screen_id;
	delete ctx.request.body.name;

	component.data = JSON.stringify(ctx.request.body);

	model.save(component, {
		patch: true,
	});

	ctx.status = 204;
});

router.get("/api/devices/:id/tags", async (ctx) => {
	let tags = await Tag.where({
		device_id: ctx.params.id,
	}).fetchAll();

	let data = tags.toJSON();

	for (let i = 0; i < data.length; i++) {
		// eslint-disable-next-line no-await-in-loop
		let value = await tags.models[i].data().orderBy("timestamp", "DESC").fetchOne();

		if (value !== null) {
			value = value.toJSON().value;
		}

		data[i].value = value;
	}

	ctx.body = data;
});

router.get("/api/devices/:id/tags/:tag_id", async (ctx) => {
	let tag = await Tag.where({
		id: ctx.params.tag_id,
		device_id: ctx.params.id,
	}).fetch();

	if (tag === null) {
		ctx.status = 500;
		ctx.body = "ERROR";
		return;
	}

	ctx.body = tag.toJSON();
});

router.put("/api/devices/:id/tags/:tag_id", async (ctx) => {
	let tag = await Tag.where({
		id: ctx.params.tag_id,
		device_id: ctx.params.id,
	}).fetch();

	if (tag === null) {
		ctx.status = 500;
		ctx.body = "ERROR";
		return;
	}

	if (typeof ctx.request.body.value !== "undefined") {
		// TODO: Does this trigger the subscription?
		await opcua.write(tag.get("node_id"), ctx.request.body.value);
	}

	if (typeof ctx.request.body.monitor !== "undefined") {
		await tag.save({
			monitor: ctx.request.body.monitor,
		});

		if (ctx.request.body.monitor === true) {
			await opcua.monitor(ctx.request.body);
		} else {
			opcua.terminate(ctx.request.body);
		}
	}

	ctx.status = 204;
});

router.get("/api/devices/:id/tags/:tag_id/history", async (ctx) => {
	// TODO: Only get those that belong to the specified device.
	let data = await Data.forge({
		tag_id: ctx.params.tag_id,
	}).orderBy("timestamp", "DESC").fetch();

	if (data === null) {
		ctx.status = 500;
		ctx.body = "ERROR";
		return;
	}

	ctx.body = data.toJSON();
});

router.get("/api/device/:id/browse/:path*", async (ctx) => {
	// TODO: Browse only the specified device.
	let nodePath = "/" + (ctx.params.path || "");
	ctx.body = await opcua.browsePath(nodePath);
});

router.get("/*", async (ctx) => {
	await send(ctx, "public/index.html");
});

server.use(serve(path.join(__dirname, "public")));
server.use(bodyParser());
server.ws.use(wsRouter.routes());
server.ws.use(wsRouter.allowedMethods());
server.use(router.routes());
server.use(router.allowedMethods());

server.listen(1107);
