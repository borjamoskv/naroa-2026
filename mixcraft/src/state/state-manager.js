/* ═══════════════════════════════════════════════════
   STATE MANAGER — Sovereign Single Source of Truth
   Event Bus + Reactive Store
   ═══════════════════════════════════════════════════ */

export const EVENTS = {
    APP: {
        READY: 'APP:READY',
        ERROR: 'APP:ERROR'
    },
    AUDIO: {
        LOAD_START: 'AUDIO:LOAD_START',
        LOAD_COMPLETE: 'AUDIO:LOAD_COMPLETE',
        ERROR: 'AUDIO:ERROR',
        DECODED: 'AUDIO:DECODED',
        STEGO_MODE: 'AUDIO:STEGO_MODE'
    },
    TRACK: {
        LOADED: 'TRACK:LOADED'
    },
    PLAYBACK: {
        START: 'PLAYBACK:START',
        STOP: 'PLAYBACK:STOP',
        PAUSE: 'PLAYBACK:PAUSE',
        NUDGE: 'PLAYBACK:NUDGE',
        RATE: 'PLAYBACK:RATE'
    },
    UI: {
        LOADING: 'UI:LOADING',
        TOAST: 'UI:TOAST',
        UPDATE_DECK: 'UI:UPDATE_DECK'
    },
    VIZ: {
        DATA: 'VIZ:DATA' // High frequency analysis data
    }
};

class StateManager {
    constructor() {
        if (StateManager.instance) {
            return StateManager.instance;
        }
        StateManager.instance = this;

        // 1. Event Bus
        this.listeners = new Map();

        // 2. Reactive Store (Immutable-ish philosophy)
        this.state = {
            isPlaying: false,
            bpm: 120,
            activeDeck: 'A',
            decks: {
                A: { ready: false, meta: null },
                B: { ready: false, meta: null }
            },
            masterVolume: 1.0,
            loading: true
        };

        console.log('%c[State] Manager Initialized (Sovereign Level 5)', 'color: #CCFF00; background: #111; padding: 2px 4px;');
    }

    // ─── Event Bus ─────────────────────────────────────────────

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        // Return unsubscribe function for convenience
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    emit(event, payload = null) {
        // Update Internal State if event matches known patterns
        this._updateStateOnEvent(event, payload);

        // Log critical events (skip high-freq VIZ to prevent console spam)
        if (!event.startsWith('VIZ:')) {
            // console.debug(`[Bus] ${event}`, payload || '');
        }

        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => {
                try {
                    cb(payload);
                } catch (err) {
                    console.error(`[State] Error in listener for ${event}:`, err);
                }
            });
        }
    }

    // ─── Internal State Reducer ────────────────────────────────
    
    _updateStateOnEvent(event, payload) {
        switch (event) {
            case EVENTS.PLAYBACK.START:
                this.state.isPlaying = true;
                break;
            case EVENTS.PLAYBACK.STOP:
            case EVENTS.PLAYBACK.PAUSE:
                this.state.isPlaying = false;
                break;
            case EVENTS.UI.LOADING:
                this.state.loading = payload;
                break;
            case EVENTS.AUDIO.LOAD_COMPLETE:
                if (payload && payload.deckId) {
                    this.state.decks[payload.deckId].ready = true;
                }
                break;
        }
    }

    // ─── State Access ──────────────────────────────────────────
    
    get(key) {
        return this.state[key];
    }
}

export const state = new StateManager();
