import { Client, Room } from "colyseus.js";

export default interface StoreState {
    client: Client | null;
    room: Room | null;
    player: any;
    livegame: {
        [key: string]: any,
        currentStep: number
    }
    settings: {
        [key: string]: any,
        streamerMode: boolean
    }
}