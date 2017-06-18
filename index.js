"use strict";

// Load .env configuration.
require("dotenv").load();

const bodyParser = require("koa-bodyparser");
const bookshelf = require("./database");
const Koa = require("koa");
const opcua = require("./opcua");
const path = require("path");
const Router = require("koa-router");
const serve = require("koa-static");

const Data = require("./models/data");
const Device = require("./models/device");
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

const server = new Koa();
const router = new Router();

router.get("/api/tags", async (ctx) => {
	let tags = (await Tag.fetchAll()).toJSON();
	ctx.body = tags;
});

router.get("/api/tags/:id", async (ctx) => {
	let tag = await Tag.forge({
		id: ctx.params.id,
	}).fetch();

	if (tag === null) {
		ctx.body = "ERROR";
		return;
	}

	ctx.body = tag.toJSON();
});

// TODO: read, data, history.

router.get("/api/tags/:id/data", async (ctx) => {
	let data = await Data.forge({
		tag_id: ctx.params.id,
	}).orderBy("timestamp", "DESC").fetch();

	if (data === null) {
		ctx.body = "ERROR";
		return;
	}

	ctx.body = data.toJSON();
});

router.get("/api/browse/:path?", async (ctx) => {
	let nodePath = "/" + (ctx.params.path || "");
	ctx.body = await opcua.browsePath(nodePath);
});

router.get("/api/devices", async (ctx) => {
	let devices = (await Device.fetchAll()).toJSON();
	ctx.body = devices;
});

server.use(bodyParser());
server.use(router.routes());
server.use(router.allowedMethods());
server.use(serve(path.join(__dirname, "public")));

server.listen(1107);
