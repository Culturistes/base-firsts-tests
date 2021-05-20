import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";


export class Player extends Schema {
  @type("string")
  id: string;

  @type("string")
  username: string;

  @type("boolean")
  isMDR: boolean;

  @type("boolean")
  isReady: boolean = false;

  @type("boolean")
  connected: boolean = false;

  @type("number")
  score: number = 0;

  @type("number")
  chosenAnswer: number = 0;
}

class Parameters extends Schema {
  @type("number")
  minigameNumber: number = 3;

  @type("number")
  roundNumber: number = 2;

  @type("number")
  currentMiniGame: number = 1;

  @type("number")
  currentRound: number = 1;
}

export class RoundState extends Schema {
  @type("number")
  answerPoints: number = 100;

  @type('string')
  type: string = "";
}

export class QuizRoundState extends RoundState {
  @type("string")
  title: string = "";

  @type(["string"])
  answers = new ArraySchema<string>();

  @type("string")
  description: string = "";
}

export class LmeRoundState extends RoundState {
  @type("string")
  title: string = "";

  @type(["string"])
  answers = new ArraySchema<string>();

  @type("string")
  description: string = "";
}

export class CocRoundState extends RoundState {
  @type("string")
  name: string;

  @type("number")
  latitude: number;

  @type("number")
  longitude: number;

  @type("string")
  gentileM: string;

  @type("string")
  gentileF: string;
}


export class MiniGameState extends Schema {
  @type("string")
  name: string

  @type([RoundState])
  rounds = new ArraySchema<RoundState>();
}

export class RoomState extends Schema {
  @type('boolean')
  gameRunning: boolean = false;

  @type(Parameters)
  parameters: Parameters = new Parameters;

  @type("number")
  currentStep: number = 0;

  @type({ map: Player })
  players = new MapSchema<Player>();

  @type('number')
  playersReady: number = 0;

  // Array => minigame: array => round
  @type([MiniGameState])
  minigames = new Array<MiniGameState>();

  @type(RoundState)
  currRoundParams: RoundState = new RoundState;
}
