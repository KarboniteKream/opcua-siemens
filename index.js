"use strict";

// Load .env configuration.
require("dotenv").load();

const bcrypt = require("bcrypt");
const bluebird = require("bluebird");
const bodyParser = require("koa-bodyparser");
const bookshelf = require("./database");
const jwt = require("jsonwebtoken");
const Koa = require("koa");
const opcua = require("./opcua");
const path = require("path");
const Redis = require("redis");
const Router = require("koa-router");
const send = require("koa-send");
const serve = require("koa-static");
const websocket = require("koa-websocket");

bluebird.promisifyAll(Redis.RedisClient.prototype);

const redis = Redis.createClient();

const Component = require("./models/component");
const Data = require("./models/data");
const Device = require("./models/device");
const Group = require("./models/group");
const Screen = require("./models/screen");
const Tag = require("./models/tag");
const User = require("./models/user");

process.on("exit", cleanup);
process.on("SIGINT", cleanup);

function cleanup() {
	opcua.stop();
	bookshelf.knex.destroy();

	// The server should never stop.
	process.exit(1);
}

opcua.start();

const server = websocket(new Koa());

server.use(async (ctx, next) => {
	if (ctx.url.startsWith("/api/auth") === true) {
		return next();
	}

	if (typeof ctx.request.headers.authorization === "undefined") {
		ctx.status = 400;
		ctx.body = "No token provided.";
		return;
	}

	let token = ctx.request.headers.authorization.split(" ")[1];

	if (typeof token === "undefined") {
		ctx.status = 400;
		ctx.body = "No token provided.";
		return;
	}

	try {
		let decoded = jwt.verify(token, process.env.JWT_KEY);
		ctx.user = decoded;
		return next();
	} catch (err) {
		ctx.status = 401;
		ctx.body = "Invalid token.";
	}
});

const wsRouter = new Router();
const router = new Router();

wsRouter.get("/tags/:device_id", (ctx) => {
	opcua.addSocket(ctx.params.device_id, ctx.websocket);
});

router.post("/api/auth/login", async (ctx) => {
	let user = await User.where({
		email: ctx.request.body.email,
	}).fetch();

	if (user === null) {
		ctx.status = 401;
		ctx.body = "Incorrect email or password.";
		return;
	}

	user = user.toJSON();

	if (bcrypt.compareSync(ctx.request.body.password, user.password) === false) {
		ctx.status = 401;
		ctx.body = "Incorrect email or password.";
		return;
	}

	let accessToken = jwt.sign({
		id: user.id,
		type: "access",
	}, process.env.JWT_KEY, {
		expiresIn: "15 minutes",
	});

	let refreshToken = jwt.sign({
		id: user.id,
		type: "refresh",
	}, process.env.JWT_KEY, {
		expiresIn: "14 days",
	});

	redis.set(refreshToken, user.id);
	redis.expire(refreshToken, 14 * 24 * 60 * 60);

	ctx.body = {
		accessToken,
		refreshToken,
	};
});

router.post("/api/auth/refresh", async (ctx) => {
	let token = ctx.request.headers.authorization.split(" ")[1];

	if (typeof token === "undefined") {
		ctx.status = 400;
		ctx.body = "No token provided.";
		return;
	}

	try {
		let decoded = jwt.verify(token, process.env.JWT_KEY);

		if (decoded.type !== "refresh") {
			ctx.status = 400;
			ctx.body = "Invalid token.";
			return;
		}

		let result = await redis.existsAsync(token);

		if (result === 0) {
			ctx.status = 401;
			ctx.body = "This token has been revoked.";
		}

		let accessToken = jwt.sign({
			id: decoded.id,
			type: "access",
		}, process.env.JWT_KEY, {
			expiresIn: "15 minutes",
		});

		ctx.body = {
			accessToken,
		};
	} catch (err) {
		ctx.status = 400;
		ctx.body = "Invalid token.";
	}
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

router.post("/api/devices/:id/screens/:screen_id/components", async (ctx) => {
	let component = {
		name: ctx.request.body.name,
		screen_id: ctx.request.body.screen_id,
	};

	delete ctx.request.body.id;
	delete ctx.request.body.screen_id;
	delete ctx.request.body.name;

	component.data = JSON.stringify(ctx.request.body);

	let model = await Component.forge(component).save();

	ctx.status = 201;
	ctx.body = model.id;
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

router.delete("/api/devices/:id/screens/:screen_id/components/:component_id", async (ctx) => {
	await Component.forge({
		id: ctx.params.component_id,
	}).destroy();

	ctx.status = 204;
});

router.get("/api/devices/:id/groups", async (ctx) => {
	let groups = await Group.where({
		user_id: ctx.user.id,
		device_id: ctx.params.id,
	}).fetchAll({
		withRelated: {
			tags: (qb) => {
				qb.select("id");
			},
		},
	});

	ctx.body = groups.toJSON();
});

router.post("/api/devices/:id/groups", async (ctx) => {
	let group = await Group.forge({
		user_id: ctx.user.id,
		device_id: ctx.params.id,
		name: ctx.request.body.name,
	}).save();

	ctx.body = group.toJSON();
});

router.delete("/api/devices/:id/groups/:group_id", async (ctx) => {
	await Group.forge({
		id: ctx.params.group_id,
		device_id: ctx.params.id,
		user_id: ctx.user.id,
	}).destroy();

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
		await opcua.write(ctx.params.id, tag.get("node_id"), ctx.request.body.value);
	}

	if (typeof ctx.request.body.monitor !== "undefined") {
		await tag.save({
			monitor: ctx.request.body.monitor,
		});

		if (ctx.request.body.monitor === true) {
			await opcua.monitor(ctx.params.id, ctx.request.body);
		} else {
			opcua.terminate(ctx.params.id, ctx.request.body);
		}
	}

	ctx.status = 204;
});

router.get("/api/devices/:id/tags/:tag_id/history", async (ctx) => {
	// TODO: Only get those that belong to the specified device.
	let data = await Data.where({
		tag_id: ctx.params.tag_id,
	}).query((qb) => {
		qb.limit(10);
	}).orderBy("timestamp", "DESC").fetchAll();

	ctx.body = data.toJSON();
});

router.get("/api/device/:id/browse/:path*", async (ctx) => {
	let nodePath = "/" + (ctx.params.path || "");
	ctx.body = await opcua.browsePath(ctx.params.id, nodePath);
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

server.listen(1107, "0.0.0.0");
