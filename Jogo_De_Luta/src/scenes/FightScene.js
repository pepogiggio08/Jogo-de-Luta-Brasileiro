
import Fighter from "../fighters/fighter.js";
import timMaia from "../fighters/timMaia.js";
import InputController from "../input/InputController.js";
import DebugOverlay from "../debug/DebugOverlay.js";
import opponent from "../fighters/opponent.js";



export default class FightScene extends Phaser.Scene {
    constructor() {
        super("FightScene");
    }

    
    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.rectangle(width / 2, height / 2, width, height, 0x28334a);
        this.add.rectangle(width / 2, height * 0.65, width, 2, 0xd5b36d);
        this.add.rectangle(width / 2, height * 0.85, width, height * 0.30, 0x34343f);

        this.arena = {
            left: 32,
            right: width - 32,
            groundLevel: height * 0.70
        };

        // Criação dos lutadores
        this.tim = new Fighter({
            data: timMaia,
            x: 120,
            y: this.arena.groundLevel,
            facing: 1
        });

        this.opponent = new Fighter({
            data: opponent,
            x: 360,
            y: this.arena.groundLevel,
            facing: -1
        });

        // Inicialização da movimentação
        this.tim.initializeMovement(this.arena);
        this.opponent.initializeMovement(this.arena);

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

        this.resolveFighterCollision();

        this.updateFighterFacing();

        // Atualização visual
        this.timSprite.setPosition(this.tim.x, this.tim.y - 20);
        this.opponentSprite.setPosition(
            this.opponent.x,
            this.opponent.y - 20
        );

        this.debugOverlay.update();
        
    }


    
    resolveFighterCollision() {
        const minimumDistance = 24;
        const verticalTolerance = 30;

        const fighters = [this.tim, this.opponent];

        const verticalDistance = Math.abs(
            fighters[0].y - fighters[1].y
        );

        // Não existe colisão corporal se estiverem
        // suficientemente separados na vertical.
        if (verticalDistance >= verticalTolerance) return;

        const leftFighter = fighters[0].x <= fighters[1].x
            ? fighters[0]
            : fighters[1];

        const rightFighter = fighters[0].x <= fighters[1].x
            ? fighters[1]
            : fighters[0];

        const distance = rightFighter.x - leftFighter.x;
        const overlap = minimumDistance - distance;

        if (overlap <= 0) return;

        let leftTarget = leftFighter.x - overlap / 2;
        let rightTarget = rightFighter.x + overlap / 2;

        if (leftTarget < this.arena.left) {
            const correction = this.arena.left - leftTarget;
            leftTarget = this.arena.left;
            rightTarget += correction;
        }

        if (rightTarget > this.arena.right) {
            const correction = rightTarget - this.arena.right;
            rightTarget = this.arena.right;
            leftTarget -= correction;
        }

        leftFighter.x = Math.max(this.arena.left, leftTarget);
        rightFighter.x = Math.min(this.arena.right, rightTarget);

        if (leftFighter.movement.velocityX > 0) {
            leftFighter.movement.velocityX = 0;
        }

        if (rightFighter.movement.velocityX < 0) {
            rightFighter.movement.velocityX = 0;
        }
    }




}