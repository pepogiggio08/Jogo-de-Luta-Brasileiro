

export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {

        this.load.image("rio-stage", "assets/stages/rio.png");




        this.load.spritesheet("tim-walk", "assets/fighters/tim_maia/tim-walk.png", {
            frameWidth: 63,
            frameHeight: 105
        });
        this.load.spritesheet("tim-idle", "assets/fighters/tim_maia/tim-idle.png", {
            frameWidth: 63,
            frameHeight: 105
        });
        this.load.spritesheet(
        "tim-walk-to-idle",
        "assets/fighters/tim_maia/tim-walk-to-idle.png",
        {
            frameWidth: 63,
            frameHeight: 105
        }
    );

    this.load.spritesheet(
    "tim-jump-start",
    "assets/fighters/tim_maia/tim-jump-start.png",
    {
        frameWidth: 63,
        frameHeight: 105
    }
    );

    this.load.spritesheet(
        "tim-jump-airborne",
        "assets/fighters/tim_maia/tim-jump-airborne.png",
        {
            frameWidth: 63,
            frameHeight: 105
        }
    );

    this.load.spritesheet(
        "tim-jump-landing",
        "assets/fighters/tim_maia/tim-jump-landing.png",
        {
            frameWidth: 63,
            frameHeight: 105
        }
    );

    }

    create() {
        console.log("Inicialização do jogo concluída!");

        this.scene.start("FightScene");
    }
}