
import Fighter from "../fighters/fighter.js";
import timMaia from "../fighters/timMaia.js";
import InputController from "../input/InputController.js";
import DebugOverlay from "../debug/DebugOverlay.js";
import opponent from "../fighters/opponent.js";
import CollisionSystem from "../combat/CollisionSystem.js";
import CameraController from "../camera/CameraController.js";
import FighterState from "../fighters/FighterState.js";

export default class FightScene extends Phaser.Scene {
    constructor() {
        super("FightScene");
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;


        // Cenário do Rio de Janeiro
        // Cenário do Rio de Janeiro
        this.stageBackground = this.add.image(
            400,
            70,
            "rio-stage"
        );

        this.stageBackground
            .setDisplaySize(800, 450)
            .setDepth(-10);



        this.arena = {
            left: 0,
            right: 800,
            groundLevel: height * 0.88
        };

        this.cameras.main.setBounds(
            this.arena.left,
            -35,
            this.arena.right - this.arena.left,
            height + 35
        );

        this.collisionSystem = new CollisionSystem(this.arena);

        // Criação dos lutadores
        this.tim = new Fighter({
            data: timMaia,
            x: 150,
            y: this.arena.groundLevel,
            facing: 1
        });

        this.opponent = new Fighter({
            data: opponent,
            x: 330,
            y: this.arena.groundLevel,
            facing: -1
        });

        // Inicialização da movimentação
        this.tim.initializeMovement(this.arena);
        this.opponent.initializeMovement(this.arena);

        this.cameraController = new CameraController(
            this,
            this.tim,
            this.opponent,
            this.arena
        );

        // Controlador de entrada
        this.inputController = new InputController(this);

        // Animação de caminhada
        this.anims.create({
            key: "tim-walk",
            frames: this.anims.generateFrameNumbers("tim-walk", {
                start: 1,
                end: 19
            }),
            frameRate: 20,
            repeat: -1
        });

        // Animação idle
        this.anims.create({
            key: "tim-idle",
            frames: this.anims.generateFrameNumbers("tim-idle", {
                start: 0,
                end: 12
            }),
            frameRate: 8,
            repeat: -1
        });

        // Transição caminhada para idle
        this.anims.create({
            key: "tim-walk-to-idle",
            frames: this.anims.generateFrameNumbers("tim-walk-to-idle", {
                start: 0,
                end: 4
            }),
            frameRate: 12,
            repeat: 0
        });

        // Preparação do salto
        this.anims.create({
            key: "tim-jump-start",
            frames: this.anims.generateFrameNumbers("tim-jump-start", {
                start: 0,
                end: 20
            }),
            frameRate: 30,
            repeat: 0
        });

        // Suspensão no ar
        this.anims.create({
            key: "tim-jump-airborne",
            frames: this.anims.generateFrameNumbers("tim-jump-airborne", {
                start: 0,
                end: 8
            }),
            frameRate: 6,
            repeat: -1
        });

        // Descida e aterrissagem
        this.anims.create({
            key: "tim-jump-landing",
            frames: this.anims.generateFrameNumbers("tim-jump-landing", {
                start: 0,
                end: 16
            }),
            frameRate: 40,
            repeat: 0
        });

        // Sprite do Tim
        this.timSprite = this.add.sprite(
            this.tim.x,
            this.tim.y,
            "tim-walk",
            0
        );

        this.timSprite.setOrigin(0.5, 1);
        this.timSprite.setScale(1.2);
        this.timSprite.play("tim-idle");

        this.timWantsToWalk = false;

        // Controle das animações de aterrissagem
        this.landingAnimationStarted = false;
        this.landingAnimationFinished = false;

        // Eventos de conclusão das animações
        // Eventos de conclusão das animações
        this.timSprite.on("animationcomplete", (animation) => {

            // Preparação terminou: continua a animação do salto.
            if (animation.key === "tim-jump-start") {
                if (this.tim.movement.isJumping) {
                    this.timSprite.play("tim-jump-airborne");
                }
            }

            // Animação de queda terminou.
            if (animation.key === "tim-jump-landing") {
            this.timSprite.anims.timeScale = 1;

            if (this.tim.movement.isGrounded) {
                this.landingAnimationStarted = false;
                this.landingAnimationFinished = false;

                this.playGroundAnimation();
            } else {
                // Mantém o último quadro até Tim tocar o chão.
                this.landingAnimationFinished = true;
                this.timSprite.anims.pause();
            }
        }

            // Transição para idle terminou.
            if (animation.key === "tim-walk-to-idle") {
                this.timSprite.play("tim-idle");
            }
        });

        // Atualização dos quadros da preparação do salto
        this.timSprite.on("animationupdate", (animation, frame) => {

            if (animation.key !== "tim-jump-start") return;

            // Inicia a física ao chegar ao quadro 10.
            if (
                frame.index === 10 &&
                this.tim.movement.isPreparingJump
            ) {
                this.tim.movement.launchJump();
            }
        });

        // Oponente provisório
        this.opponentSprite = this.add.rectangle(
            this.opponent.x,
            this.opponent.y - 20,
            24,
            40,
            0x65b5e8
        );

        this.debugOverlay = new DebugOverlay(this, this.tim);

        console.log("Arena carregada com dois lutadores!");
    }

    updateFighterFacing() {
        const distance = this.opponent.x - this.tim.x;

        if (distance > 0) {
            this.tim.setFacing(1);
            this.opponent.setFacing(-1);
        } else if (distance < 0) {
            this.tim.setFacing(-1);
            this.opponent.setFacing(1);
        }
    }

    playGroundAnimation() {
        const isMoving =
            Math.abs(this.tim.movement.velocityX) > 1;

        if (isMoving) {
            this.timSprite.play("tim-walk");
        } else {
            this.timSprite.play("tim-walk-to-idle");
        }
    }

    update(time, delta) {
        const input = this.inputController.read();

        // Movimentação horizontal do Tim
        if (input.horizontal !== 0) {
            this.tim.movement.move(input.horizontal, delta);
        } else {
            this.tim.movement.stop(delta);
        }

        // Inicia a preparação do salto
        if (input.jumpPressed) {
            const started = this.tim.movement.jump();

            if (started) {
                this.landingAnimationStarted = false;
                this.landingAnimationFinished = false;

                this.timSprite.play("tim-jump-start");
            }
        }

        // Atualização da física
        this.tim.movement.update(delta);
        this.opponent.movement.update(delta);

        // Resolução das colisões
        const movements = this.collisionSystem.resolve([
            this.tim,
            this.opponent
        ]);

        const cameraMovement =
            this.cameraController.getCameraMovement(
                delta,
                movements[0].deltaX,
                movements[1].deltaX
            );

        const visibleBounds =
            this.cameraController.getVisibleBounds(cameraMovement);

        this.collisionSystem.clampToVisibleBounds(
            [this.tim, this.opponent],
            movements,
            visibleBounds
        );

        // Aplicação dos deslocamentos
        this.tim.movement.applyMovement(
            movements[0].deltaX,
            movements[0].deltaY
        );

        this.opponent.movement.applyMovement(
            movements[1].deltaX,
            movements[1].deltaY
        );

        this.cameraController.applyCameraMovement(cameraMovement);
        const verticalOffset =
        this.cameraController.getVerticalCameraMovement(delta);

        this.cameraController.camera.scrollY =- verticalOffset;

        // Atualização da orientação
        this.updateFighterFacing();

        this.timSprite.setFlipX(this.tim.facing === -1);

        // Atualização da posição visual
        this.timSprite.setPosition(
            this.tim.x,
            this.tim.y
        );

        this.timWantsToWalk = input.horizontal !== 0;

        const currentAnimation =
            this.timSprite.anims.currentAnim?.key;

        const currentState =
            this.tim.stateMachine.getState();

        const movement = this.tim.movement;

        // Inicia a animação de queda antes de tocar o chão.
        const distanceToGround =
            movement.groundLevel - this.tim.y;

        const gravity = movement.gravity;

        const landingAnimationDuration = 17 / 30;
        const totalDescentTime = this.tim.jumpForce / gravity;
        const landingStartTime = totalDescentTime / 2;

        let timeToGround = Infinity;

        if (
            !movement.isGrounded &&
            movement.velocityY > 0
        ) {
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

            this.timSprite.play("tim-jump-landing");

            // Ajusta a velocidade para a animação acompanhar
            // o tempo restante até o chão.
            this.timSprite.anims.timeScale = 0.75;
        }

        // Quando toca o chão, aguarda a animação terminar.
        if (
            movement.isGrounded &&
            currentState === FighterState.LANDING
        ) {
            if (this.landingAnimationFinished) {
                this.landingAnimationStarted = false;
                this.landingAnimationFinished = false;

                this.playGroundAnimation();
            }
        }

        // Animações de caminhada e idle somente no chão.
        else if (
            currentState !== FighterState.JUMP &&
            currentState !== FighterState.LANDING
        ) {
            if (this.timWantsToWalk) {
                if (currentAnimation !== "tim-walk") {
                    this.timSprite.play("tim-walk");
                }
            } else if (currentAnimation === "tim-walk") {
                this.timSprite.play("tim-walk-to-idle");
            }
        }

        // Atualização do oponente
        this.opponentSprite.setPosition(
            this.opponent.x,
            this.opponent.y - 20
        );

        // Debug
        this.debugOverlay.update(
            this.collisionSystem.debugInfo
        );
    }
}
