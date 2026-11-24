
import FighterState from "./FighterState.js";

export default class FighterStateMachine {
    constructor(initialState = FighterState.IDLE) {
        this.currentState = initialState;
        this.previousState = null;

        this.validStates = new Set(
            Object.values(FighterState)
        );

        if (!this.validStates.has(initialState)) {
            throw new Error("Estado inicial inválido.");
        }
    }

    canTransition(nextState) {
        if (!this.validStates.has(nextState)) {
            return false;
        }

        if (this.currentState === FighterState.DEFEAT) {
            return false;
        }

        return true;
    }

    transition(nextState) {
        if (!this.canTransition(nextState)) {
            return false;
        }

        if (this.currentState === nextState) {
            return true;
        }

        this.previousState = this.currentState;
        this.currentState = nextState;

        return true;
    }

    getState() {
        return this.currentState;
    }

    getPreviousState() {
        return this.previousState;
    }
}
