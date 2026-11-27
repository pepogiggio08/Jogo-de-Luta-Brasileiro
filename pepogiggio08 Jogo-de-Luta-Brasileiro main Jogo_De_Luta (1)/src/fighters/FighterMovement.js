
import FighterState from "./FighterState.js";

export default class FighterMovement {
    constructor(fighter, arena) {
        this.fighter = fighter;
        this.arena = arena;

        // Velocidade horizontal voluntária.
        this.velocityX = 0;

        // Velocidade horizontal imposta externamente.
        this.forcedVelocityX = 0;

        // Velocidade vertical.
        this.velocityY = 0;

        // Deslocamentos pendentes.
        this.pendingDeltaX = 0;
        this.pendingDeltaY = 0;

        // Parâmetros de movimentação.
        this.acceleration = 900;
        this.deceleration = 1200;
        this.gravity = 1100;

        // Preparação do salto.
        this.isPreparingJump = false;
        this.jumpPreparationTimer = 0;

        // Aterrissagem.
        this.landingTimer = 0;
        this.landingDuration = 17 / 30;

        // Agachamento.
        this.isCrouching = false;
        this.isCrouchTransitioning = false;
        this.crouchRequested = false;

        this.groundLevel = arena.groundLevel;

        this.isGrounded = true;
        this.isJumping = false;
    }

    getHorizontalVelocity() {
        return this.velocityX + this.forcedVelocityX;
    }

    setForcedVelocityX(velocity) {
        if (!Number.isFinite(velocity)) {
            throw new Error(
                "Velocidade horizontal forçada inválida."
            );
        }

        this.forcedVelocityX = velocity;
    }

    clearForcedVelocityX() {
        this.forcedVelocityX = 0;
    }

    stopHorizontalVelocity(direction) {
        if (direction !== -1 && direction !== 1) {
            return;
        }

        if (this.velocityX * direction > 0) {
            this.velocityX = 0;
        }

        if (this.forcedVelocityX * direction > 0) {
            this.forcedVelocityX = 0;
        }
    }

    move(direction, deltaTime) {
        if (direction !== -1 && direction !== 1) return;

        if (!this.fighter.stateMachine.canMoveHorizontally()) {
            this.stopMovement();
            return;
        }

        if (
            this.isCrouching ||
            this.isCrouchTransitioning
        ) return;

        const delta = deltaTime / 1000;

        const targetVelocity =
            direction * this.fighter.movementSpeed;

        const rate = this.velocityX * direction < 0
            ? this.deceleration
            : this.acceleration;

        const change = rate * delta;

        if (direction > 0) {
            this.velocityX = Math.min(
                this.velocityX + change,
                targetVelocity
            );
        } else {
            this.velocityX = Math.max(
                this.velocityX - change,
                targetVelocity
            );
        }
    }

    stop(deltaTime) {
        if (
            this.isCrouching ||
            this.isCrouchTransitioning ||
            !this.fighter.stateMachine.canMoveHorizontally()
        ) {
            this.stopMovement();
            return;
        }

        const delta = deltaTime / 1000;
        const reduction = this.deceleration * delta;

        if (this.velocityX > 0) {
            this.velocityX = Math.max(
                0,
                this.velocityX - reduction
            );
        } else if (this.velocityX < 0) {
            this.velocityX = Math.min(
                0,
                this.velocityX + reduction
            );
        }
    }

    stopMovement() {
        // Interrompe somente o movimento voluntário.
        this.velocityX = 0;
    }

    setCrouch(isDown) {
        this.crouchRequested = isDown;

        if (
            !this.isGrounded ||
            this.isPreparingJump ||
            this.fighter.state === FighterState.LANDING
        ) return;

        if (!isDown) {
            if (
                this.isCrouching &&
                !this.isCrouchTransitioning
            ) {
                this.endCrouch();
            }

            return;
        }

        if (!this.fighter.stateMachine.canCrouch()) return;

        if (
            !this.isCrouching &&
            !this.isCrouchTransitioning
        ) {
            this.startCrouch();
        }
    }

    startCrouch() {
        if (!this.fighter.stateMachine.canCrouch()) {
            return false;
        }

        const transitioned = this.fighter.stateMachine.transition(
            FighterState.CROUCH
        );

        if (!transitioned) return false;

        this.isCrouchTransitioning = true;
        this.stopMovement();

        return true;
    }

    finishCrouch() {
        this.isCrouchTransitioning = false;
        this.isCrouching = true;
    }

    endCrouch() {
        if (!this.isCrouching) return false;

        this.isCrouching = false;
        this.isCrouchTransitioning = true;

        return true;
    }

    finishCrouchEnd() {
        this.isCrouching = false;
        this.isCrouchTransitioning = false;

        this.updateGroundState();

        return true;
    }

    jump() {
        if (
            !this.fighter.stateMachine.canJump() ||
            !this.isGrounded ||
            this.isPreparingJump ||
            this.isCrouching ||
            this.isCrouchTransitioning
        ) return false;

        const transitioned = this.fighter.stateMachine.transition(
            FighterState.JUMP
        );

        if (!transitioned) return false;

        this.isPreparingJump = true;
        this.jumpPreparationTimer =
            this.fighter.jumpPreparationDuration;

        return true;
    }

    launchJump() {
        if (
            !this.isPreparingJump ||
            !this.isGrounded ||
            this.jumpPreparationTimer > 0
        ) return false;

        this.isPreparingJump = false;
        this.velocityY = -this.fighter.jumpForce;
        this.isGrounded = false;
        this.isJumping = true;

        return true;
    }

    update(deltaTime) {
        const delta = deltaTime / 1000;

        // Calcula o deslocamento horizontal resultante.
        this.pendingDeltaX =
            this.getHorizontalVelocity() * delta;

        this.pendingDeltaY = 0;

        // Preparação lógica do salto.
        if (this.isPreparingJump) {
            this.jumpPreparationTimer -= delta;

            if (this.jumpPreparationTimer <= 0) {
                this.jumpPreparationTimer = 0;
                this.launchJump();
            }
        }

        // Gravidade.
        if (!this.isGrounded) {
            this.velocityY += this.gravity * delta;
            this.pendingDeltaY = this.velocityY * delta;
        }

        const currentState =
            this.fighter.stateMachine.getState();

        // Temporização da aterrissagem.
        if (
            this.isGrounded &&
            currentState === FighterState.LANDING
        ) {
            this.landingTimer -= delta;

            if (this.landingTimer <= 0) {
                this.updateGroundState();
            }
        } else if (
            this.isGrounded &&
            !this.isPreparingJump &&
            !this.isCrouching &&
            !this.isCrouchTransitioning
        ) {
            this.updateGroundState();
        }
    }

    applyMovement(deltaX, deltaY) {
        this.fighter.x += deltaX;
        this.fighter.y += deltaY;

        if (this.fighter.y >= this.groundLevel) {
            this.fighter.y = this.groundLevel;

            if (!this.isGrounded) {
                this.velocityY = 0;
                this.isGrounded = true;
                this.isJumping = false;

                this.landingTimer = this.landingDuration;

                this.fighter.stateMachine.transition(
                    FighterState.LANDING
                );
            }
        }

        this.pendingDeltaX = 0;
        this.pendingDeltaY = 0;
    }

    updateGroundState() {
        const currentState =
            this.fighter.stateMachine.getState();

        if (
            currentState !== FighterState.IDLE &&
            currentState !== FighterState.WALK &&
            currentState !== FighterState.LANDING &&
            currentState !== FighterState.CROUCH
        ) return;

        if (
            this.isCrouching ||
            this.isCrouchTransitioning ||
            this.isPreparingJump
        ) return;

        if (currentState === FighterState.LANDING) {
            if (this.landingTimer > 0) return;
        }

        const isMoving =
            Math.abs(this.getHorizontalVelocity()) > 1;

        const nextState = isMoving
            ? FighterState.WALK
            : FighterState.IDLE;

        if (currentState !== nextState) {
            this.fighter.stateMachine.transition(nextState);
        }
    }
}
