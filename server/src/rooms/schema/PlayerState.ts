import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class Joker extends Schema {
    @type("string")
    type: string // Bonus / Malus ?

    @type("string")
    name: string

    @type("boolean")
    available: boolean = true
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
    latLng?: ArraySchema<number>;
}

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

    @type([Joker])
    jokers: ArraySchema<Joker>;

    @type(ChosenAnswer)
    chosenAnswer: ChosenAnswer = new ChosenAnswer;
}