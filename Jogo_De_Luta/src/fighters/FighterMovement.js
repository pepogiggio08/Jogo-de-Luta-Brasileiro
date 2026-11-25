
import FighterState from "./FighterState.js";

export default class FighterMovement {
    constructor(fighter, arena) {
        this.fighter = fighter;
        this.arena = arena;

        // Velocidades
        this.velocityX = 0;
        this.velocityY = 0;

        // Deslocamentos pendentes
        this.pendingDeltaX = 0;
        this.pendingDeltaY = 0;

        // Parâmetros de movimentação
        this.acceleration = 900;
        this.deceleration = 1200;
        this.gravity = 1100;

        // Preparação do salto
        this.isPreparingJump = false;

        // Aterrissagem
        this.landingTimer = 0;
        this.landingDuration = 17 / 30;

        this.groundLevel = arena.groundLevel;

        this.isGrounded = true;
        this.isJumping = false;
    }

    move(direction, deltaTime) {
        if (direction !== -1 && direction !== 1) return;

        const delta = deltaTime / 1000;

        const targetVelocity =
            direction * this.fighter.movementSpeed;

        const rate =
            this.velocityX * direction < 0
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

        this.pendingDeltaX = this.velocityX * delta;
    }

    stop(deltaTime) {
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

        this.pendingDeltaX = this.velocityX * delta;
    }

    // Inicia a preparação do salto, sem aplicar a física ainda.
    jump() {
        if (!this.isGrounded || this.isPreparingJump) {
            return false;
        }

        this.isPreparingJump = true;

        this.fighter.stateMachine.transition(
            FighterState.JUMP
        );

        return true;
    }

    // Chamado somente quando termina a animação de preparação.
    launchJump() {
        if (!this.isPreparingJump || !this.isGrounded) {
            return false;
        }

        this.isPreparingJump = false;

        this.velocityY = -this.fighter.jumpForce;

        this.isGrounded = false;
        this.isJumping = true;

        return true;
    }

    update(deltaTime) {
        const delta = deltaTime / 1000;

        this.pendingDeltaY = 0;

        // Física do salto
        if (!this.isGrounded) {
            this.velocityY += this.gravity * delta;

            this.pendingDeltaY = this.velocityY * delta;
        }

        const currentState =
            this.fighter.stateMachine.getState();

        // Aterrissagem
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
            !this.isPreparingJump
        ) {
            this.updateGroundState();
        }
    }

    applyMovement(deltaX, deltaY) {
        this.fighter.x += deltaX;
        this.fighter.y += deltaY;

        // Verifica chegada ao chão
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

        // Limpa os deslocamentos pendentes
        this.pendingDeltaX = 0;
        this.pendingDeltaY = 0;
    }

    updateGroundState() {
        const isMoving = Math.abs(this.velocityX) > 1;

        const nextState = isMoving
            ? FighterState.WALK
            : FighterState.IDLE;

        if (
            this.fighter.stateMachine.getState() !== nextState
        ) {
            this.fighter.stateMachine.transition(nextState);
        }
    }
}
