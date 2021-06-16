import { Client, Room } from "colyseus.js";
import { Howl } from 'howler';

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
    sounds: {
        [key: string]: any
    },
    livegame: {
        [key: string]: any,
        gameName: string,
        currentStep: number,
        currentMiniGame: number,
        currentRound: number,
        timerIsRunning: boolean,
        chosenParams: {
            minigameNumber: number,
            roundNumber: number,
        },
        miniGame: {
            type: string,
            name: string,
            title: string,
            answers: Array<string>,
            chosenAnswer: {},
            goodAnswer: {
                content: Array<string>,
                latLng?: Array<string>,
                gentileM?: string,
                gentileF?: string,
                recette?: {
                    possibleIngredients: Array<{ name: string, img: string }>,
                    ingredients: Array<{ name: string, img: string, caught: boolean }>
                }
            },
            description: string,
        },
        jokersParams: {
            [key: string]: any,
            showOthersChoice: boolean,
            othersCursor: Array<any>,
            showMapRange: boolean,
            highlightItems: boolean,
            screenIsBlurred: boolean,
        }
    }
    settings: {
        [key: string]: any,
        streamerMode: boolean
    }
}