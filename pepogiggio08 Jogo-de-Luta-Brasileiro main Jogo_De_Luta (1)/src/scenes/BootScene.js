
export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        // Cenário do Rio de Janeiro.
        // Mantido temporariamente como fallback.
        this.load.image(
            "rio-stage",
            "assets/stages/rio.png"
        );

        this.load.video(
            "rio-stage-video",
            "assets/stages/rio.mp4",
            "loadeddata",
            false,
            true
        );

        // Música do cenário do Rio de Janeiro.
        this.load.audio(
            "stage-rio-de-janeiro",
            "assets/audio/stages/rio-de-janeiro-8bit.wav"
        );

        this.load.spritesheet(
            "sidney-idle",
            "assets/fighters/sidney_magal/sidney-idle.png",
            { frameWidth: 239, frameHeight: 256 }
        );

        this.load.spritesheet(
            "sidney-walk",
            "assets/fighters/sidney_magal/sidney-walk.png",
            { frameWidth: 239, frameHeight: 256 }
        );

        this.load.spritesheet(
            "sidney-walk-to-idle",
            "assets/fighters/sidney_magal/sidney-walk-to-idle.png",
            { frameWidth: 239, frameHeight: 256 }
        );

        this.load.spritesheet(
            "tim-walk",
            "assets/fighters/tim_maia/tim-walk.png",
            { frameWidth: 63, frameHeight: 105 }
        );

        this.load.spritesheet(
            "tim-idle",
            "assets/fighters/tim_maia/tim-idle.png",
            { frameWidth: 63, frameHeight: 105 }
        );

        this.load.spritesheet(
            "tim-walk-to-idle",
            "assets/fighters/tim_maia/tim-walk-to-idle.png",
            { frameWidth: 63, frameHeight: 105 }
        );

        this.load.spritesheet(
            "tim-jump-start",
            "assets/fighters/tim_maia/tim-jump-start.png",
            { frameWidth: 63, frameHeight: 105 }
        );

        this.load.spritesheet(
            "tim-jump-airborne",
            "assets/fighters/tim_maia/tim-jump-airborne.png",
            { frameWidth: 63, frameHeight: 105 }
        );

        this.load.spritesheet(
            "tim-jump-landing",
            "assets/fighters/tim_maia/tim-jump-landing.png",
            { frameWidth: 63, frameHeight: 105 }
        );

        this.load.spritesheet(
            "tim-crouch-start",
            "assets/fighters/tim_maia/tim-crouch-start.png",
            { frameWidth: 63, frameHeight: 105 }
        );

        this.load.spritesheet(
            "tim-crouch-end",
            "assets/fighters/tim_maia/tim-crouch-end.png",
            { frameWidth: 63, frameHeight: 105 }
        );
    }

    create() {
        console.log("Inicialização do jogo concluída!");

        this.scene.start("FightScene");
    }
}
