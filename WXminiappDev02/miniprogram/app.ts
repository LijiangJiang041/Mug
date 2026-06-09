// app.ts
import { loadState, type AppState } from './utils/stateManager';

App<IAppOption>({
    globalData: {
        appState: null as AppState | null,
    },
    onLaunch() {
        const state = loadState();
        this.globalData.appState = state;
    },
});
