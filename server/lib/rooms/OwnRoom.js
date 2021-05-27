"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STEPS = void 0;
const schema_1 = require("@colyseus/schema");
const RoomStates_1 = require("./schema/RoomStates");
const colyseus_1 = require("colyseus");
const request_1 = __importDefault(require("request"));
var STEPS;
(function (STEPS) {
    STEPS[STEPS["GAME_PARAMETERS"] = 0] = "GAME_PARAMETERS";
    STEPS[STEPS["MINI_GAME_TITLE"] = 1] = "MINI_GAME_TITLE";
    STEPS[STEPS["MINI_GAME_ROUND_TITLE"] = 2] = "MINI_GAME_ROUND_TITLE";
    STEPS[STEPS["MINI_GAME_ROUND"] = 3] = "MINI_GAME_ROUND";
    STEPS[STEPS["MINI_GAME_ROUND_RESULT"] = 4] = "MINI_GAME_ROUND_RESULT";
    STEPS[STEPS["MINI_GAME_RESULT"] = 5] = "MINI_GAME_RESULT";
    STEPS[STEPS["GAME_RESULT"] = 6] = "GAME_RESULT";
})(STEPS = exports.STEPS || (exports.STEPS = {}));
class OwnRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.apiURL = "https://api.culturiste.remiruc.fr/api";
        this.currQuestion = "";
    }
    onCreate(options) {
        console.log("room created:", this.roomId);
        this.setState(new RoomStates_1.RoomState);
        this.onMessage("clientPacket", (client, packet) => {
            console.log(`Received packet of type (${packet.type})`);
            switch (packet.type) {
                case "playerReadyToStart":
                    this.onPlayerReadyToStart(client, packet);
                    break;
                case "playerReadyForNext":
                    this.onPlayerReadyForNext(client, packet);
                    break;
                default:
                    break;
            }
        });
    }
    onJoin(client, options) {
        console.log("Options:", options);
        console.log(client.sessionId, "joined!");
        let newPlayer = new RoomStates_1.Player({
            id: client.sessionId,
            username: options ? options.username : "Utilisateur",
            isMDR: options.creator
        });
        this.state.players.set(client.sessionId, newPlayer);
        client.send("serverPacket", { type: "playerInfos", datas: newPlayer });
        this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
    }
    onLeave(client, consented) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(client.sessionId, "left, consented?:", consented);
            this.state.players.get(client.sessionId).connected = false;
            this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
            try {
                if (consented || !this.state.gameRunning) {
                    throw new Error("consented leave");
                }
                // allow disconnected client to reconnect into this room until 120 seconds
                yield this.allowReconnection(client, 120);
                // client returned! let's re-activate it.
                this.state.players.get(client.sessionId).connected = true;
                this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
            }
            catch (e) {
                // 20 seconds expired. let's remove the client.
                this.state.players.delete(client.sessionId);
                this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
            }
        });
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
    // onMessage functions
    onPlayerReadyToStart(client, packet) {
        return __awaiter(this, void 0, void 0, function* () {
            if (packet.datas.isReady == true) {
                this.state.playersReady++;
            }
            else if (packet.datas.isReady == false) {
                this.state.playersReady--;
            }
            this.state.players.get(client.sessionId).isReady = packet.datas.isReady;
            this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
            if (this.state.players.get(client.sessionId).isMDR && packet.datas.isReady) {
                console.log("he is MDR, save parameters");
                this.state.parameters.minigameNumber = packet.datas.params.minigameNumber;
                this.state.parameters.roundNumber = packet.datas.params.roundNumber;
                this.broadcast("serverPacket", { type: "chosenParams", datas: packet.datas.params });
            }
            if (this.state.playersReady == this.state.players.size) {
                console.log("everyone's ready, start the game!");
                this.state.players.forEach(player => {
                    player.isReady = false;
                });
                this.broadcast("serverPacket", { type: "loading", datas: true });
                // Wait for questions / games to load ? show wait screen ?
                yield this.generateQuestions();
                this.getCurrentRound();
                this.broadcast("serverPacket", { type: "canGoNext", datas: true });
                this.state.currentStep++;
                this.lock();
                this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
                this.state.playersReady = 0;
            }
        });
    }
    onPlayerReadyForNext(client, packet) {
        if (packet.datas.isReady == true) {
            if (!this.state.players.get(client.sessionId).isReady) {
                this.state.playersReady++;
            }
        }
        else if (packet.datas.isReady == false) {
            if (this.state.players.get(client.sessionId).isReady) {
                this.state.playersReady--;
            }
        }
        this.state.players.get(client.sessionId).isReady = packet.datas.isReady;
        this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
        if (this.state.currentStep == STEPS.MINI_GAME_ROUND) {
            console.log("client", client.sessionId, "packet:", packet);
            if (packet.datas.chosenAnswer != null) {
                this.state.players.get(client.sessionId).chosenAnswer = packet.datas.chosenAnswer;
            }
        }
        if (this.state.playersReady == this.state.players.size) {
            console.log("everyone's ready!");
            this.state.players.forEach(player => {
                player.isReady = false;
            });
            this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
            this.state.playersReady = 0;
            if (this.state.currentStep == STEPS.MINI_GAME_ROUND) {
                this.calculateScore();
            }
            if (this.state.currentStep == STEPS.MINI_GAME_ROUND_RESULT) {
                if (this.state.parameters.currentRound < this.state.parameters.roundNumber) {
                    console.log("Go next round");
                    this.state.parameters.currentRound++;
                    this.state.currentStep = STEPS.MINI_GAME_ROUND_TITLE;
                    this.getCurrentRound();
                    this.broadcast("serverPacket", { type: "goOnStep", datas: { step: this.state.currentStep + 1, round: this.state.parameters.currentRound } });
                    return false;
                }
            }
            if (this.state.currentStep == STEPS.MINI_GAME_RESULT) {
                if (this.state.parameters.currentMiniGame < this.state.parameters.minigameNumber) {
                    console.log("Go next mini game");
                    this.state.parameters.currentMiniGame++;
                    this.state.parameters.currentRound = 1;
                    this.state.currentStep = STEPS.MINI_GAME_TITLE;
                    this.getCurrentRound();
                    this.broadcast("serverPacket", { type: "goOnStep", datas: { step: this.state.currentStep + 1, minigame: this.state.parameters.currentMiniGame } });
                    return false;
                }
            }
            // Go next step for client and server
            this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
            this.broadcast("serverPacket", { type: "canGoNext", datas: true });
            this.state.currentStep++;
        }
    }
    generateQuestions() {
        return new Promise((resolve, rej) => __awaiter(this, void 0, void 0, function* () {
            // quiz , lme, coc
            const gameTags = ['coc', 'quiz', 'lme'];
            //gameTags.sort(() => Math.random() - 0.5); // => shuffle games for tests
            let minigames = new schema_1.ArraySchema();
            for (let i = 0; i < this.state.parameters.minigameNumber; i++) {
                let url = `${this.apiURL}/${gameTags[i]}/get?n=${this.state.parameters.roundNumber}`;
                let minigame = new RoomStates_1.MiniGameState();
                minigame.name = gameTags[i];
                let rounds = yield this.getQuestions(gameTags[i], url);
                // @ts-ignore: Unreachable code error
                minigame.rounds = rounds;
                minigames.push(minigame);
            }
            this.state.minigames = minigames;
            resolve(true);
        }));
    }
    getQuestions(type, url) {
        return new Promise((resolve, rej) => {
            request_1.default(url, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    let datas = JSON.parse(body);
                    let rounds = new schema_1.ArraySchema();
                    datas.forEach((data) => {
                        let round = new RoomStates_1.RoundState();
                        round.type = type;
                        switch (type) {
                            case 'quiz':
                                round.title = data.title;
                                round.answers = data.answers;
                                round.description = data.description;
                                data.answers.forEach((answer) => {
                                    if (answer.slice(0, 1) == "$") {
                                        round.goodAnswer = answer.slice(0, 1) == "$";
                                    }
                                });
                                break;
                            case 'lme':
                                round.title = data.title;
                                round.answers = data.answers;
                                round.description = data.description;
                                break;
                            case 'coc':
                                round.name = data.name;
                                round.latitude = data.latitude;
                                round.longitude = data.longitude;
                                round.gentileM = data.gentileM;
                                round.gentileF = data.gentileF;
                                break;
                        }
                        rounds.push(round);
                    });
                    resolve(rounds);
                }
                else {
                    console.log("err", res.statusCode, err);
                    rej(err);
                }
            });
        });
    }
    getCurrentRound() {
        let round = this.state.minigames[this.state.parameters.currentMiniGame - 1].rounds[this.state.parameters.currentRound - 1];
        this.state.currRoundParams = round;
        console.log(round.gentileM ? round.gentileM : "gentile null");
        this.broadcast("serverPacket", { type: "minigame", datas: { type: round.type, content: round } });
    }
    calculateScore() {
        console.log("calculating score...");
        let goodAnswer = {};
        switch (this.state.currRoundParams.type) {
            case 'quiz':
                this.state.players.forEach((player) => {
                    if (player.chosenAnswer.slice(0, 1) == "$") {
                        player.score += this.state.currRoundParams.answerPoints;
                    }
                });
                goodAnswer = {
                    content: [this.state.currRoundParams.goodAnswer]
                };
                break;
            case 'lme':
                let choices = [];
                this.state.players.forEach((player) => {
                    if (choices[player.chosenAnswer] == undefined) {
                        choices[player.chosenAnswer] = [];
                    }
                    choices[player.chosenAnswer].push(player);
                });
                if (choices[0] && choices[1] && choices[0].length == choices[1].length) {
                    this.state.players.forEach((player) => {
                        player.score += this.state.currRoundParams.answerPoints / 2;
                    });
                    goodAnswer = {
                        content: [this.state.currRoundParams.answers]
                    };
                }
                else {
                    let mostPicked = [];
                    choices.forEach(choice => {
                        if (mostPicked.length < choice.length) {
                            mostPicked = choice;
                        }
                    });
                    mostPicked.forEach(player => {
                        player.score += this.state.currRoundParams.answerPoints;
                    });
                    goodAnswer = {
                        content: [this.state.currRoundParams.answers[mostPicked[0].chosenAnswer]]
                    };
                }
                break;
            case 'coc':
                let players = this.sortPlayersByAnswers([...this.state.players]);
                let index = 0;
                players.forEach(player => {
                    let score = this.state.currRoundParams.answerPoints / (index + 1);
                    player.score += score;
                    if (player.chosenAnswer.gentile == this.state.currRoundParams.gentileM || player.chosenAnswer.gentile == this.state.currRoundParams.gentileF) {
                        player.score += this.state.currRoundParams.answerPoints / 2;
                    }
                    index++;
                });
                goodAnswer = {
                    gentileM: this.state.currRoundParams.gentileM,
                    gentileF: this.state.currRoundParams.gentileF,
                    latLng: [this.state.currRoundParams.latitude, this.state.currRoundParams.longitude]
                };
                break;
        }
        this.broadcast("serverPacket", { type: "goodAnswer", datas: goodAnswer });
        this.sortPlayers();
    }
    sortPlayers() {
        this.state.players = this.sortMapByValue([...this.state.players]);
        this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
    }
    sortMapByValue(map) {
        let tupleArray = [];
        for (let key in map)
            tupleArray.push([key, map[key]]);
        tupleArray.sort(function (a, b) {
            return b[1][1].score - a[1][1].score;
        });
        let sortedMap = new schema_1.MapSchema();
        tupleArray.forEach(function (el) {
            sortedMap.set(el[1][0], el[1][1]);
        });
        return sortedMap;
    }
    sortPlayersByAnswers(map) {
        let tupleArray = [];
        for (let key in map)
            tupleArray.push([key, map[key]]);
        tupleArray.sort(function (a, b) {
            return a[1][1].chosenAnswer.dist - b[1][1].chosenAnswer.dist;
        });
        let sortedMap = new schema_1.MapSchema();
        tupleArray.forEach(function (el) {
            sortedMap.set(el[1][0], el[1][1]);
        });
        return sortedMap;
    }
    mapToArray(map) {
        let newArray = [];
        map.forEach((item) => {
            newArray.push(item);
        });
        return newArray;
    }
}
exports.default = OwnRoom;
