import { MapSchema, ArraySchema } from "@colyseus/schema";
import { RoomState, MiniGameState, RoundState } from './schema/RoomStates';
import { Room, Client } from "colyseus";
import request from 'request';
import { AnswerRecord, ChosenAnswer, Joker, Player } from "./schema/PlayerState";

export enum STEPS {
    GAME_PARAMETERS,
    TUTORIAL,
    MINI_GAME_TITLE,
    MINI_GAME_ROUND,
    MINI_GAME_ROUND_RESULT,
    MINI_GAME_RESULT,
    GAME_RESULT,
}

export default class OwnRoom extends Room<RoomState> {
    LOBBY_CHANNEL = "$mylobby";
    apiURL = "https://api.culturiste.remiruc.fr/api";
    currQuestion = "";
    jokers = [
        { type: 'bonus', slug: "cdp", name: "Coup d'pouce" },
        { type: 'attaque', slug: "pjn", name: "Petit jaune" },
    ];
    minigameTimer = 20;
    gameTitleTimer = 20;
    timerEnded = false;
    minigamesOrder = ['lbf', 'quiz', 'coc', 'lme',];

    async onCreate(options: any) {
        this.roomId = await this.generateRoomId();
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
                    if (this.state.players.get(client.sessionId).jokers.get(packet.datas).available && this.state.currentStep == STEPS.MINI_GAME_ROUND) {
                        this.state.players.get(client.sessionId).jokers.get(packet.datas).available = false;

                        client.send("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });

                        switch (packet.datas) {
                            case 'cdp':
                                // Send to client ok ? datas ? ask with DA for jokers use
                                client.send("serverPacket", { type: "jokerUsed", datas: { type: "cdp" } })
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
                        }
                    }
                    break;
                case "STICKER":
                    this.broadcast("serverPacket", {
                        type: "STICKER",
                        datas: packet.datas
                    })
                    break;
                case "gameMode":
                    this.state.parameters.minigameNumber = packet.datas.params.minigameNumber;
                    this.state.parameters.roundNumber = packet.datas.params.roundNumber;
                    this.state.parameters.gamemode = packet.datas.params.gamemode;

                    this.broadcast("serverPacket", { type: "chosenParams", datas: packet.datas.params })
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
                name: jk.name,
                available: true,
                isUsed: false
            });
            jokers.set(jk.slug, joker);
        })

        let newPlayer = new Player({
            id: client.sessionId,
            username: options ? options.username : "Utilisateur",
            isMDR: options.creator ? true : false,
            avatarURL: options.avatarURL ? options.avatarURL : "",
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
        this.broadcast("serverPacket", {
            type: "chosenParams", datas: {
                minigameNumber: this.state.parameters.minigameNumber,
                roundNumber: this.state.parameters.roundNumber,
                gamemode: this.state.parameters.gamemode,
            }
        })
    }

    async onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left, consented?:", consented);

        if (this.state.playersReady > 0) {
            this.state.playersReady--;
        }

        this.state.players.get(client.sessionId).isReady = false;
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

    async onDispose() {
        this.presence.srem(this.LOBBY_CHANNEL, this.roomId);
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

        if (this.state.currentStep == STEPS.MINI_GAME_ROUND && this.state.playersCanAnswer) {
            console.log("client", client.sessionId, "packet:", packet)
            if (packet.datas.chosenAnswer != null) {
                let newChosenAnswer = new ChosenAnswer();
                if (this.state.players.get(client.sessionId).playerAnswerRank == 100) {
                    this.state.players.get(client.sessionId).playerAnswerRank = this.state.playersReady;
                }
                newChosenAnswer.selectedNAnswer = packet.datas.chosenAnswer.selectedNAnswer != null ? parseInt(packet.datas.chosenAnswer.selectedNAnswer) : newChosenAnswer.selectedNAnswer;
                newChosenAnswer.selectedSAnswer = packet.datas.chosenAnswer.selectedSAnswer ? packet.datas.chosenAnswer.selectedSAnswer : newChosenAnswer.selectedSAnswer;
                newChosenAnswer.dist = packet.datas.chosenAnswer.dist ? packet.datas.chosenAnswer.dist : newChosenAnswer.dist;
                newChosenAnswer.gentile = packet.datas.chosenAnswer.gentile ? packet.datas.chosenAnswer.gentile : newChosenAnswer.gentile;
                newChosenAnswer.latLng = packet.datas.chosenAnswer.latLng ? packet.datas.chosenAnswer.latLng : newChosenAnswer.latLng;
                newChosenAnswer.recette = packet.datas.chosenAnswer.recette ? packet.datas.chosenAnswer.recette : newChosenAnswer.recette;

                this.state.players.get(client.sessionId).chosenAnswer = newChosenAnswer;

                this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });

                if (packet.datas.chosenAnswer.recette) {
                    this.state.playersCanAnswer = false;
                    this.clock.clear();
                    this.state.currentTimer = this.minigameTimer;
                    this.mustEndTheRound();
                }
            }
        }

        if (this.state.playersReady == this.state.players.size) {
            console.log("=== everyone's ready!")



            this.clock.clear();
            this.state.currentTimer = this.minigameTimer;

            this.mustEndTheRound();
        }
    }

    mustEndTheRound() {
        this.state.players.forEach(player => {
            player.isReady = false;
        })

        this.state.playersReady = 0;

        if (this.state.currentStep == STEPS.MINI_GAME_ROUND) {
            this.calculateScore();
            this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });
            this.state.players.forEach(player => {
                player.playerAnswerRank = 100;
            })
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

                this.broadcast("serverPacket", { type: "goOnStep", datas: { step: this.state.currentStep + 1, round: this.state.parameters.currentRound } });
                this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });

                this.startTimer();
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
                    player.answersRecord = new Array<AnswerRecord>();
                })

                this.broadcast("serverPacket", { type: "goOnStep", datas: { step: this.state.currentStep + 1, minigame: this.state.parameters.currentMiniGame } });
                this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });

                this.startTimer();
                return false;
            }
        }


        // Go next step for client and server
        this.broadcast("serverPacket", { type: "canGoNext", datas: true });
        this.broadcast("serverPacket", { type: "playersList", datas: this.mapToArray(this.state.players) });

        this.state.currentStep++;
        this.startTimer();
    }

    startTimer() {
        if (this.state.currentStep == STEPS.MINI_GAME_ROUND) {
            this.clock.start();
            if (this.state.currRoundParams.type == "lbf") {
                this.state.currentTimer = 60;
            } else {
                this.state.currentTimer = this.minigameTimer;
            }
            if (this.state.currentStep == STEPS.MINI_GAME_ROUND) {
                this.state.playersCanAnswer = true;
            }
            this.clock.setInterval(() => {
                if (this.state.currentTimer <= 0) {
                    this.state.playersCanAnswer = false;
                    this.clock.clear();
                    this.state.currentTimer = this.minigameTimer;
                    this.mustEndTheRound();
                } else {
                    this.state.currentTimer -= 0.1;
                }
            }, 100)
        } else if (this.state.currentStep == STEPS.MINI_GAME_TITLE) {
            console.log("START TIMER FOR TITLE")
            this.clock.start();
            this.state.currentTimer = 0;
            this.clock.setInterval(() => {
                if (this.state.currentTimer >= this.gameTitleTimer) {
                    this.state.playersCanAnswer = false;
                    this.clock.clear();
                    this.state.currentTimer = this.minigameTimer;
                    this.mustEndTheRound();
                } else {
                    this.state.currentTimer += 0.1;
                }
            }, 100)
        }
    }

    generateQuestions() {
        return new Promise(async (resolve, rej) => {

            //this.minigamesOrder.sort(() => Math.random() - 0.5); // => shuffle games for tests
            let minigames = new ArraySchema<MiniGameState>();

            for (let i = 0; i < this.state.parameters.minigameNumber; i++) {
                let url = `${this.apiURL}/${this.minigamesOrder[i]}/get?n=${this.state.parameters.roundNumber}`;

                let minigame = new MiniGameState();
                minigame.name = this.minigamesOrder[i];
                let rounds = await this.getQuestions(this.minigamesOrder[i], url);
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
                            case 'lbf':
                                round.name = data.name;

                                round.goodAnswer = {
                                    content: [],
                                    recette: {
                                        possibleIngredients: data.possibleIngredients,
                                        ingredients: data.ingredients
                                    }
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
        console.log("Caculating score")
        let goodAnswer = {};

        this.state.players.forEach((player) => {
            let record = new AnswerRecord();
            record.isGood = false;
            player.answersRecord[this.state.parameters.currentRound] = record;
            this.addScoreToPlayer(player, 0)
        })

        switch (this.state.currRoundParams.type) {
            case 'quiz':
                let playersGoodAnswers: Array<Player> = [];
                this.state.players.forEach((player) => {
                    if (player.chosenAnswer != null) {
                        if (player.chosenAnswer.selectedSAnswer.slice(0, 1) == "$") {
                            playersGoodAnswers.push(player);
                        }
                    }
                })
                let newList = this.sortMapByRank([...playersGoodAnswers]);
                let indx = 0;
                newList.forEach((player: any) => {
                    if (player.chosenAnswer != null) {
                        if (player.chosenAnswer.selectedSAnswer.slice(0, 1) == "$") {
                            let score = Math.round(this.state.currRoundParams.answerPoints / (indx + 1))
                            let record = new AnswerRecord();
                            record.isGood = true;
                            player.answersRecord[this.state.parameters.currentRound] = record;
                            this.addScoreToPlayer(player, score);
                            indx++;
                        }
                    }
                })
                break;
            case 'lme':
                let choices: Array<Array<Player>> = [];
                this.state.players.forEach((player) => {
                    if (player.chosenAnswer != null) {
                        if (choices[player.chosenAnswer.selectedNAnswer] == undefined) {
                            choices[player.chosenAnswer.selectedNAnswer] = [];
                        }
                        choices[player.chosenAnswer.selectedNAnswer].push(player);
                    }
                })
                if (choices[0] && choices[1] && choices[0].length == choices[1].length) {
                    this.state.players.forEach((player) => {
                        if (player.chosenAnswer != null) {
                            let record = new AnswerRecord();
                            record.isGood = true;
                            player.answersRecord[this.state.parameters.currentRound] = record;
                            this.addScoreToPlayer(player, Math.round(this.state.currRoundParams.answerPoints / 2))
                        }
                    })
                    goodAnswer = {
                        content: [
                            { id: 0, answer: this.state.currRoundParams.answers[0], number: choices[0].length },
                            { id: 1, answer: this.state.currRoundParams.answers[0], number: choices[1].length }
                        ]
                    };
                } else if (choices.length > 0) {
                    let mostPicked: Array<Player> = [];
                    let minPicked: number = 0;

                    if (choices[0] != undefined && choices[1] != undefined) {
                        if (choices[0].length > choices[1].length) {
                            mostPicked = choices[0];
                            minPicked = choices[1].length;
                        } else {
                            mostPicked = choices[1];
                            minPicked = choices[0].length;
                        }
                    } else if (choices[0] != undefined && choices[1] == undefined) {
                        mostPicked = choices[0];
                    } else if (choices[0] == undefined && choices[1] != undefined) {
                        mostPicked = choices[1];
                    }

                    console.log(mostPicked.length)

                    let mostPickedSorted: MapSchema<Player> = this.sortMapByRank([...mostPicked]);
                    let index3 = 0
                    mostPickedSorted.forEach(player => {
                        let score = Math.round(this.state.currRoundParams.answerPoints / (index3 + 1))
                        let record = new AnswerRecord();
                        record.isGood = true;
                        player.answersRecord[this.state.parameters.currentRound] = record;
                        this.addScoreToPlayer(player, score);
                        index3++;
                    })
                    goodAnswer = {
                        content: [
                            { id: mostPicked[0].chosenAnswer.selectedNAnswer, answer: this.state.currRoundParams.answers[mostPicked[0].chosenAnswer.selectedNAnswer], numbers: [mostPicked.length, minPicked] }
                        ]
                    };
                } else {
                    goodAnswer = {
                        content: []
                    };
                }
                this.broadcast("serverPacket", { type: "goodAnswer", datas: goodAnswer });

                break;
            case 'coc':
                let players = this.sortPlayersByMapDist([...this.state.players]);
                let index = 0;
                players.forEach(player => {
                    if (player.chosenAnswer != null && player.chosenAnswer.dist != null) {
                        let score = Math.round(this.state.currRoundParams.answerPoints / (index + 1))
                        this.addScoreToPlayer(player, score)

                        if (player.chosenAnswer.gentile.toLowerCase() == this.state.currRoundParams.goodAnswer.gentileM.toLowerCase() || player.chosenAnswer.gentile.toLowerCase() == this.state.currRoundParams.goodAnswer.gentileF.toLowerCase()) {
                            this.addScoreToPlayer(player, Math.round(this.state.currRoundParams.answerPoints / 2))
                        }

                        let record = new AnswerRecord();
                        record.isGood = true;
                        player.answersRecord[this.state.parameters.currentRound] = record;
                        index++;
                    }
                })
                break;
            case 'lbf':
                this.state.players.forEach((player) => {
                    if (player.chosenAnswer != null && player.chosenAnswer.recette) {
                        let record = new AnswerRecord();
                        record.isGood = true;
                        player.answersRecord[this.state.parameters.currentRound] = record;
                        this.addScoreToPlayer(player, this.state.currRoundParams.answerPoints)
                    }
                })
                break;
        }
        this.state.players = this.sortMapByValue([...this.state.players]);
    }

    addScoreToPlayer(player: Player, score: number) {
        player.lastScore = player.score;
        player.score += score;
        player.scoreWon = score;
        player.hasWonScore = true;
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

    sortMapByRank(map: any) {
        if (map.length <= 1) {
            return map;
        }
        let tupleArray = [];
        for (let key in map) tupleArray.push([key, map[key]]);

        tupleArray.sort(function (a, b) {
            if (b == undefined) {
                return -1
            } else if (a == undefined) {
                return 1;
            } else {
                return a[1].playerAnswerRank - b[1].playerAnswerRank
            }
        });

        let sortedMap: MapSchema<Player> = new MapSchema<Player>();
        tupleArray.forEach(function (el) {
            sortedMap.set(el[0], el[1]);
        });

        return sortedMap;
    }

    sortPlayersByMapDist(map: any) {
        let tupleArray = [];
        for (let key in map) tupleArray.push([key, map[key]]);

        tupleArray.sort(function (a, b) {
            if (a[1][1].chosenAnswer == null && b[1][1].chosenAnswer == null) {
                return 0
            } else if (a[1][1].chosenAnswer == null && b[1][1].chosenAnswer != null) {
                return 4000 - b[1][1].chosenAnswer.dist
            } else if (a[1][1].chosenAnswer != null && b[1][1].chosenAnswer == null) {
                return a[1][1].chosenAnswer.dist - 4000
            } else {
                return a[1][1].chosenAnswer.dist - b[1][1].chosenAnswer.dist
            }
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

    getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    generateName() {
        let name1 = ["abandoned", "able", "absolute", "adorable", "adventurous", "academic", "acceptable", "acclaimed", "accomplished", "accurate", "aching", "acidic", "acrobatic", "active", "actual", "adept", "admirable", "admired", "adolescent", "adorable", "adored", "advanced", "afraid", "affectionate", "aged", "aggravating", "aggressive", "agile", "agitated", "agonizing", "agreeable", "ajar", "alarmed", "alarming", "alert", "alienated", "alive", "all", "altruistic", "amazing", "ambitious", "ample", "amused", "amusing", "anchored", "ancient", "angelic", "angry", "anguished", "animated", "annual", "another", "antique", "anxious", "any", "apprehensive", "appropriate", "apt", "arctic", "arid", "aromatic", "artistic", "ashamed", "assured", "astonishing", "athletic", "attached", "attentive", "attractive", "austere", "authentic", "authorized", "automatic", "avaricious", "average", "aware", "awesome", "awful", "awkward", "babyish", "bad", "back", "baggy", "bare", "barren", "basic", "beautiful", "belated", "beloved", "beneficial", "better", "best", "bewitched", "big", "big-hearted", "biodegradable", "bite-sized", "bitter", "black", "black-and-white", "bland", "blank", "blaring", "bleak", "blind", "blissful", "blond", "blue", "blushing", "bogus", "boiling", "bold", "bony", "boring", "bossy", "both", "bouncy", "bountiful", "bowed", "brave", "breakable", "brief", "bright", "brilliant", "brisk", "broken", "bronze", "brown", "bruised", "bubbly", "bulky", "bumpy", "buoyant", "burdensome", "burly", "bustling", "busy", "buttery", "buzzing", "calculating", "calm", "candid", "canine", "capital", "carefree", "careful", "careless", "caring", "cautious", "cavernous", "celebrated", "charming", "cheap", "cheerful", "cheery", "chief", "chilly", "chubby", "circular", "classic", "clean", "clear", "clear-cut", "clever", "close", "closed", "cloudy", "clueless", "clumsy", "cluttered", "coarse", "cold", "colorful", "colorless", "colossal", "comfortable", "common", "compassionate", "competent", "complete", "complex", "complicated", "composed", "concerned", "concrete", "confused", "conscious", "considerate", "constant", "content", "conventional", "cooked", "cool", "cooperative", "coordinated", "corny", "corrupt", "costly", "courageous", "courteous", "crafty", "crazy", "creamy", "creative", "creepy", "criminal", "crisp", "critical", "crooked", "crowded", "cruel", "crushing", "cuddly", "cultivated", "cultured", "cumbersome", "curly", "curvy", "cute", "cylindrical", "damaged", "damp", "dangerous", "dapper", "daring", "darling", "dark", "dazzling", "dead", "deadly", "deafening", "dear", "dearest", "decent", "decimal", "decisive", "deep", "defenseless", "defensive", "defiant", "deficient", "definite", "definitive", "delayed", "delectable", "delicious", "delightful", "delirious", "demanding", "dense", "dental", "dependable", "dependent", "descriptive", "deserted", "detailed", "determined", "devoted", "different", "difficult", "digital", "diligent", "dim", "dimpled", "dimwitted", "direct", "disastrous", "discrete", "disfigured", "disgusting", "disloyal", "dismal", "distant", "downright", "dreary", "dirty", "disguised", "dishonest", "dismal", "distant", "distinct", "distorted", "dizzy", "dopey", "doting", "double", "downright", "drab", "drafty", "dramatic", "dreary", "droopy", "dry", "dual", "dull", "dutiful", "each", "eager", "earnest", "early", "easy", "easy-going", "ecstatic", "edible", "educated", "elaborate", "elastic", "elated", "elderly", "electric", "elegant", "elementary", "elliptical", "embarrassed", "embellished", "eminent", "emotional", "empty", "enchanted", "enchanting", "energetic", "enlightened", "enormous", "enraged", "entire", "envious", "equal", "equatorial", "essential", "esteemed", "ethical", "euphoric", "even", "evergreen", "everlasting", "every", "evil", "exalted", "excellent", "exemplary", "exhausted", "excitable", "excited", "exciting", "exotic", "expensive", "experienced", "expert", "extraneous", "extroverted", "extra-large", "extra-small", "fabulous", "failing", "faint", "fair", "faithful", "fake", "false", "familiar", "famous", "fancy", "fantastic", "far", "faraway", "far-flung", "far-off", "fast", "fat", "fatal", "fatherly", "favorable", "favorite", "fearful", "fearless", "feisty", "feline", "female", "feminine", "few", "fickle", "filthy", "fine", "finished", "firm", "first", "firsthand", "fitting", "fixed", "flaky", "flamboyant", "flashy", "flat", "flawed", "flawless", "flickering", "flimsy", "flippant", "flowery", "fluffy", "fluid", "flustered", "focused", "fond", "foolhardy", "foolish", "forceful", "forked", "formal", "forsaken", "forthright", "fortunate", "fragrant", "frail", "frank", "frayed", "free", "French", "fresh", "frequent", "friendly", "frightened", "frightening", "frigid", "frilly", "frizzy", "frivolous", "front", "frosty", "frozen", "frugal", "fruitful", "full", "fumbling", "functional", "funny", "fussy", "fuzzy", "gargantuan", "gaseous", "general", "generous", "gentle", "genuine", "giant", "giddy", "gigantic", "gifted", "giving", "glamorous", "glaring", "glass", "gleaming", "gleeful", "glistening", "glittering", "gloomy", "glorious", "glossy", "glum", "golden", "good", "good-natured", "gorgeous", "graceful", "gracious", "grand", "grandiose", "granular", "grateful", "grave", "gray", "great", "greedy", "green", "gregarious", "grim", "grimy", "gripping", "grizzled", "gross", "grotesque", "grouchy", "grounded", "growing", "growling", "grown", "grubby", "gruesome", "grumpy", "guilty", "gullible", "gummy", "hairy", "half", "handmade", "handsome", "handy", "happy", "happy-go-lucky", "hard", "hard-to-find", "harmful", "harmless", "harmonious", "harsh", "hasty", "hateful", "haunting", "healthy", "heartfelt", "hearty", "heavenly", "heavy", "hefty", "helpful", "helpless", "hidden", "hideous", "high", "high-level", "hilarious", "hoarse", "hollow", "homely", "honest", "honorable", "honored", "hopeful", "horrible", "hospitable", "hot", "huge", "humble", "humiliating", "humming", "humongous", "hungry", "hurtful", "husky", "icky", "icy", "ideal", "idealistic", "identical", "idle", "idiotic", "idolized", "ignorant", "ill", "illegal", "ill-fated", "ill-informed", "illiterate", "illustrious", "imaginary", "imaginative", "immaculate", "immaterial", "immediate", "immense", "impassioned", "impeccable", "impartial", "imperfect", "imperturbable", "impish", "impolite", "important", "impossible", "impractical", "impressionable", "impressive", "improbable", "impure", "inborn", "incomparable", "incompatible", "incomplete", "inconsequential", "incredible", "indelible", "inexperienced", "indolent", "infamous", "infantile", "infatuated", "inferior", "infinite", "informal", "innocent", "insecure", "insidious", "insignificant", "insistent", "instructive", "insubstantial", "intelligent", "intent", "intentional", "interesting", "internal", "international", "intrepid", "ironclad", "irresponsible", "irritating", "itchy", "jaded", "jagged", "jam-packed", "jaunty", "jealous", "jittery", "joint", "jolly", "jovial", "joyful", "joyous", "jubilant", "judicious", "juicy", "jumbo", "junior", "jumpy", "juvenile", "kaleidoscopic", "keen", "key", "kind", "kindhearted", "kindly", "klutzy", "knobby", "knotty", "knowledgeable", "knowing", "known", "kooky", "kosher", "lame", "lanky", "large", "last", "lasting", "late", "lavish", "lawful", "lazy", "leading", "lean", "leafy", "left", "legal", "legitimate", "light", "lighthearted", "likable", "likely", "limited", "limp", "limping", "linear", "lined", "liquid", "little", "live", "lively", "livid", "loathsome", "lone", "lonely", "long", "long-term", "loose", "lopsided", "lost", "loud", "lovable", "lovely", "loving", "low", "loyal", "lucky", "lumbering", "luminous", "lumpy", "lustrous", "luxurious", "mad", "made-up", "magnificent", "majestic", "major", "male", "mammoth", "married", "marvelous", "masculine", "massive", "mature", "meager", "mealy", "mean", "measly", "meaty", "medical", "mediocre", "medium", "meek", "mellow", "melodic", "memorable", "menacing", "merry", "messy", "metallic", "mild", "milky", "mindless", "miniature", "minor", "minty", "miserable", "miserly", "misguided", "misty", "mixed", "modern", "modest", "moist", "monstrous", "monthly", "monumental", "moral", "mortified", "motherly", "motionless", "mountainous", "muddy", "muffled", "multicolored", "mundane", "murky", "mushy", "musty", "muted", "mysterious", "naive", "narrow", "nasty", "natural", "naughty", "nautical", "near", "neat", "necessary", "needy", "negative", "neglected", "negligible", "neighboring", "nervous", "new", "next", "nice", "nifty", "nimble", "nippy", "nocturnal", "noisy", "nonstop", "normal", "notable", "noted", "noteworthy", "novel", "noxious", "numb", "nutritious", "nutty", "obedient", "obese", "oblong", "oily", "oblong", "obvious", "occasional", "odd", "oddball", "offbeat", "offensive", "official", "old", "old-fashioned", "only", "open", "optimal", "optimistic", "opulent", "orange", "orderly", "organic", "ornate", "ornery", "ordinary", "original", "other", "our", "outlying", "outgoing", "outlandish", "outrageous", "outstanding", "oval", "overcooked", "overdue", "overjoyed", "overlooked", "palatable", "pale", "paltry", "parallel", "parched", "partial", "passionate", "past", "pastel", "peaceful", "peppery", "perfect", "perfumed", "periodic", "perky", "personal", "pertinent", "pesky", "pessimistic", "petty", "phony", "physical", "piercing", "pink", "pitiful", "plain", "plaintive", "plastic", "playful", "pleasant", "pleased", "pleasing", "plump", "plush", "polished", "polite", "political", "pointed", "pointless", "poised", "poor", "popular", "portly", "posh", "positive", "possible", "potable", "powerful", "powerless", "practical", "precious", "present", "prestigious", "pretty", "precious", "previous", "pricey", "prickly", "primary", "prime", "pristine", "private", "prize", "probable", "productive", "profitable", "profuse", "proper", "proud", "prudent", "punctual", "pungent", "puny", "pure", "purple", "pushy", "putrid", "puzzled", "puzzling", "quaint", "qualified", "quarrelsome", "quarterly", "queasy", "querulous", "questionable", "quick", "quick-witted", "quiet", "quintessential", "quirky", "quixotic", "quizzical", "radiant", "ragged", "rapid", "rare", "rash", "raw", "recent", "reckless", "rectangular", "ready", "real", "realistic", "reasonable", "red", "reflecting", "regal", "regular", "reliable", "relieved", "remarkable", "remorseful", "remote", "repentant", "required", "respectful", "responsible", "repulsive", "revolving", "rewarding", "rich", "rigid", "right", "ringed", "ripe", "roasted", "robust", "rosy", "rotating", "rotten", "rough", "round", "rowdy", "royal", "rubbery", "rundown", "ruddy", "rude", "runny", "rural", "rusty", "sad", "safe", "salty", "same", "sandy", "sane", "sarcastic", "sardonic", "satisfied", "scaly", "scarce", "scared", "scary", "scented", "scholarly", "scientific", "scornful", "scratchy", "scrawny", "second", "secondary", "second-hand", "secret", "self-assured", "self-reliant", "selfish", "sentimental", "separate", "serene", "serious", "serpentine", "several", "severe", "shabby", "shadowy", "shady", "shallow", "shameful", "shameless", "sharp", "shimmering", "shiny", "shocked", "shocking", "shoddy", "short", "short-term", "showy", "shrill", "shy", "sick", "silent", "silky", "silly", "silver", "similar", "simple", "simplistic", "sinful", "single", "sizzling", "skeletal", "skinny", "sleepy", "slight", "slim", "slimy", "slippery", "slow", "slushy", "small", "smart", "smoggy", "smooth", "smug", "snappy", "snarling", "sneaky", "sniveling", "snoopy", "sociable", "soft", "soggy", "solid", "somber", "some", "spherical", "sophisticated", "sore", "sorrowful", "soulful", "soupy", "sour", "Spanish", "sparkling", "sparse", "specific", "spectacular", "speedy", "spicy", "spiffy", "spirited", "spiteful", "splendid", "spotless", "spotted", "spry", "square", "squeaky", "squiggly", "stable", "staid", "stained", "stale", "standard", "starchy", "stark", "starry", "steep", "sticky", "stiff", "stimulating", "stingy", "stormy", "straight", "strange", "steel", "strict", "strident", "striking", "striped", "strong", "studious", "stunning", "stupendous", "stupid", "sturdy", "stylish", "subdued", "submissive", "substantial", "subtle", "suburban", "sudden", "sugary", "sunny", "super", "superb", "superficial", "superior", "supportive", "sure-footed", "surprised", "suspicious", "svelte", "sweaty", "sweet", "sweltering", "swift", "sympathetic", "tall", "talkative", "tame", "tan", "tangible", "tart", "tasty", "tattered", "taut", "tedious", "teeming", "tempting", "tender", "tense", "tepid", "terrible", "terrific", "testy", "thankful", "that", "these", "thick", "thin", "third", "thirsty", "this", "thorough", "thorny", "those", "thoughtful", "threadbare", "thrifty", "thunderous", "tidy", "tight", "timely", "tinted", "tiny", "tired", "torn", "total", "tough", "traumatic", "treasured", "tremendous", "tragic", "trained", "tremendous", "triangular", "tricky", "trifling", "trim", "trivial", "troubled", "true", "trusting", "trustworthy", "trusty", "truthful", "tubby", "turbulent", "twin", "ugly", "ultimate", "unacceptable", "unaware", "uncomfortable", "uncommon", "unconscious", "understated", "unequaled", "uneven", "unfinished", "unfit", "unfolded", "unfortunate", "unhappy", "unhealthy", "uniform", "unimportant", "unique", "united", "unkempt", "unknown", "unlawful", "unlined", "unlucky", "unnatural", "unpleasant", "unrealistic", "unripe", "unruly", "unselfish", "unsightly", "unsteady", "unsung", "untidy", "untimely", "untried", "untrue", "unused", "unusual", "unwelcome", "unwieldy", "unwilling", "unwitting", "unwritten", "upbeat", "upright", "upset", "urban", "usable", "used", "useful", "useless", "utilized", "utter", "vacant", "vague", "vain", "valid", "valuable", "vapid", "variable", "vast", "velvety", "venerated", "vengeful", "verifiable", "vibrant", "vicious", "victorious", "vigilant", "vigorous", "villainous", "violet", "violent", "virtual", "virtuous", "visible", "vital", "vivacious", "vivid", "voluminous", "wan", "warlike", "warm", "warmhearted", "warped", "wary", "wasteful", "watchful", "waterlogged", "watery", "wavy", "wealthy", "weak", "weary", "webbed", "wee", "weekly", "weepy", "weighty", "weird", "welcome", "well-documented", "well-groomed", "well-informed", "well-lit", "well-made", "well-off", "well-to-do", "well-worn", "wet", "which", "whimsical", "whirlwind", "whispered", "white", "whole", "whopping", "wicked", "wide", "wide-eyed", "wiggly", "wild", "willing", "wilted", "winding", "windy", "winged", "wiry", "wise", "witty", "wobbly", "woeful", "wonderful", "wooden", "woozy", "wordy", "worldly", "worn", "worried", "worrisome", "worse", "worst", "worthless", "worthwhile", "worthy", "wrathful", "wretched", "writhing", "wrong", "wry", "yawning", "yearly", "yellow", "yellowish", "young", "youthful", "yummy", "zany", "zealous", "zesty", "zigzag", "rocky"];
        let name2 = ["people", "history", "way", "art", "world", "information", "map", "family", "government", "health", "system", "computer", "meat", "year", "thanks", "music", "person", "reading", "method", "data", "food", "understanding", "theory", "law", "bird", "literature", "problem", "software", "control", "knowledge", "power", "ability", "economics", "love", "internet", "television", "science", "library", "nature", "fact", "product", "idea", "temperature", "investment", "area", "society", "activity", "story", "industry", "media", "thing", "oven", "community", "definition", "safety", "quality", "development", "language", "management", "player", "variety", "video", "week", "security", "country", "exam", "movie", "organization", "equipment", "physics", "analysis", "policy", "series", "thought", "basis", "boyfriend", "direction", "strategy", "technology", "army", "camera", "freedom", "paper", "environment", "child", "instance", "month", "truth", "marketing", "university", "writing", "article", "department", "difference", "goal", "news", "audience", "fishing", "growth", "income", "marriage", "user", "combination", "failure", "meaning", "medicine", "philosophy", "teacher", "communication", "night", "chemistry", "disease", "disk", "energy", "nation", "road", "role", "soup", "advertising", "location", "success", "addition", "apartment", "education", "math", "moment", "painting", "politics", "attention", "decision", "event", "property", "shopping", "student", "wood", "competition", "distribution", "entertainment", "office", "population", "president", "unit", "category", "cigarette", "context", "introduction", "opportunity", "performance", "driver", "flight", "length", "magazine", "newspaper", "relationship", "teaching", "cell", "dealer", "debate", "finding", "lake", "member", "message", "phone", "scene", "appearance", "association", "concept", "customer", "death", "discussion", "housing", "inflation", "insurance", "mood", "woman", "advice", "blood", "effort", "expression", "importance", "opinion", "payment", "reality", "responsibility", "situation", "skill", "statement", "wealth", "application", "city", "county", "depth", "estate", "foundation", "grandmother", "heart", "perspective", "photo", "recipe", "studio", "topic", "collection", "depression", "imagination", "passion", "percentage", "resource", "setting", "ad", "agency", "college", "connection", "criticism", "debt", "description", "memory", "patience", "secretary", "solution", "administration", "aspect", "attitude", "director", "personality", "psychology", "recommendation", "response", "selection", "storage", "version", "alcohol", "argument", "complaint", "contract", "emphasis", "highway", "loss", "membership", "possession", "preparation", "steak", "union", "agreement", "cancer", "currency", "employment", "engineering", "entry", "interaction", "limit", "mixture", "preference", "region", "republic", "seat", "tradition", "virus", "actor", "classroom", "delivery", "device", "difficulty", "drama", "election", "engine", "football", "guidance", "hotel", "match", "owner", "priority", "protection", "suggestion", "tension", "variation", "anxiety", "atmosphere", "awareness", "bread", "climate", "comparison", "confusion", "construction", "elevator", "emotion", "employee", "employer", "guest", "height", "leadership", "mall", "manager", "operation", "recording", "respect", "sample", "transportation", "boring", "charity", "cousin", "disaster", "editor", "efficiency", "excitement", "extent", "feedback", "guitar", "homework", "leader", "mom", "outcome", "permission", "presentation", "promotion", "reflection", "refrigerator", "resolution", "revenue", "session", "singer", "tennis", "basket", "bonus", "cabinet", "childhood", "church", "clothes", "coffee", "dinner", "drawing", "hair", "hearing", "initiative", "judgment", "lab", "measurement", "mode", "mud", "orange", "poetry", "police", "possibility", "procedure", "queen", "ratio", "relation", "restaurant", "satisfaction", "sector", "signature", "significance", "song", "tooth", "town", "vehicle", "volume", "wife", "accident", "airport", "appointment", "arrival", "assumption", "baseball", "chapter", "committee", "conversation", "database", "enthusiasm", "error", "explanation", "farmer", "gate", "girl", "hall", "historian", "hospital", "injury", "instruction", "maintenance", "manufacturer", "meal", "perception", "pie", "poem", "presence", "proposal", "reception", "replacement", "revolution", "river", "son", "speech", "tea", "village", "warning", "winner", "worker", "writer", "assistance", "breath", "buyer", "chest", "chocolate", "conclusion", "contribution", "cookie", "courage", "desk", "drawer", "establishment", "examination", "garbage", "grocery", "honey", "impression", "improvement", "independence", "insect", "inspection", "inspector", "king", "ladder", "menu", "penalty", "piano", "potato", "profession", "professor", "quantity", "reaction", "requirement", "salad", "sister", "supermarket", "tongue", "weakness", "wedding", "affair", "ambition", "analyst", "apple", "assignment", "assistant", "bathroom", "bedroom", "beer", "birthday", "celebration", "championship", "cheek", "client", "consequence", "departure", "diamond", "dirt", "ear", "fortune", "friendship", "funeral", "gene", "girlfriend", "hat", "indication", "intention", "lady", "midnight", "negotiation", "obligation", "passenger", "pizza", "platform", "poet", "pollution", "recognition", "reputation", "shirt", "speaker", "stranger", "surgery", "sympathy", "tale", "throat", "trainer", "uncle", "youth", "time", "work", "film", "water", "money", "example", "while", "business", "study", "game", "life", "form", "air", "day", "place", "number", "part", "field", "fish", "back", "process", "heat", "hand", "experience", "job", "book", "end", "point", "type", "home", "economy", "value", "body", "market", "guide", "interest", "state", "radio", "course", "company", "price", "size", "card", "list", "mind", "trade", "line", "care", "group", "risk", "word", "fat", "force", "key", "light", "training", "name", "school", "top", "amount", "level", "order", "practice", "research", "sense", "service", "piece", "web", "boss", "sport", "fun", "house", "page", "term", "test", "answer", "sound", "focus", "matter", "kind", "soil", "board", "oil", "picture", "access", "garden", "range", "rate", "reason", "future", "site", "demand", "exercise", "image", "case", "cause", "coast", "action", "age", "bad", "boat", "record", "result", "section", "building", "mouse", "cash", "class", "period", "plan", "store", "tax", "side", "subject", "space", "rule", "stock", "weather", "chance", "figure", "man", "model", "source", "beginning", "earth", "program", "chicken", "design", "feature", "head", "material", "purpose", "question", "rock", "salt", "act", "birth", "car", "dog", "object", "scale", "sun", "note", "profit", "rent", "speed", "style", "war", "bank", "craft", "half", "inside", "outside", "standard", "bus", "exchange", "eye", "fire", "position", "pressure", "stress", "advantage", "benefit", "box", "frame", "issue", "step", "cycle", "face", "item", "metal", "paint", "review", "room", "screen", "structure", "view", "account", "ball", "discipline", "medium", "share", "balance", "bit", "black", "bottom", "choice", "gift", "impact", "machine", "shape", "tool", "wind", "address", "average", "career", "culture", "morning", "pot", "sign", "table", "task", "condition", "contact", "credit", "egg", "hope", "ice", "network", "north", "square", "attempt", "date", "effect", "link", "post", "star", "voice", "capital", "challenge", "friend", "self", "shot", "brush", "couple", "exit", "front", "function", "lack", "living", "plant", "plastic", "spot", "summer", "taste", "theme", "track", "wing", "brain", "button", "click", "desire", "foot", "gas", "influence", "notice", "rain", "wall", "base", "damage", "distance", "feeling", "pair", "savings", "staff", "sugar", "target", "text", "animal", "author", "budget", "discount", "file", "ground", "lesson", "minute", "officer", "phase", "reference", "register", "sky", "stage", "stick", "title", "trouble", "bowl", "bridge", "campaign", "character", "club", "edge", "evidence", "fan", "letter", "lock", "maximum", "novel", "option", "pack", "park", "quarter", "skin", "sort", "weight", "baby", "background", "carry", "dish", "factor", "fruit", "glass", "joint", "master", "muscle", "red", "strength", "traffic", "trip", "vegetable", "appeal", "chart", "gear", "ideal", "kitchen", "land", "log", "mother", "net", "party", "principle", "relative", "sale", "season", "signal", "spirit", "street", "tree", "wave", "belt", "bench", "commission", "copy", "drop", "minimum", "path", "progress", "project", "sea", "south", "status", "stuff", "ticket", "tour", "angle", "blue", "breakfast", "confidence", "daughter", "degree", "doctor", "dot", "dream", "duty", "essay", "father", "fee", "finance", "hour", "juice", "luck", "milk", "mouth", "peace", "pipe", "stable", "storm", "substance", "team", "trick", "afternoon", "bat", "beach", "blank", "catch", "chain", "consideration", "cream", "crew", "detail", "gold", "interview", "kid", "mark", "mission", "pain", "pleasure", "score", "screw", "sex", "shop", "shower", "suit", "tone", "window", "agent", "band", "bath", "block", "bone", "calendar", "candidate", "cap", "coat", "contest", "corner", "court", "cup", "district", "door", "east", "finger", "garage", "guarantee", "hole", "hook", "implement", "layer", "lecture", "lie", "manner", "meeting", "nose", "parking", "partner", "profile", "rice", "routine", "schedule", "swimming", "telephone", "tip", "winter", "airline", "bag", "battle", "bed", "bill", "bother", "cake", "code", "curve", "designer", "dimension", "dress", "ease", "emergency", "evening", "extension", "farm", "fight", "gap", "grade", "holiday", "horror", "horse", "host", "husband", "loan", "mistake", "mountain", "nail", "noise", "occasion", "package", "patient", "pause", "phrase", "proof", "race", "relief", "sand", "sentence", "shoulder", "smoke", "stomach", "string", "tourist", "towel", "vacation", "west", "wheel", "wine", "arm", "aside", "associate", "bet", "blow", "border", "branch", "breast", "brother", "buddy", "bunch", "chip", "coach", "cross", "document", "draft", "dust", "expert", "floor", "god", "golf", "habit", "iron", "judge", "knife", "landscape", "league", "mail", "mess", "native", "opening", "parent", "pattern", "pin", "pool", "pound", "request", "salary", "shame", "shelter", "shoe", "silver", "tackle", "tank", "trust", "assist", "bake", "bar", "bell", "bike", "blame", "boy", "brick", "chair", "closet", "clue", "collar", "comment", "conference", "devil", "diet", "fear", "fuel", "glove", "jacket", "lunch", "monitor", "mortgage", "nurse", "pace", "panic", "peak", "plane", "reward", "row", "sandwich", "shock", "spite", "spray", "surprise", "till", "transition", "weekend", "welcome", "yard", "alarm", "bend", "bicycle", "bite", "blind", "bottle", "cable", "candle", "clerk", "cloud", "concert", "counter", "flower", "grandfather", "harm", "knee", "lawyer", "leather", "load", "mirror", "neck", "pension", "plate", "purple", "ruin", "ship", "skirt", "slice", "snow", "specialist", "stroke", "switch", "trash", "tune", "zone", "anger", "award", "bid", "bitter", "boot", "bug", "camp", "candy", "carpet", "cat", "champion", "channel", "clock", "comfort", "cow", "crack", "engineer", "entrance", "fault", "grass", "guy", "hell", "highlight", "incident", "island", "joke", "jury", "leg", "lip", "mate", "motor", "nerve", "passage", "pen", "pride", "priest", "prize", "promise", "resident", "resort", "ring", "roof", "rope", "sail", "scheme", "script", "sock", "station", "toe", "tower", "truck", "witness", "can", "will", "other", "use", "make", "good", "look", "help", "go", "great", "being", "still", "public", "read", "keep", "start", "give", "human", "local", "general", "specific", "long", "play", "feel", "high", "put", "common", "set", "change", "simple", "past", "big", "possible", "particular", "major", "personal", "current", "national", "cut", "natural", "physical", "show", "try", "check", "second", "call", "move", "pay", "let", "increase", "single", "individual", "turn", "ask", "buy", "guard", "hold", "main", "offer", "potential", "professional", "international", "travel", "cook", "alternative", "special", "working", "whole", "dance", "excuse", "cold", "commercial", "low", "purchase", "deal", "primary", "worth", "fall", "necessary", "positive", "produce", "search", "present", "spend", "talk", "creative", "tell", "cost", "drive", "green", "support", "glad", "remove", "return", "run", "complex", "due", "effective", "middle", "regular", "reserve", "independent", "leave", "original", "reach", "rest", "serve", "watch", "beautiful", "charge", "active", "break", "negative", "safe", "stay", "visit", "visual", "affect", "cover", "report", "rise", "walk", "white", "junior", "pick", "unique", "classic", "final", "lift", "mix", "private", "stop", "teach", "western", "concern", "familiar", "fly", "official", "broad", "comfortable", "gain", "rich", "save", "stand", "young", "heavy", "lead", "listen", "valuable", "worry", "handle", "leading", "meet", "release", "sell", "finish", "normal", "press", "ride", "secret", "spread", "spring", "tough", "wait", "brown", "deep", "display", "flow", "hit", "objective", "shoot", "touch", "cancel", "chemical", "cry", "dump", "extreme", "push", "conflict", "eat", "fill", "formal", "jump", "kick", "opposite", "pass", "pitch", "remote", "total", "treat", "vast", "abuse", "beat", "burn", "deposit", "print", "raise", "sleep", "somewhere", "advance", "consist", "dark", "double", "draw", "equal", "fix", "hire", "internal", "join", "kill", "sensitive", "tap", "win", "attack", "claim", "constant", "drag", "drink", "guess", "minor", "pull", "raw", "soft", "solid", "wear", "weird", "wonder", "annual", "count", "dead", "doubt", "feed", "forever", "impress", "repeat", "round", "sing", "slide", "strip", "wish", "combine", "command", "dig", "divide", "equivalent", "hang", "hunt", "initial", "march", "mention", "spiritual", "survey", "tie", "adult", "brief", "crazy", "escape", "gather", "hate", "prior", "repair", "rough", "sad", "scratch", "sick", "strike", "employ", "external", "hurt", "illegal", "laugh", "lay", "mobile", "nasty", "ordinary", "respond", "royal", "senior", "split", "strain", "struggle", "swim", "train", "upper", "wash", "yellow", "convert", "crash", "dependent", "fold", "funny", "grab", "hide", "miss", "permit", "quote", "recover", "resolve", "roll", "sink", "slip", "spare", "suspect", "sweet", "swing", "twist", "upstairs", "usual", "abroad", "brave", "calm", "concentrate", "estimate", "grand", "male", "mine", "prompt", "quiet", "refuse", "regret", "reveal", "rush", "shake", "shift", "shine", "steal", "suck", "surround", "bear", "brilliant", "dare", "dear", "delay", "drunk", "female", "hurry", "inevitable", "invite", "kiss", "neat", "pop", "punch", "quit", "reply", "representative", "resist", "rip", "rub", "silly", "smile", "spell", "stretch", "stupid", "tear", "temporary", "tomorrow", "wake", "wrap", "yesterday", "Thomas", "Tom", "Lieuwe"]

        let name = name1[this.getRandomInt(0, name1.length + 1)] + '_' + name2[this.getRandomInt(0, name2.length + 1)];
        return name;
    }

    // 1. Get room IDs already registered with the Presence API.
    // 2. Generate room IDs until you generate one that is not already used.
    // 3. Register the new room ID with the Presence API.
    async generateRoomId(): Promise<string> {
        const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL);
        let id;
        while (true) {
            id = this.generateName();
            if (!currentIds.includes(id)) {
                break;
            }
        }
        await this.presence.sadd(this.LOBBY_CHANNEL, this.roomId);
        return id;
    }
}