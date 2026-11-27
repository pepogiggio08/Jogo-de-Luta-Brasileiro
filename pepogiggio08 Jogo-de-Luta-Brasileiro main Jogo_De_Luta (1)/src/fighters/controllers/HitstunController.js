
import FighterState from "../FighterState.js";

const FRAME_DURATION = 1000 / 60;
const DEFAULT_HITSTUN_FRAMES = 12;

export default class HitstunController {
    constructor(fighter) {
        this.fighter = fighter;

        this.remainingTime = 0;
    }

    start(durationFrames = DEFAULT_HITSTUN_FRAMES) {
        if (
            !Number.isInteger(durationFrames) ||
            durationFrames < 1
        ) {
            throw new Error("Duração de hitstun inválida.");
        }

        if (
            !this.fighter.stateMachine.transition(
                FighterState.HIT
            )
        ) {
            return false;
        }

        this.fighter.attackController.cancelAttack();

        const movement = this.fighter.movement;

        movement.stopMovement();

        movement.isCrouching = false;
        movement.isCrouchTransitioning = false;
        movement.crouchRequested = false;

        movement.isPreparingJump = false;
        movement.jumpPreparationTimer = 0;

        this.remainingTime =
            durationFrames * FRAME_DURATION;

        return true;
    }

    update(delta) {
        if (this.remainingTime <= 0) return;

        if (!Number.isFinite(delta) || delta < 0) {
            return;
        }

        this.remainingTime -= delta;

        if (this.remainingTime <= 0) {
            this.finish();
        }
    }

    finish() {
        this.remainingTime = 0;

        const movement = this.fighter.movement;

        let nextState;

        if (!movement.isGrounded) {
            nextState = FighterState.JUMP;
        } else if (
            Math.abs(movement.velocityX) > 1
        ) {
            nextState = FighterState.WALK;
        } else {
            nextState = FighterState.IDLE;
        }

        this.fighter.stateMachine.transition(nextState);
    }
}
