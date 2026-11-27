
import FighterFactory from "../fighters/FighterFactory.js";
import timMaia from "../fighters/characters/timMaia.js";
import sidneyMagal from "../fighters/characters/sidneyMagal.js";

import InputController from "../input/InputController.js";
import DebugOverlay from "../debug/DebugOverlay.js";

import CollisionSystem from "../combat/CollisionSystem.js";
import AttackSystem from "../combat/AttackSystem.js";

import CameraController from "../camera/CameraController.js";

import FighterVisualConfig from "../fighters/configs/FighterVisualConfig.js";

export default class FightScene extends Phaser.Scene {
    constructor() {
        super("FightScene");
    }

    create() {
        this.events.once("shutdown", () => {
            if (this.stageMusic) {
                this.stageMusic.stop();
                this.stageMusic.destroy();
                this.stageMusic = null;
            }

            if (this.stageVideo) {
                this.stageVideo.stop();
                this.stageVideo.destroy();
                this.stageVideo = null;
            }
        });

        const height = this.scale.height;

        // Música da fase.
        this.stageMusic = this.sound.add("stage-rio-de-janeiro", {
            loop: true,
            volume: 0.5
        });

        this.stageMusic.play();

        // Cenário animado.
        this.stageVideo = this.add.video(
            400,
            70,
            "rio-stage-video"
        );

        this.stageVideo
            .setOrigin(0.5)
            .setDepth(-10);

        this.stageVideo.once("metadata", () => {
            this.stageVideo.setDisplaySize(800, 450);

            console.log("[VIDEO METADATA]", {
                width: this.stageVideo.video.videoWidth,
                height: this.stageVideo.video.videoHeight,
                displayWidth: this.stageVideo.displayWidth,
                displayHeight: this.stageVideo.displayHeight
            });
        });

        this.stageVideo.play(true);

        console.log("VIDEO ELEMENT:", {
            videoWidth: this.stageVideo.video.videoWidth,
            videoHeight: this.stageVideo.video.videoHeight,
            readyState: this.stageVideo.video.readyState,
            duration: this.stageVideo.video.duration
        });

        console.log("VIDEO:", {
            width: this.stageVideo.width,
            height: this.stageVideo.height,
            displayWidth: this.stageVideo.displayWidth,
            displayHeight: this.stageVideo.displayHeight,
            scaleX: this.stageVideo.scaleX,
            scaleY: this.stageVideo.scaleY
        });

        console.log("CAMERA:", {
            width: this.cameras.main.width,
            height: this.cameras.main.height,
            zoom: this.cameras.main.zoom,
            scrollX: this.cameras.main.scrollX,
            scrollY: this.cameras.main.scrollY
        });

        // Arena.
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

        // Sistemas da luta.
        this.collisionSystem = new CollisionSystem(this.arena);
        this.attackSystem = new AttackSystem();

        this.inputController = new InputController(this);

        // Dados dos personagens.
        const fighterData = [
            timMaia,
            sidneyMagal
        ];

        const startingPositions = [
            { x: 150, facing: 1 },
            { x: 330, facing: -1 }
        ];

        // Criação dos lutadores.
        const fighterInstances = fighterData.map((data, index) => {
            const visualConfig = FighterVisualConfig[data.id];

            return FighterFactory.create({
                scene: this,
                data,
                x: startingPositions[index].x,
                y: this.arena.groundLevel,
                facing: startingPositions[index].facing,
                arena: this.arena,
                visualConfig
            });
        });

        // Separação dos componentes.
        this.fighters = fighterInstances.map(
            instance => instance.fighter
        );

        this.fighterViews = fighterInstances.map(
            instance => instance.view
        );

        this.fighterControllers = fighterInstances.map(
            instance => instance.controller
        );

        // Índice do lutador controlado pelo jogador.
        this.playerIndex = 1;

        // Controlador da câmera.
        this.cameraController = new CameraController(
            this,
            this.fighters[0],
            this.fighters[1],
            this.arena
        );

        // Debug.
        this.debugOverlay = new DebugOverlay(
            this,
            this.fighters
        );

        console.log("Arena carregada com dois lutadores!");
    }

    switchPlayer() {
        this.playerIndex = (this.playerIndex + 1) % this.fighters.length;

        console.log(
            `Jogador controla: ${this.fighters[this.playerIndex].name}`
        );
    }

    updateFighterFacing() {
        const [fighterA, fighterB] = this.fighters;

        const distance = fighterB.x - fighterA.x;

        if (distance > 0) {
            fighterA.setFacing(1);
            fighterB.setFacing(-1);
        } else if (distance < 0) {
            fighterA.setFacing(-1);
            fighterB.setFacing(1);
        }
    }

    update(time, delta) {

        const input = this.inputController.read();

        if (input.switchFighterPressed) {
            this.switchPlayer();
        }

        // Entrada do jogador.
        this.fighterControllers[this.playerIndex].handleInput(
            input,
            delta
        );

        // Atualização da física.
        for (const fighter of this.fighters) {
            fighter.movement.update(delta);
        }

        // Resolução das colisões físicas.
        const movements = this.collisionSystem.resolve(
            this.fighters
        );

        const cameraMovement =
            this.cameraController.getCameraMovement(
                delta,
                movements[0].deltaX,
                movements[1].deltaX
            );

        const visibleBounds =
            this.cameraController.getVisibleBounds(
                cameraMovement
            );

        this.collisionSystem.clampToVisibleBounds(
            this.fighters,
            movements,
            visibleBounds
        );

        // Aplicação dos deslocamentos.
        for (let i = 0; i < this.fighters.length; i++) {
            this.fighters[i].movement.applyMovement(
                movements[i].deltaX,
                movements[i].deltaY
            );
        }

        // Câmera.
        this.cameraController.applyCameraMovement(
            cameraMovement
        );

        const verticalOffset =
            this.cameraController.getVerticalCameraMovement(delta);

        this.cameraController.camera.scrollY = -verticalOffset;

        // Orientação dos lutadores.
        this.updateFighterFacing();

        // Atualização dos ciclos de ataque.
        for (const controller of this.fighterControllers) {
            controller.updateAttack(delta);
        }

        // Detecção e aplicação dos golpes.
        this.attackSystem.update(this.fighters);

        // Atualização visual.
        for (const controller of this.fighterControllers) {
            controller.updateVisuals();
        }

        // Animação do jogador.
        this.fighterControllers[this.playerIndex].updateAnimation(
            input,
            delta
        );

        // Atualização do debug físico.
       this.debugOverlay.update(
            this.collisionSystem.debugInfo,
            this.attackSystem.debugInfo
        );
    }
}
