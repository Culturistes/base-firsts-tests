"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const colyseus_1 = require("colyseus");
const monitor_1 = require("@colyseus/monitor");
const OwnRoom_1 = __importDefault(require("./rooms/OwnRoom"));
const port = Number(process.env.PORT) || 2567;
const app = express_1.default();
app.use(cors_1.default());
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const gameServer = new colyseus_1.Server({
    server,
});
app.use('/colyseus', monitor_1.monitor());
gameServer.define("chat", OwnRoom_1.default);
gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
