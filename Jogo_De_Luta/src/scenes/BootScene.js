

export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    create() {
        console.log("Inicialização do jogo concluída!");

        this.scene.start("FightScene");
    }
}
