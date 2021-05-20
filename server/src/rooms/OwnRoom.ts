import { MapSchema, ArraySchema } from "@colyseus/schema";
import { RoomState, Player, QuizRoundState, LmeRoundState, CocRoundState, MiniGameState, RoundState } from './schema/RoomStates';
import { Room, Client } from "colyseus";
import request from 'request';

export enum STEPS {
    GAME_PARAMETERS,
    MINI_GAME_TITLE,
    MINI_GAME_ROUND_TITLE,
    MINI_GAME_ROUND,
    MINI_GAME_ROUND_RESULT,
    MINI_GAME_RESULT,
    GAME_RESULT,
}

export default class OwnRoom extends Room<RoomState> {
    apiURL = "https://api.culturiste.remiruc.fr/api";
    currQuestion = "";

    onCreate(options: any) {
        console.log("room created:", this.roomId);
        this.setState(new RoomState);

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
        })
    }

    onJoin(client: Client, options: any) {
        console.log("Options:", options);
        console.log(client.sessionId, "joined!");

        let newPlayer = new Player({
            id: client.sessionId,
            username: options ? options.username : "Utilisateur",
            isMDR: options.creator
        })
        this.state.players.set(client.sessionId, newPlayer);

        client.send("serverPacket", { type: "playerInfos", datas: newPlayer });

        this.broadcast("serverPacket", { type: "playersList", datas: this.state.players });
    }

    async onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left, consented?:", consented);

        this.state.players.get(client.sessionId).connected = false;
        this.broadcast("serverPacket", { type: "playersList", datas: this.state.players });

        try {
            if (consented || !this.state.gameRunning) {
                throw new Error("consented leave");
            }

            // allow disconnected client to reconnect into this room until 120 seconds
            await this.allowReconnection(client, 120);

            // client returned! let's re-activate it.
            this.state.players.get(client.sessionId).connected = true;
            this.broadcast("serverPacket", { type: "playersList", datas: this.state.players });
        } catch (e) {
            // 20 seconds expired. let's remove the client.
            this.state.players.delete(client.sessionId);
            this.broadcast("serverPacket", { type: "playersList", datas: this.state.players });
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
        this.broadcast("serverPacket", { type: "playersList", datas: this.state.players });

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

            let question = this.state.minigames[this.state.parameters.currentMiniGame - 1].rounds[this.state.parameters.currentRound - 1];
            this.broadcast("serverPacket", { type: "minigame", datas: { type: question.type, content: question } });

            this.broadcast("serverPacket", { type: "canGoNext", datas: true });
            this.state.currentStep++;
            this.lock();
            this.broadcast("serverPacket", { type: "playersList", datas: this.state.players });

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
        this.broadcast("serverPacket", { type: "playersList", datas: this.state.players });

        if (this.state.currentStep == STEPS.MINI_GAME_ROUND) {
            console.log("packet:", packet)
            if (packet.datas.chosenAnswer != null) {
                this.state.players.get(client.sessionId).chosenAnswer = packet.datas.chosenAnswer;
            }
        }

        if (this.state.playersReady == this.state.players.size) {
            console.log("everyone's ready!")

            this.state.players.forEach(player => {
                player.isReady = false;
            })

            this.broadcast("serverPacket", { type: "playersList", datas: this.state.players });
            this.state.playersReady = 0;

            if (this.state.currentStep == STEPS.MINI_GAME_ROUND) {
                this.calculateScore();
            }

            if (this.state.currentStep == STEPS.MINI_GAME_ROUND_RESULT) {
                if (this.state.parameters.currentRound < this.state.parameters.roundNumber) {
                    console.log("Go next round")

                    this.state.parameters.currentRound++;
                    this.state.currentStep = STEPS.MINI_GAME_ROUND_TITLE

                    let question = this.state.minigames[this.state.parameters.currentMiniGame - 1].rounds[this.state.parameters.currentRound - 1];
                    this.broadcast("serverPacket", { type: "minigame", datas: { type: question.type, content: question } });

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

                    let question = this.state.minigames[this.state.parameters.currentMiniGame - 1].rounds[this.state.parameters.currentRound - 1];
                    this.broadcast("serverPacket", { type: "minigame", datas: { type: question.type, content: question } });

                    this.broadcast("serverPacket", { type: "goOnStep", datas: { step: this.state.currentStep + 1, minigame: this.state.parameters.currentMiniGame } });
                    return false;
                }
            }


            // Go next step for client and server
            this.broadcast("serverPacket", { type: "canGoNext", datas: true });
            this.state.currentStep++;
        }
    }

    generateQuestions() {
        return new Promise(async (resolve, rej) => {
            // quiz , lme, coc
            const gameTags = ['quiz', 'lme', 'coc'];
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

                    let rounds = new ArraySchema<RoundState>();

                    datas.forEach((data: any) => {
                        let round;
                        switch (type) {
                            case 'quiz':
                                round = new QuizRoundState()
                                round.type = type;
                                round.title = data.title;
                                round.answers = data.answers;
                                round.description = data.description;
                                break;
                            case 'lme':
                                round = new LmeRoundState()
                                round.type = type;
                                round.title = data.title;
                                round.answers = data.answers;
                                round.description = data.description;
                                break;
                            case 'coc':
                                round = new CocRoundState()
                                round.type = type;
                                round.name = data.name;
                                round.latitude = data.latitude;
                                round.longitude = data.longitude;
                                round.gentileM = data.gentileM
                                round.gentileF = data.gentileF
                                break;
                        }
                        rounds.push(round);
                    })

                    resolve(rounds)
                } else {
                    rej(err);
                }
            })
        })
    }

    // TODO: get user response broadcast message to receive make user send his response


    calculateScore() {
        this.state.players.forEach((player) => {
            // TODO
            /* if (player.chosenAnswer == this.state.roundParams.goodAnswer) {
                player.score += this.state.roundParams.answerPoints;
            } */
        })
        this.sortPlayers();
    }

    sortPlayers() {
        this.state.players = this.sortMapByValue([...this.state.players]);
        this.broadcast("serverPacket", { type: "playersList", datas: this.state.players });
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
}