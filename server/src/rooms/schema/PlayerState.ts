import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class Joker extends Schema {
    @type("string")
    type: string; // Bonus / Attaque ?

    @type("string")
    slug: string;

    @type("string")
    name: string;

    @type("boolean")
    available: boolean = true;

    @type("boolean")
    isUsed: boolean = false;
}

export class ChosenAnswer extends Schema {
    @type('number')
    selectedNAnswer?: number = null;

    @type('string')
    selectedSAnswer?: string = "";

    @type('number')
    dist?: number = null;

    @type('string')
    gentile?: string = "";

    @type(['number'])
    latLng?: ArraySchema<number> = new ArraySchema<number>();
}

export class Player extends Schema {
    @type("string")
    id: string;

    @type("string")
    username: string;

    @type("string")
    avatarURL: string;

    @type("boolean")
    isMDR: boolean;

    @type("boolean")
    isReady: boolean = false;

    @type("boolean")
    connected: boolean = true;

    @type("number")
    score: number = 0;

    @type("number")
    lastScore: number = 0;

    @type("number")
    scoreWon: number = 0;

    @type("boolean")
    hasWonScore: boolean = false;

    @type({ map: Joker })
    jokers: MapSchema<Joker>;

    @type(ChosenAnswer)
    chosenAnswer: ChosenAnswer = new ChosenAnswer;
}