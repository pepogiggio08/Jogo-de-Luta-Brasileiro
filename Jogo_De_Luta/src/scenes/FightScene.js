
import Fighter from "../fighters/fighter.js";
import timMaia from "../fighters/timMaia.js";
import InputController from "../input/InputController.js";
import DebugOverlay from "../debug/DebugOverlay.js";
import opponent from "../fighters/opponent.js";
import CollisionSystem from "../combat/CollisionSystem.js";
import CameraController from "../camera/CameraController.js";




export default class FightScene extends Phaser.Scene {
    constructor() {
        super("FightScene");
    }

    
    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.rectangle(
            400,
            height / 2,
            800,
            height,
            0x28334a
        );

        this.add.rectangle(
            400,
            height * 0.65,
            800,
            2,
            0xd5b36d
        );

        this.add.rectangle(
            400,
            height * 0.85,
            800,
            height * 0.30,
            0x34343f
        );

        this.arena = {
            left: 0,
            right: 800,
            groundLevel: height * 0.70
        };

        this.cameras.main.setBounds(
            this.arena.left,
            0,
            this.arena.right - this.arena.left,
            height
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

        // Representação visual provisória
        this.timSprite = this.add.rectangle(
            this.tim.x,
            this.tim.y - 20,
            24,
            40,
            0xd5b36d
        );

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
   
    update(time, delta) {
        const input = this.inputController.read();

        // Movimentação do Tim Maia
        if (input.horizontal !== 0) {
            this.tim.movement.move(input.horizontal, delta);
        } else {
            this.tim.movement.stop(delta);
        }

        if (input.jumpPressed) {
            this.tim.movement.jump();
        }

        this.tim.movement.update(delta);
        this.opponent.movement.update(delta);

        const movements = this.collisionSystem.resolve([
            this.tim,
            this.opponent
        ]);

        const cameraMovement = this.cameraController.getCameraMovement(
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
 
        this.tim.movement.applyMovement(
            movements[0].deltaX,
            movements[0].deltaY
        );

        this.opponent.movement.applyMovement(
            movements[1].deltaX,
            movements[1].deltaY
        );

        this.cameraController.applyCameraMovement(cameraMovement);

        this.updateFighterFacing();

        // Atualização visual
        this.timSprite.setPosition(this.tim.x, this.tim.y - 20);
        this.opponentSprite.setPosition(
            this.opponent.x,
            this.opponent.y - 20
        );

        this.debugOverlay.update(
        this.collisionSystem.debugInfo
    );
        
    }

}