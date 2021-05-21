import { Client, Room } from "colyseus.js";

export default interface StoreState {
    client: Client | null;
    room: Room | null;
    player: any;
    players: Array<{
        id: string,
        username: string,
        isMDR: boolean,
        isReady: boolean,
        connected: boolean,
        score: number,
        chosenAnswer: any,
    }>,
    livegame: {
        [key: string]: any,
        currentStep: number,
        currentMiniGame: number,
        currentRound: number,
        paramsChosen: {
            minigameNumber: number,
            roundNumber: number,
        },
        miniGame: {
            name: string,
            title: string,
            answers: Array<string>,
            latLong: Array<string>,
            gentileM: string,
            gentileF: string,
            chosenAnswer: string,
            description: string,
        },
    }
    settings: {
        [key: string]: any,
        streamerMode: boolean
    }
}