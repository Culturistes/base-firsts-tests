<<<<<<< HEAD
export default interface StoreState {
    client: any;
    room: any;
    settings: {
        modeStreamer: boolean
=======
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
>>>>>>> develop
    }
}