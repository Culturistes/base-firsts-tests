import { MapSchema, ArraySchema } from "@colyseus/schema";
import { RoomState, MiniGameState, RoundState } from './schema/RoomStates';
import { Room, Client } from "colyseus";
import request from 'request';
import { ChosenAnswer, Joker, Player } from "./schema/PlayerState";

export enum STEPS {
    GAME_PARAMETERS,
    MINI_GAME_TITLE,
    MINI_GAME_ROUND,
    MINI_GAME_ROUND_RESULT,
    MINI_GAME_RESULT,
    GAME_RESULT,
}

export default class OwnRoom extends Room<RoomState> {
    apiURL = "https://api.culturiste.remiruc.fr/api";
    currQuestion = "";
    jokers = [
        { type: 'bonus', slug: "cdp", name: "Coup d'pouce" },
        { type: 'bonus', slug: "esp", name: "Espionnage" },
        { type: 'attaque', slug: "pjn", name: "Petit jaune" },
        { type: 'attaque', slug: "ral", name: "Ralentissement" }
    ]

    onCreate(options: any) {
        console.log("room created:", this.roomId);
        this.setState(new RoomState());

        this.onMessage("clientPacket", (client, packet) => {
            console.log(`Received packet of type (${packet.type})`);

            switch (packet.type) {
                case "playerReadyToStart":
                    this.onPlayerReadyToStart(client, packet);
                    break;
                case "playerReadyForNext":
                    this.onPlayerReadyForNext(client, packet);
                    break;
                case "useJoker":
                    if (this.state.players.get(client.sessionId).jokers.get(packet.datas).available) {
                        this.state.players.get(client.sessionId).jokers.get(packet.datas).available = false;

                        client.send("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });

                        switch (packet.datas) {
                            case 'cdp':
                                // Send to client ok ? datas ? ask with DA for jokers use
                                client.send("serverPacket", { type: "jokerUsed", datas: { type: "cdp" } })
                                break;
                            case 'esp':
                                // Send to client ok ? datas ? ask with DA for jokers use
                                client.send("serverPacket", { type: "jokerUsed", datas: { type: "esp" } })
                                break;
                            case 'pjn':
                                this.broadcast("serverPacket", {
                                    type: "jokerUsed",
                                    datas: {
                                        attacker: client.sessionId,
                                        type: "pjn"
                                    }
                                })
                                break;
                            case 'ral':
                                this.broadcast("serverPacket", {
                                    type: "jokerUsed",
                                    datas: {
                                        attacker: client.sessionId,
                                        type: "ral"
                                    }
                                })
                                break;
                        }
                    }

                    break;
                default:
                    break;
            }
        })
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");

        let jokers = new MapSchema<Joker>();
        this.jokers.forEach((jk) => {
            let joker = new Joker({
                type: jk.type,
                slug: jk.slug,
                name: jk.name
            });
            jokers.set(jk.slug, joker);
        })

        let newPlayer = new Player({
            id: client.sessionId,
            username: options ? options.username : "Utilisateur",
            isMDR: options.creator ? true : false,
            connected: true,
            jokers: jokers
        })
        this.state.players.set(client.sessionId, newPlayer);

        if (options.creator) {
            this.state.gameName = options.username
        }

        client.send("serverPacket", { type: "playerInfos", datas: { ...newPlayer } });

        this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
        this.broadcast("serverPacket", { type: "gameName", datas: this.state.gameName })
    }

    async onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left, consented?:", consented);

        this.state.players.get(client.sessionId).connected = false;
        this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });

        try {
            if (consented || !this.state.gameRunning) {
                throw new Error("consented leave");
            }

            // allow disconnected client to reconnect into this room until 120 seconds
            await this.allowReconnection(client, 120);

            // client returned! let's re-activate it.
            this.state.players.get(client.sessionId).connected = true;
            this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
        } catch (e) {
            // 20 seconds expired. let's remove the client.
            this.state.players.delete(client.sessionId);
            this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
        }
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

    // onMessage functions

    async onPlayerReadyToStart(client: any, packet: any) {
        if (packet.datas.isReady == true) {
            this.state.playersReady++;
        } else if (packet.datas.isReady == false) {
            this.state.playersReady--;
        }

        this.state.players.get(client.sessionId).isReady = packet.datas.isReady;
        this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });

        if (this.state.players.get(client.sessionId).isMDR && packet.datas.isReady) {
            console.log("he is MDR, save parameters");
            this.state.parameters.minigameNumber = packet.datas.params.minigameNumber;
            this.state.parameters.roundNumber = packet.datas.params.roundNumber;

            this.broadcast("serverPacket", { type: "chosenParams", datas: packet.datas.params })
        }

        if (this.state.playersReady == this.state.players.size) {
            console.log("everyone's ready, start the game!")

            this.state.players.forEach(player => {
                player.isReady = false;
            })

            this.broadcast("serverPacket", { type: "loading", datas: true });

            // Wait for questions / games to load ? show wait screen ?
            await this.generateQuestions();

            this.getCurrentRound();

            this.broadcast("serverPacket", { type: "canGoNext", datas: true });
            this.state.currentStep++;
            this.lock();
            this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });

            this.state.playersReady = 0;
        }
    }

    onPlayerReadyForNext(client: any, packet: any) {
        if (packet.datas.isReady == true) {
            if (!this.state.players.get(client.sessionId).isReady) {
                this.state.playersReady++;
            }
        } else if (packet.datas.isReady == false) {
            if (this.state.players.get(client.sessionId).isReady) {
                this.state.playersReady--;
            }
        }

        this.state.players.get(client.sessionId).isReady = packet.datas.isReady;
        this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });

        if (this.state.currentStep == STEPS.MINI_GAME_ROUND) {
            console.log("client", client.sessionId, "packet:", packet)
            if (packet.datas.chosenAnswer != null) {

                let newChosenAnswer = new ChosenAnswer();
                newChosenAnswer.selectedNAnswer = packet.datas.chosenAnswer.selectedNAnswer ? parseInt(packet.datas.chosenAnswer.selectedNAnswer) : newChosenAnswer.selectedNAnswer;
                newChosenAnswer.selectedSAnswer = packet.datas.chosenAnswer.selectedSAnswer ? packet.datas.chosenAnswer.selectedSAnswer : newChosenAnswer.selectedSAnswer;
                newChosenAnswer.dist = packet.datas.chosenAnswer.dist ? packet.datas.chosenAnswer.dist : newChosenAnswer.dist;
                newChosenAnswer.gentile = packet.datas.chosenAnswer.gentile ? packet.datas.chosenAnswer.gentile : newChosenAnswer.gentile;
                newChosenAnswer.latLng = packet.datas.chosenAnswer.latLng ? packet.datas.chosenAnswer.latLng : newChosenAnswer.latLng;

                this.state.players.get(client.sessionId).chosenAnswer = newChosenAnswer;

                this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
            }
        }

        if (this.state.playersReady == this.state.players.size) {
            console.log("=== everyone's ready!")

            this.state.players.forEach(player => {
                player.isReady = false;
            })

            this.state.playersReady = 0;

            if (this.state.currentStep == STEPS.MINI_GAME_ROUND) {
                this.calculateScore();
            }

            if (this.state.currentStep == STEPS.MINI_GAME_ROUND_RESULT) {
                if (this.state.parameters.currentRound < this.state.parameters.roundNumber) {
                    console.log("=== Go next round")

                    this.state.parameters.currentRound++;
                    this.state.currentStep = STEPS.MINI_GAME_ROUND

                    this.getCurrentRound();

                    this.state.players.forEach(player => {
                        player.chosenAnswer = null
                    })

                    this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
                    this.broadcast("serverPacket", { type: "goOnStep", datas: { step: this.state.currentStep + 1, round: this.state.parameters.currentRound } });
                    return false;
                }
            }
            if (this.state.currentStep == STEPS.MINI_GAME_RESULT) {
                if (this.state.parameters.currentMiniGame < this.state.parameters.minigameNumber) {
                    console.log("Go next mini game")

                    this.state.parameters.currentMiniGame++;
                    this.state.parameters.currentRound = 1;
                    this.state.currentStep = STEPS.MINI_GAME_TITLE

                    this.getCurrentRound();

                    this.state.players.forEach(player => {
                        player.chosenAnswer = null
                    })

                    this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
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
        return new Promise(async (resolve, rej) => {
            // quiz , lme, coc
            const gameTags = ['lme', 'coc', 'quiz'];

            //gameTags.sort(() => Math.random() - 0.5); // => shuffle games for tests
            let minigames = new ArraySchema<MiniGameState>();

            for (let i = 0; i < this.state.parameters.minigameNumber; i++) {
                let url = `${this.apiURL}/${gameTags[i]}/get?n=${this.state.parameters.roundNumber}`;

                let minigame = new MiniGameState();
                minigame.name = gameTags[i];
                let rounds = await this.getQuestions(gameTags[i], url);
                // @ts-ignore: Unreachable code error
                minigame.rounds = rounds;
                minigames.push(minigame);
            }

            this.state.minigames = minigames;
            resolve(true)
        })
    }

    getQuestions(type: string, url: string) {
        return new Promise((resolve, rej) => {
            request(url, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    let datas = JSON.parse(body);

                    let rounds = new ArraySchema();

                    datas.forEach((data: any) => {
                        let round = new RoundState()
                        round.type = type;

                        switch (type) {
                            case 'quiz':
                                round.title = data.title;
                                round.answers = data.answers;
                                round.description = data.description;

                                data.answers.forEach((answer: string) => {
                                    if (answer.slice(0, 1) == "$") {
                                        round.goodAnswer = { content: [answer] }
                                    }
                                })
                                break;
                            case 'lme':
                                round.title = data.title;
                                round.answers = data.answers;
                                round.description = data.description;
                                round.goodAnswer = { content: [] }
                                break;
                            case 'coc':
                                round.name = data.name;

                                round.goodAnswer = {
                                    content: [],
                                    gentileM: data.gentileM,
                                    gentileF: data.gentileF,
                                    latLng: [data.latitude, data.longitude]
                                }
                                break;
                        }
                        rounds.push(round);
                    })

                    resolve(rounds)
                } else {
                    console.log("err", err)
                    rej(err);
                }
            })
        })
    }

    getCurrentRound() {
        let round = this.state.minigames[this.state.parameters.currentMiniGame - 1].rounds[this.state.parameters.currentRound - 1];
        this.state.currRoundParams = round;
        this.broadcast("serverPacket", { type: "minigame", datas: { type: round.type, content: { ...round } } });
    }

    calculateScore() {
        let goodAnswer = {};

        switch (this.state.currRoundParams.type) {
            case 'quiz':
                this.state.players.forEach((player) => {
                    if (player.chosenAnswer.selectedSAnswer.slice(0, 1) == "$") {
                        player.score += this.state.currRoundParams.answerPoints;
                    }
                })
                break;
            case 'lme':
                let choices: Array<Array<Player>> = [];
                this.state.players.forEach((player) => {
                    if (choices[player.chosenAnswer.selectedNAnswer] == undefined) {
                        choices[player.chosenAnswer.selectedNAnswer] = [];
                    }
                    choices[player.chosenAnswer.selectedNAnswer].push(player);
                })
                if (choices[0] && choices[1] && choices[0].length == choices[1].length) {
                    this.state.players.forEach((player) => {
                        player.score += Math.round(this.state.currRoundParams.answerPoints / 2);
                    })
                    goodAnswer = {
                        content: this.state.currRoundParams.answers
                    };
                } else {
                    let mostPicked: Array<Player> = [];
                    choices.forEach(choice => {
                        if (mostPicked.length < choice.length) {
                            mostPicked = choice;
                        }
                    })
                    mostPicked.forEach(player => {
                        player.score += this.state.currRoundParams.answerPoints;
                    })
                    goodAnswer = {
                        content: [this.state.currRoundParams.answers[mostPicked[0].chosenAnswer.selectedNAnswer]]
                    };
                }
                this.broadcast("serverPacket", { type: "goodAnswer", datas: goodAnswer });

                break;
            case 'coc':
                let players = this.sortPlayersByAnswers([...this.state.players]);
                let index = 0;
                players.forEach(player => {
                    let score = Math.round(this.state.currRoundParams.answerPoints / (index + 1))
                    player.score += score;

                    if (player.chosenAnswer.gentile.toLowerCase() == this.state.currRoundParams.goodAnswer.gentileM.toLowerCase() || player.chosenAnswer.gentile.toLowerCase() == this.state.currRoundParams.goodAnswer.gentileF.toLowerCase()) {
                        player.score += Math.round(this.state.currRoundParams.answerPoints / 2);
                    }
                    index++;
                })
                break;
        }

        this.state.players = this.sortMapByValue([...this.state.players]);
    }

    sortMapByValue(map: any) {
        let tupleArray = [];
        for (let key in map) tupleArray.push([key, map[key]]);

        tupleArray.sort(function (a, b) {
            return b[1][1].score - a[1][1].score
        });

        let sortedMap: MapSchema<Player> = new MapSchema<Player>();
        tupleArray.forEach(function (el) {
            sortedMap.set(el[1][0], el[1][1]);
        });

        return sortedMap;
    }

    sortPlayersByAnswers(map: any) {
        let tupleArray = [];
        for (let key in map) tupleArray.push([key, map[key]]);

        tupleArray.sort(function (a, b) {
            return a[1][1].chosenAnswer.dist - b[1][1].chosenAnswer.dist
        });

        let sortedMap: MapSchema<Player> = new MapSchema<Player>();
        tupleArray.forEach(function (el) {
            sortedMap.set(el[1][0], el[1][1]);
        });

        return sortedMap;
    }

    mapToArray(map: any) {
        let newArray: Array<any> = [];

        map.forEach((item: any) => {
            newArray.push({ ...item });
        })

        return newArray;
    }
}