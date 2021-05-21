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

  chosenAnswer: any;
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

  @type("string")
  title?: string = "";

  @type(["string"])
  answers?= new ArraySchema<string>();

  @type("string")
  description?: string = "";

  @type("string")
  name?: string;

  @type("number")
  latitude?: number;

  @type("number")
  longitude?: number;

  @type("string")
  gentileM?: string;

  @type("string")
  gentileF?: string;

  goodAnswer: any;
}

export class MiniGameState extends Schema {
  @type("string")
  name: string

  @type([RoundState])
  rounds: ArraySchema<RoundState> = new ArraySchema<RoundState>();
}

export class RoomState extends Schema {
  @type('boolean')
  gameRunning: boolean = false;

  @type(Parameters)
  parameters = new Parameters;

  @type("number")
  currentStep: number = 0;

  @type({ map: Player })
  players = new MapSchema<Player>();

  @type('number')
  playersReady: number = 0;

  // Array => minigame: array => round
  @type([MiniGameState])
  minigames = new ArraySchema<MiniGameState>();

  @type(RoundState)
  currRoundParams: RoundState = new RoundState;
}
