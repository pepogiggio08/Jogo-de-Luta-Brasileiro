

const GameConfig = {

    type: Phaser.AUTO,
    parent: "game-container",

    width: 480,
    height: 270,

    backgroundColor: "#171923",

    pixelArt: true,
    roundPixels: true,

    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    }
};

export default GameConfig;
