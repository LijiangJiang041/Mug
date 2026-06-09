export interface Todo {
    id: string;
    text: string;
    done: boolean;
}

export interface AppState {
    appMode: 'working' | 'resting';
    workScore: number;
    lastRestStartTime: number;
    todos: Todo[];
}

export type MugMood = 'neutral' | 'angry' | 'flustered' | 'happy';

const STORAGE_KEY = 'mug_app_state';
const MIN_SCORE = -20;
const MAX_SCORE = 100;

export function loadState(): AppState {
    const saved = wx.getStorageSync(STORAGE_KEY) as AppState | '';
    if (saved && typeof saved === 'object') {
        return saved;
    }
    return {
        appMode: 'resting',
        workScore: 0,
        lastRestStartTime: Date.now(),
        todos: [],
    };
}

export function saveState(state: AppState): void {
    wx.setStorageSync(STORAGE_KEY, state);
}

export function clampScore(score: number): number {
    return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
}

export function computeMood(state: AppState): MugMood {
    if (state.appMode === 'working') return 'neutral';
    const idleMinutes = (Date.now() - state.lastRestStartTime) / 60000;
    if (state.workScore < 0) return 'angry';
    if (state.workScore <= 50) {
        return idleMinutes > 30 ? 'flustered' : 'neutral';
    }
    return 'happy';
}
