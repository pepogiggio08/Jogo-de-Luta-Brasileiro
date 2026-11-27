
import FighterState from "./FighterState.js";

const STATE_PERMISSIONS = Object.freeze({
    [FighterState.IDLE]: Object.freeze({
        horizontalMovement: true,
        jump: true,
        crouch: true
    }),

    [FighterState.WALK]: Object.freeze({
        horizontalMovement: true,
        jump: true,
        crouch: true
    }),

    [FighterState.CROUCH]: Object.freeze({
        horizontalMovement: false,
        jump: false,
        crouch: false
    }),

    [FighterState.JUMP]: Object.freeze({
        horizontalMovement: true,
        jump: false,
        crouch: false
    }),

    [FighterState.LANDING]: Object.freeze({
        horizontalMovement: false,
        jump: false,
        crouch: false
    }),

    [FighterState.ATTACK]: Object.freeze({
        horizontalMovement: false,
        jump: false,
        crouch: false
    }),

    [FighterState.BLOCK]: Object.freeze({
        horizontalMovement: false,
        jump: false,
        crouch: false
    }),

    [FighterState.HIT]: Object.freeze({
        horizontalMovement: false,
        jump: false,
        crouch: false
    }),

    [FighterState.KNOCKDOWN]: Object.freeze({
        horizontalMovement: false,
        jump: false,
        crouch: false
    }),

    [FighterState.RECOVERY]: Object.freeze({
        horizontalMovement: false,
        jump: false,
        crouch: false
    }),

    [FighterState.VICTORY]: Object.freeze({
        horizontalMovement: false,
        jump: false,
        crouch: false
    }),

    [FighterState.DEFEAT]: Object.freeze({
        horizontalMovement: false,
        jump: false,
        crouch: false
    })
});

const STATE_TRANSITIONS = Object.freeze({
    [FighterState.IDLE]: [
        FighterState.WALK,
        FighterState.CROUCH,
        FighterState.JUMP,
        FighterState.ATTACK,
        FighterState.HIT
    ],

    [FighterState.WALK]: [
        FighterState.IDLE,
        FighterState.CROUCH,
        FighterState.JUMP,
        FighterState.ATTACK,
        FighterState.HIT
    ],

    [FighterState.CROUCH]: [
        FighterState.IDLE,
        FighterState.WALK,
        FighterState.HIT
    ],

    [FighterState.JUMP]: [
        FighterState.LANDING,
        FighterState.HIT
    ],

    [FighterState.LANDING]: [
        FighterState.IDLE,
        FighterState.WALK,
        FighterState.HIT
    ],

    [FighterState.ATTACK]: [
        FighterState.RECOVERY,
        FighterState.HIT
    ],

    [FighterState.BLOCK]: [
        FighterState.HIT
    ],

    [FighterState.HIT]: [
        FighterState.IDLE,
        FighterState.WALK
    ],

    [FighterState.RECOVERY]: [
        FighterState.IDLE,
        FighterState.WALK,
        FighterState.HIT
    ]
});

const TERMINAL_STATES = new Set([
    FighterState.VICTORY,
    FighterState.DEFEAT
]);

export default class FighterStateMachine {
    constructor(initialState = FighterState.IDLE) {
        this.validStates = new Set(
            Object.values(FighterState)
        );

        if (!this.validStates.has(initialState)) {
            throw new Error("Estado inicial inválido.");
        }

        this.currentState = initialState;
        this.previousState = null;
    }

    canTransition(nextState) {
        if (!this.validStates.has(nextState)) {
            return false;
        }

        if (this.currentState === nextState) {
            return true;
        }

        if (TERMINAL_STATES.has(this.currentState)) {
            return false;
        }

        if (TERMINAL_STATES.has(nextState)) {
            return true;
        }

        const allowedTransitions =
            STATE_TRANSITIONS[this.currentState];

        if (!allowedTransitions) {
            return false;
        }

        return allowedTransitions.includes(nextState);
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

    getPermissions() {
        return STATE_PERMISSIONS[this.currentState];
    }

    canMoveHorizontally() {
        return this.getPermissions().horizontalMovement;
    }

    canJump() {
        return this.getPermissions().jump;
    }

    canCrouch() {
        return this.getPermissions().crouch;
    }
}
