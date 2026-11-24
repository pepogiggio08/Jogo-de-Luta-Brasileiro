
import FighterState from "./FighterState.js";

export default class FighterMovement {
    constructor(fighter, arena) {
        this.fighter = fighter;
        this.arena = arena;

        // Velocidades
        this.velocityX = 0;
        this.velocityY = 0;

        // Parâmetros de movimentação
        this.acceleration = 900;
        this.deceleration = 1200;
        this.gravity = 1200;

        // Aterrissagem
        this.landingTimer = 0;
        this.landingDuration = 0.12;

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

        this.fighter.x += this.velocityX * delta;

        this.constrainToArena();
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

        this.fighter.x += this.velocityX * delta;

        this.constrainToArena();
    }

    constrainToArena() {
        if (this.fighter.x <= this.arena.left) {
            this.fighter.x = this.arena.left;
            this.velocityX = Math.max(0, this.velocityX);
        }

        if (this.fighter.x >= this.arena.right) {
            this.fighter.x = this.arena.right;
            this.velocityX = Math.min(0, this.velocityX);
        }
    }

    jump() {
        if (!this.isGrounded) return;

        this.velocityY = -this.fighter.jumpForce;

        this.isGrounded = false;
        this.isJumping = true;

        this.fighter.stateMachine.transition(
            FighterState.JUMP
        );
    }

    update(deltaTime) {
        const delta = deltaTime / 1000;

        // Física do salto
        if (!this.isGrounded) {
            this.velocityY += this.gravity * delta;
            this.fighter.y += this.velocityY * delta;

            if (this.fighter.y >= this.groundLevel) {
                this.fighter.y = this.groundLevel;
                this.velocityY = 0;

                this.isGrounded = true;
                this.isJumping = false;

                this.landingTimer = this.landingDuration;

                this.fighter.stateMachine.transition(
                    FighterState.LANDING
                );
            }
        }

        // Aterrissagem
        if (
            this.isGrounded &&
            this.fighter.state === FighterState.LANDING
        ) {
            this.landingTimer -= delta;

            if (this.landingTimer <= 0) {
                this.updateGroundState();
            }
        } else if (this.isGrounded) {
            this.updateGroundState();
        }
    }

    updateGroundState() {
        const isMoving = Math.abs(this.velocityX) > 1;

        if (isMoving) {
            this.fighter.stateMachine.transition(
                FighterState.WALK
            );
        } else {
            this.fighter.stateMachine.transition(
                FighterState.IDLE
            );
        }
    }
}
