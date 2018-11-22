import Koa, { Context } from "koa";
import "dotenv/config";
import cors from "@koa/cors";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import session from "koa-session";
import config from './config';
import cassandra from 'cassandra-driver';
import { User } from './models/user.class';
import { IUser } from './interfaces/user.interface';
import { connectToVerneMQ, publish } from './lib/mqtt.lib';
import { chatRoomJob } from './lib/bull.lib';

connectToVerneMQ();

let client: cassandra.Client;

client = new cassandra.Client({ contactPoints: [config.docker_ip], keyspace: 'wolfchatter_keyspace', protocolOptions: { port: 9004 } });

client.connect(async (err) => {
    if (err)
        console.log(err);
    else
        console.log("Cassandra connected.");
});

const app = new Koa();

const publicRouter = new Router({
    prefix: '/api/v1'
});

const privateRouter = new Router({
    prefix: '/api/v1'
});

export const sessionCheck = async (ctx, next) => {
    if (ctx.session.userId && ctx.cookies.get("user_session"))
        await next();
    else
        return ctx.body = "invalid user or password.";
}

privateRouter.use(sessionCheck);

publicRouter.get('/', (ctx) => { ctx.body = { message: "It works!" }; });

publicRouter.get('/rooms', async (ctx) => {
    try {
        const query = 'Select * from user_rooms LIMIT 100';
        const result = await client.execute(query);
        return ctx.body = { code: 200, message: "all rooms.", data: result.rows };
    } catch {
        return ctx.body = { code: 401, message: "error" };
    }
});

publicRouter.post('/user/session', async (ctx) => {
    const body = ctx.request.body;
    let sess = ctx.session;
    const query = 'SELECT user_name, user_password, user_avatar, rooms FROM user_login WHERE user_name = ?';
    let user: IUser;

    try {
        const result = await client.execute(query, [body.user_name]);

        if (result.rowLength == 0) {
            user = new User(body);
            await user.generateHashPassword();

            const query = 'INSERT INTO user_login (user_name, user_password, user_avatar, rooms) VALUES (?, ?, ?, ?)';
            const params = [user.user_name, user.user_password, '', ['']];
            const result = await client.execute(query, params, { prepare: true });

            sess.userId = user.user_name;
            return ctx.body = { code: 200, message: "login, sucess", data: user };
        } else {
            user = new User(result.first() as IUser);
            const isMatch = await user.comparePassword(body.user_password);
            if (!isMatch) {
                return ctx.body = { code: 401, message: "Login error." };
            }

            sess.userId = user.user_name;
            return ctx.body = { code: 200, message: "login, sucess", data: user };
        }
    } catch (err) {
        return ctx.body = "error.";
    }
});

privateRouter.post('/create/room', async (ctx) => {
    const body = ctx.request.body;
    const user_name = ctx.session.userId;

    body.roomName = "Chatroom " + await chatRoomJob();

    try {
        let room_id = cassandra.types.Uuid.random();
        let query = 'INSERT INTO user_rooms (room_id, geo_location, room_name, room_owner) VALUES (?, ?, ?, ?)';
        let params = [room_id, body.roomLocation, body.roomName, user_name];
        let result = await client.execute(query, params, { prepare: true });

        query = `UPDATE user_login SET rooms = rooms + ['${room_id.toString()}'] WHERE user_name = ?`;
        params = [user_name];
        result = await client.execute(query, params, { prepare: true });

        let tableName = 'room_' + room_id.toString().replace(/-/g, "_");
        query = `CREATE TABLE ${tableName}(date_message timestamp PRIMARY KEY, user_name TEXT, message TEXT)`;
        result = await client.execute(query, { prepare: true });

        publish(`room/${room_id}`, { room_id: room_id, geo_location: body.roomLocation, room_name: body.roomName, room_owner: user_name });

        return ctx.body = { code: 200, message: "all done.", data: { room_id: room_id, room_name: body.roomName }};

    } catch (err) {
        return ctx.body = { code: 200, message: "error", error: err };
    }
});

privateRouter.del('/remove/room', async (ctx) => {
    const roomId = ctx.params.roomId;
    const user_name = ctx.session.userId;

    try {

    } catch (err) {
        return ctx.body = { code: 200, message: "error", error: err };
    }
});

privateRouter.post('/message/:roomId', async (ctx) => {
    const roomId = ctx.params.roomId;
    const user_name = ctx.session.userId;
    const body = ctx.request.body;

    try {
        let roomIdTable = 'room_' + roomId.replace(/-/g, "_");
        let query = `INSERT INTO ${roomIdTable}(date_message, user_name, message) VALUES (?, ?, ?)`;
        let params = [body.date, user_name, body.message];
        let result = await client.execute(query, params, { prepare: true });

        publish(`message/${roomId}`, { date_message: body.date, user_name: user_name, message: body.message });

        return ctx.body = { code: 200, message: "success" };
    } catch (err) {
        return ctx.body = { code: 401, message: "error", error: err };
    }
});

privateRouter.get('/messages/:roomId', async (ctx) => {
    const roomId = ctx.params.roomId;
    const user_name = ctx.session.userId;

    try {
        let roomIdTable = 'room_' + roomId.replace(/-/g, "_");
        const query = `Select * FROM ${roomIdTable} LIMIT 20`;
        const result = await client.execute(query);
        return ctx.body = { code: 200, message: "all rooms.", data: result.rows };
    } catch (err) {
        return ctx.body = { code: 401, message: "error", error: err };
    }
});

app.use(bodyParser({
    formLimit: '1mb'
}));

app.keys = ['Jbn6LfM:@a.u%})'];

const sessionConfig: Partial<session.opts> = {
    key: 'user_session',
    maxAge: "session" as "session",
    //rolling: true,
    renew: true
}

app.use(session(sessionConfig, app));

app.use(cors({
    credentials: true,
    origin: (ctx: Context) => {
        const requestOrigin = ctx.request.header.origin;
        if (!config.web_app_whitelist.includes(requestOrigin))
            return ctx.throw(400, `🙈 ${requestOrigin} is not a valid origin`);

        return requestOrigin;
    }
}));

app.use(publicRouter.routes())
    .use(publicRouter.allowedMethods())
    .use(privateRouter.routes())
    .use(privateRouter.allowedMethods())
    .listen(config.server_port);

console.log("NODE_ENV:", process.env.NODE_ENV || 'undefined, setting DEVELOPMENT.');