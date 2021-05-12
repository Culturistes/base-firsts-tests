export default interface StoreState {
    client: any;
    room: any;
    player: any;
    livegame: {
        [key: string]: any,
        currentStep: number
    }
    settings: {
        [key: string]: any,
        modeStreamer: boolean
    }
}