
import GameConfig from "./config/GameConfig.js";
import BootScene from "./scenes/BootScene.js";
import FightScene from "./scenes/FightScene.js";

if (typeof Phaser === "undefined") {
    throw new Error("Phaser não foi carregado corretamente.");
}

GameConfig.scene = [
    BootScene,
    FightScene
];

const game = new Phaser.Game(GameConfig);

export default game;
