"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomState = exports.MiniGameState = exports.RoundState = exports.Player = void 0;
const schema_1 = require("@colyseus/schema");
class Player extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.isReady = false;
        this.connected = false;
        this.score = 0;
    }
}
__decorate([
    schema_1.type("string")
], Player.prototype, "id", void 0);
__decorate([
    schema_1.type("string")
], Player.prototype, "username", void 0);
__decorate([
    schema_1.type("boolean")
], Player.prototype, "isMDR", void 0);
__decorate([
    schema_1.type("boolean")
], Player.prototype, "isReady", void 0);
__decorate([
    schema_1.type("boolean")
], Player.prototype, "connected", void 0);
__decorate([
    schema_1.type("number")
], Player.prototype, "score", void 0);
exports.Player = Player;
class Parameters extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.minigameNumber = 3;
        this.roundNumber = 2;
        this.currentMiniGame = 1;
        this.currentRound = 1;
    }
}
__decorate([
    schema_1.type("number")
], Parameters.prototype, "minigameNumber", void 0);
__decorate([
    schema_1.type("number")
], Parameters.prototype, "roundNumber", void 0);
__decorate([
    schema_1.type("number")
], Parameters.prototype, "currentMiniGame", void 0);
__decorate([
    schema_1.type("number")
], Parameters.prototype, "currentRound", void 0);
class RoundState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.answerPoints = 100;
        this.type = "";
        this.title = "";
        this.answers = new schema_1.ArraySchema();
        this.description = "";
    }
}
__decorate([
    schema_1.type("number")
], RoundState.prototype, "answerPoints", void 0);
__decorate([
    schema_1.type('string')
], RoundState.prototype, "type", void 0);
__decorate([
    schema_1.type("string")
], RoundState.prototype, "title", void 0);
__decorate([
    schema_1.type(["string"])
], RoundState.prototype, "answers", void 0);
__decorate([
    schema_1.type("string")
], RoundState.prototype, "description", void 0);
__decorate([
    schema_1.type("string")
], RoundState.prototype, "name", void 0);
__decorate([
    schema_1.type("number")
], RoundState.prototype, "latitude", void 0);
__decorate([
    schema_1.type("number")
], RoundState.prototype, "longitude", void 0);
__decorate([
    schema_1.type("string")
], RoundState.prototype, "gentileM", void 0);
__decorate([
    schema_1.type("string")
], RoundState.prototype, "gentileF", void 0);
exports.RoundState = RoundState;
class MiniGameState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.rounds = new schema_1.ArraySchema();
    }
}
__decorate([
    schema_1.type("string")
], MiniGameState.prototype, "name", void 0);
__decorate([
    schema_1.type([RoundState])
], MiniGameState.prototype, "rounds", void 0);
exports.MiniGameState = MiniGameState;
class RoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.gameRunning = false;
        this.parameters = new Parameters;
        this.currentStep = 0;
        this.players = new schema_1.MapSchema();
        this.playersReady = 0;
        // Array => minigame: array => round
        this.minigames = new schema_1.ArraySchema();
        this.currRoundParams = new RoundState;
    }
}
__decorate([
    schema_1.type('boolean')
], RoomState.prototype, "gameRunning", void 0);
__decorate([
    schema_1.type(Parameters)
], RoomState.prototype, "parameters", void 0);
__decorate([
    schema_1.type("number")
], RoomState.prototype, "currentStep", void 0);
__decorate([
    schema_1.type({ map: Player })
], RoomState.prototype, "players", void 0);
__decorate([
    schema_1.type('number')
], RoomState.prototype, "playersReady", void 0);
__decorate([
    schema_1.type([MiniGameState])
], RoomState.prototype, "minigames", void 0);
__decorate([
    schema_1.type(RoundState)
], RoomState.prototype, "currRoundParams", void 0);
exports.RoomState = RoomState;
