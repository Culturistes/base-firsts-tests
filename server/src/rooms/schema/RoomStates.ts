import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { Player } from "./PlayerState";


class Parameters extends Schema {
  @type("number")
  minigameNumber: number = 4;

  @type("number")
  roundNumber: number = 1;

  @type("number")
  currentMiniGame: number = 1;

  @type("number")
  currentRound: number = 1;

  @type("number")
  gamemode: number = 0;
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

  goodAnswer: {
    content: Array<string> | null,
    gentileM?: string,
    gentileF?: string,
    latLng?: Array<string>,
    recette?: {
      possibleIngredients: Array<{ name: string, img: string }>,
      ingredients: Array<{ name: string, img: string, caught: boolean }>
    }
  };
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

  @type('string')
  gameName: string = "";

  @type(Parameters)
  parameters = new Parameters();

  @type("number")
  currentStep: number = 0;

  @type("number")
  currentTimer: number = 20;

  @type("boolean")
  playersCanAnswer: boolean = false;

  @type({ map: Player })
  players = new MapSchema<Player>();

  @type('number')
  playersReady: number = 0;

  @type([MiniGameState])
  minigames = new ArraySchema<MiniGameState>();

  @type(RoundState)
  currRoundParams: RoundState = new RoundState;
}
