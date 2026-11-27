
import FighterState from "../FighterState.js";

export default class FighterController {
    constructor(
        fighter,
        view,
        animationController = null
    ) {
        this.fighter = fighter;
        this.movement = fighter.movement;
        this.attackController = fighter.attackController;
        this.hitstunController = fighter.hitstunController;
        this.view = view;
        this.animationController = animationController;

        if (!this.movement) {
            throw new Error(
                "FighterController exige movimentação inicializada."
            );
        }

        if (!this.attackController) {
            throw new Error(
                "FighterController exige controlador de ataques inicializado."
            );
        }

        if (!this.hitstunController) {
            throw new Error(
                "FighterController exige controlador de hitstun inicializado."
            );
        }

        if (
            !this.view ||
            typeof this.view.update !== "function"
        ) {
            throw new Error(
                "FighterController exige um FighterView válido."
            );
        }
    }

    handleInput(input, delta) {
        if (input.attackPressed) {
            const primaryAttack =
                this.fighter.attacks.primaryAttack;

            if (primaryAttack) {
                const started =
                    this.attackController.startAttack(
                        primaryAttack
                    );

                if (started) return;
            }
        }

        this.movement.setCrouch(input.crouchDown);

        if (input.horizontal !== 0) {
            this.movement.move(input.horizontal, delta);
        } else {
            this.movement.stop(delta);
        }

        if (input.jumpPressed) {
            const started = this.movement.jump();

            if (started && this.animationController) {
                this.animationController.startJump();
            }
        }
    }

    updateAttack(delta) {
        this.attackController.update(delta);
    }

    updateHitstun(delta) {
        this.hitstunController.update(delta);
    }

    updateAnimation(input, delta) {
        if (!this.animationController) return;

        const currentState = this.fighter.state;

        const animationStates = [
            FighterState.IDLE,
            FighterState.WALK,
            FighterState.CROUCH,
            FighterState.JUMP,
            FighterState.LANDING
        ];

        if (!animationStates.includes(currentState)) return;

        let horizontalInput = 0;

        if (
            currentState === FighterState.IDLE ||
            currentState === FighterState.WALK
        ) {
            horizontalInput =
                Math.abs(this.movement.velocityX) > 1
                    ? Math.sign(this.movement.velocityX)
                    : 0;
        }

        this.animationController.update(
            horizontalInput,
            delta
        );
    }

    updateVisuals() {
        this.view.update();
    }
}
