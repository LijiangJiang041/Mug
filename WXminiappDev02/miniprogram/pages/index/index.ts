// index.ts — Mug Companion main page
import {
  loadState,
  saveState,
  clampScore,
  computeMood,
} from '../../utils/stateManager';

import type { AppState, Todo, MugMood } from '../../utils/stateManager';
import { getResponse } from '../../utils/intentMap';
import type { Intent } from '../../utils/intentMap'; 
import { detectIntent } from '../../utils/llm';

const app = getApp();
// Minimum session duration (seconds) for a "complete" session
const FULL_SESSION_SECS = 25 * 60;

let _timerInterval: number | undefined;

Component({
    data: {
        appMode: 'resting' as AppState['appMode'],
        workScore: 0,
        todos: [] as Todo[],
        mugMood: 'neutral' as MugMood,
        timerRunning: false,
        timerSeconds: 0,
        timerDisplay: '00:00',
        bubbleVisible: false,
        bubbleText: '',
        mugBounce: false,
        inputText: '',
        llmLoading: false,
    },

    lifetimes: {
        attached() {
            this._initFromStorage();
        },
        detached() {
            if (_timerInterval) {
                clearInterval(_timerInterval);
                _timerInterval = undefined;
            }
        },
    },

    pageLifetimes: {
        show() {
            this._initFromStorage();
            this._checkIdleNudge();
        },
        hide() {
            if (_timerInterval) {
                clearInterval(_timerInterval);
                _timerInterval = undefined;
            }
        },
    },

    methods: {
        _initFromStorage() {
            const state = app.globalData.appState ?? loadState();
            app.globalData.appState = state;
            const mood = computeMood(state);
            this.setData({
                appMode: state.appMode,
                workScore: state.workScore,
                todos: state.todos,
                mugMood: mood,
            });
        },

        _getState(): AppState {
            return app.globalData.appState!;
        },

        _saveAndRefresh(state: AppState) {
            app.globalData.appState = state;
            saveState(state);
            const mood = computeMood(state);
            this.setData({
                appMode: state.appMode,
                workScore: state.workScore,
                todos: state.todos,
                mugMood: mood,
            });
        },

        onToggleTimer() {
            if (this.data.timerRunning) {
                this._stopTimer();
            } else {
                this._startTimer();
            }
        },

        _startTimer() {
            const state = this._getState();
            state.appMode = 'working';
            this._saveAndRefresh(state);
            this.setData({
                timerRunning: true,
                timerSeconds: 0,
                timerDisplay: '00:00',
            });
            _timerInterval = setInterval(() => {
                const secs = this.data.timerSeconds + 1;
                const mm = String(Math.floor(secs / 60)).padStart(2, '0');
                const ss = String(secs % 60).padStart(2, '0');
                this.setData({
                    timerSeconds: secs,
                    timerDisplay: `${mm}:${ss}`,
                });
            }, 1000);
        },

        _stopTimer() {
            if (_timerInterval) {
                clearInterval(_timerInterval);
                _timerInterval = undefined;
            }
            const elapsed = this.data.timerSeconds;
            const state = this._getState();
            state.appMode = 'resting';
            state.lastRestStartTime = Date.now();
            if (elapsed >= FULL_SESSION_SECS) {
                state.workScore = clampScore(state.workScore + 10);
                this._saveAndRefresh(state);
                this._showBubble(getResponse(computeMood(state), 'random'));
            } else {
                state.workScore = clampScore(state.workScore - 3);
                this._saveAndRefresh(state);
                this._showBubble('Abandoned early... -3 pts');
            }
            this.setData({ timerRunning: false });
        },

        onMugTap() {
            const { appMode, mugMood } = this.data;
            if (appMode === 'working') {
                this._showBubble("Focus! You're supposed to be working!");
                return;
            }
            this._showBubble(getResponse(mugMood as MugMood, 'tap'));
        },

        onInputChange(e: WechatMiniprogram.Input) {
            this.setData({ inputText: e.detail.value });
        },

        async onInputSubmit() {
            const text = this.data.inputText.trim();
            if (!text || this.data.llmLoading) return;
            if (this.data.appMode === 'working') {
                this._showBubble("I can't chat now — keep working!");
                this.setData({ inputText: '' });
                return;
            }
            this.setData({ llmLoading: true });
            let intent: Intent = 'random';
            try {
                intent = await detectIntent(text);
            } catch (_e) {
                intent = 'random';
            }
            this.setData({ llmLoading: false, inputText: '' });
            this._showBubble(getResponse(this.data.mugMood as MugMood, intent));
        },

        onAddTodo() {
            wx.showModal({
                title: 'Add Task',
                editable: true,
                placeholderText: 'What needs to be done?',
                success: res => {
                    if (res.confirm && res.content && res.content.trim()) {
                        const state = this._getState();
                        const newTodo: Todo = {
                            id: `${Date.now()}`,
                            text: res.content.trim(),
                            done: false,
                        };
                        state.todos = [...state.todos, newTodo];
                        this._saveAndRefresh(state);
                    }
                },
            });
        },

        onToggleTodo(e: WechatMiniprogram.TouchEvent) {
            const id = e.currentTarget.dataset['id'] as string;
            const state = this._getState();
            const todo = state.todos.find(t => t.id === id);
            if (!todo) return;
            const wasDone = todo.done;
            todo.done = !wasDone;
            state.workScore = clampScore(state.workScore + (wasDone ? -5 : 5));
            this._saveAndRefresh(state);
        },

        _checkIdleNudge() {
            const state = this._getState();
            if (state.appMode !== 'resting') return;
            if (state.workScore < 0 || state.workScore > 50) return;
            const idleMin = (Date.now() - state.lastRestStartTime) / 60000;
            if (idleMin > 30) {
                this._showBubble(getResponse('flustered', 'procrastinate'));
            }
        },

        _showBubble(text: string) {
            this.setData({
                bubbleText: text,
                bubbleVisible: true,
                mugBounce: true,
            });
            setTimeout(() => {
                this.setData({ mugBounce: false });
            }, 400);
            setTimeout(() => {
                this.setData({ bubbleVisible: false });
            }, 3500);
        },
    },
});
