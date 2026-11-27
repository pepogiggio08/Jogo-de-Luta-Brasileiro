
import FighterState from "../FighterState.js";

function validateConfig(config) {
    if (!config || typeof config !== "object") {
        throw new Error("Configuração de animação ausente ou inválida.");
    }

    const { animations, sequences, behavior } = config;

    if (!Array.isArray(animations) || animations.length === 0) {
        throw new Error("A configuração precisa possuir animações.");
    }

    if (!sequences || typeof sequences !== "object") {
        throw new Error("Sequências de animação ausentes.");
    }

    if (!behavior || typeof behavior !== "object") {
        throw new Error("Configuração de comportamento ausente.");
    }

    const requiredSequences = ["idle", "walk", "walkToIdle"];

    const optionalSequenceGroups = [
        ["jumpStart", "jumpAirborne", "jumpLanding"],
        ["crouchStart", "crouchEnd"]
    ];

    const animationKeys = new Set();

    for (const animation of animations) {
        if (!animation.key || typeof animation.key !== "string") {
            throw new Error("Animação com chave inválida.");
        }

        if (animationKeys.has(animation.key)) {
            throw new Error(`Chave de animação duplicada: ${animation.key}`);
        }

        animationKeys.add(animation.key);

        if (
            !animation.texture ||
            !Number.isInteger(animation.start) ||
            !Number.isInteger(animation.end) ||
            animation.start < 0 ||
            animation.end < animation.start ||
            !Number.isFinite(animation.frameRate) ||
            animation.frameRate <= 0 ||
            !Number.isInteger(animation.repeat) ||
            animation.repeat < -1
        ) {
            throw new Error(`Parâmetros inválidos na animação: ${animation.key}`);
        }
    }

    for (const sequence of requiredSequences) {
        const animationKey = sequences[sequence];

        if (!animationKey || !animationKeys.has(animationKey)) {
            throw new Error(
                `Sequência obrigatória "${sequence}" aponta para uma animação inexistente.`
            );
        }
    }

    for (const group of optionalSequenceGroups) {
        const configuredSequences = group.filter(
            sequence => sequences[sequence] !== undefined
        );

        if (
            configuredSequences.length > 0 &&
            configuredSequences.length !== group.length
        ) {
            throw new Error(
                `Grupo de animações incompleto: ${group.join(", ")}.`
            );
        }
    }

    for (const [sequence, animationKey] of Object.entries(sequences)) {
        if (!animationKeys.has(animationKey)) {
            throw new Error(
                `Sequência "${sequence}" aponta para uma animação inexistente.`
            );
        }
    }

    if (sequences.jumpStart) {
        if (
            !Number.isFinite(behavior.landingStartRatio) ||
            behavior.landingStartRatio <= 0 ||
            behavior.landingStartRatio >= 1
        ) {
            throw new Error("Proporção de início da aterrissagem inválida.");
        }

        if (
            !Number.isFinite(behavior.landingTimeScale) ||
            behavior.landingTimeScale <= 0
        ) {
            throw new Error("Velocidade da animação de aterrissagem inválida.");
        }
    }
}

export default class FighterAnimationController {
    constructor(fighter, sprite, config) {
        validateConfig(config);

        this.fighter = fighter;
        this.sprite = sprite;
        this.sequences = config.sequences;
        this.behavior = config.behavior;

        this.hasJumpAnimations = Boolean(this.sequences.jumpStart);
        this.hasCrouchAnimations = Boolean(this.sequences.crouchStart);

        this.landingAnimationStarted = false;
        this.landingAnimationFinished = false;

        this.jumpAirborneStarted = false;

        this.crouchAnimationStarted = false;
        this.crouchEndAnimationStarted = false;

        this.walkTransitionDirection = null;

        // Tolerância antes de iniciar a transição para idle.
        this.walkStopDelay = 100;
        this.walkStopTimer = 0;

        this.registerAnimationEvents();
    }

    registerAnimationEvents() {
        this.sprite.on("animationcomplete", animation => {
            this.handleAnimationComplete(animation);
        });
    }

    handleAnimationComplete(animation) {
        const movement = this.fighter.movement;
        const sequences = this.sequences;
        const currentState = this.fighter.stateMachine.getState();

        // A aterrissagem pode terminar durante o estado JUMP
        // ou depois da transição para LANDING.
        if (animation.key === sequences.jumpLanding) {
            if (
                currentState !== FighterState.JUMP &&
                currentState !== FighterState.LANDING
            ) {
                return;
            }

            this.sprite.anims.timeScale = 1;

            if (movement.isGrounded) {
                this.landingAnimationStarted = false;
                this.landingAnimationFinished = false;

                this.playGroundAnimation();
            } else {
                this.landingAnimationFinished = true;
                this.sprite.anims.pause();
            }

            return;
        }

        // A transição walk/idle só é válida em estados de chão.
        if (animation.key === sequences.walkToIdle) {
            if (
                currentState !== FighterState.IDLE &&
                currentState !== FighterState.WALK
            ) {
                return;
            }

            const direction = this.walkTransitionDirection;

            this.walkTransitionDirection = null;

            if (direction === "toWalk") {
                this.sprite.anims.stop();
                this.sprite.play(sequences.walk);
            } else if (direction === "toIdle") {
                this.sprite.anims.stop();
                this.sprite.play(sequences.idle);
            }

            return;
        }

        // A conclusão da preparação do agachamento só pode
        // modificar a movimentação enquanto o lutador está agachado.
        if (animation.key === sequences.crouchStart) {
            if (currentState !== FighterState.CROUCH) {
                return;
            }

            this.crouchAnimationStarted = false;

            if (movement.crouchRequested) {
                movement.finishCrouch();
                this.sprite.anims.pause();
            } else {
                movement.finishCrouch();
                movement.endCrouch();
                this.startCrouchEnd();
            }

            return;
        }

        // A finalização do agachamento também não pode interferir
        // em estados de combate.
        if (animation.key === sequences.crouchEnd) {
            if (
                currentState !== FighterState.CROUCH &&
                currentState !== FighterState.IDLE &&
                currentState !== FighterState.WALK
            ) {
                return;
            }

            this.crouchEndAnimationStarted = false;
            movement.finishCrouchEnd();
            this.playGroundAnimation();
        }
    }

    startJump() {
        if (!this.hasJumpAnimations) return;

        this.landingAnimationStarted = false;
        this.landingAnimationFinished = false;
        this.jumpAirborneStarted = false;

        this.sprite.play(this.sequences.jumpStart);
    }

    startCrouch() {
        if (!this.hasCrouchAnimations || this.crouchAnimationStarted) return;

        this.crouchAnimationStarted = true;
        this.sprite.play(this.sequences.crouchStart);
    }

    startCrouchEnd() {
        if (!this.hasCrouchAnimations || this.crouchEndAnimationStarted) return;

        this.crouchEndAnimationStarted = true;

        this.sprite.anims.resume();
        this.sprite.play(this.sequences.crouchEnd, true);
    }

    playGroundAnimation() {
        const isMoving =
            Math.abs(this.fighter.movement.velocityX) > 1;

        if (isMoving) {
            this.sprite.play(this.sequences.walk);
        } else {
            this.sprite.play(this.sequences.walkToIdle);
        }
    }

    update(horizontalInput, delta) {
        const movement = this.fighter.movement;
        const sequences = this.sequences;

        const currentAnimation =
            this.sprite.anims.currentAnim?.key;

        const currentState =
            this.fighter.stateMachine.getState();

        // Animações de agachamento.
        if (this.hasCrouchAnimations) {
            if (
                movement.isCrouchTransitioning &&
                currentState === FighterState.CROUCH &&
                !this.crouchAnimationStarted &&
                !this.crouchEndAnimationStarted &&
                movement.crouchRequested
            ) {
                this.startCrouch();
                return;
            }

            if (
                movement.isCrouchTransitioning &&
                !movement.isCrouching &&
                currentAnimation === sequences.crouchStart &&
                this.crouchAnimationStarted
            ) {
                return;
            }

            if (
                movement.isCrouchTransitioning &&
                !this.crouchEndAnimationStarted
            ) {
                this.startCrouchEnd();
                return;
            }

            if (
                movement.isCrouching ||
                movement.isCrouchTransitioning
            ) {
                return;
            }
        } else if (
            movement.isCrouching ||
            movement.isCrouchTransitioning
        ) {
            return;
        }

        // Animações de salto e aterrissagem.
        if (this.hasJumpAnimations) {
            const behavior = this.behavior;

            if (
                movement.isJumping &&
                !this.jumpAirborneStarted
            ) {
                this.jumpAirborneStarted = true;
                this.sprite.play(sequences.jumpAirborne);
            }

            const distanceToGround =
                movement.groundLevel - this.fighter.y;

            const gravity = movement.gravity;

            const totalDescentTime =
                this.fighter.jumpForce / gravity;

            const landingStartTime =
                totalDescentTime * behavior.landingStartRatio;

            let timeToGround = Infinity;

            if (!movement.isGrounded && movement.velocityY > 0) {
                const velocityY = movement.velocityY;

                timeToGround = (
                    -velocityY +
                    Math.sqrt(
                        velocityY * velocityY +
                        2 * gravity * distanceToGround
                    )
                ) / gravity;
            }

            if (
                !movement.isGrounded &&
                movement.velocityY > 0 &&
                !this.landingAnimationStarted &&
                timeToGround <= landingStartTime
            ) {
                this.landingAnimationStarted = true;

                this.sprite.play(sequences.jumpLanding);
                this.sprite.anims.timeScale =
                    behavior.landingTimeScale;
            }

            if (
                movement.isGrounded &&
                currentState === FighterState.LANDING &&
                this.landingAnimationFinished
            ) {
                this.landingAnimationStarted = false;
                this.landingAnimationFinished = false;

                this.playGroundAnimation();
            }
        }

        // Animações básicas de chão.
        if (
            currentState !== FighterState.JUMP &&
            currentState !== FighterState.LANDING
        ) {
            if (horizontalInput !== 0) {
                this.walkStopTimer = 0;

                if (
                    currentAnimation === sequences.walkToIdle &&
                    this.walkTransitionDirection === "toIdle"
                ) {
                    this.walkTransitionDirection = "toWalk";
                    this.sprite.play(sequences.walkToIdle);
                } else if (
                    currentAnimation !== sequences.walk &&
                    currentAnimation !== sequences.walkToIdle
                ) {
                    this.walkTransitionDirection = "toWalk";
                    this.sprite.play(sequences.walkToIdle);
                }
            } else if (currentAnimation === sequences.walk) {
                this.walkStopTimer += delta;

                if (this.walkStopTimer >= this.walkStopDelay) {
                    this.walkStopTimer = 0;

                    this.walkTransitionDirection = "toIdle";
                    this.sprite.playReverse(sequences.walkToIdle);
                }
            }
        }
    }
}
