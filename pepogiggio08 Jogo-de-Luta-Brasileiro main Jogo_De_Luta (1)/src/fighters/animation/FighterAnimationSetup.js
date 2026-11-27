
import FighterAnimationConfig from "./FighterAnimationConfig.js";
import FighterAnimationRegistry from "./FighterAnimationRegistry.js";
import FighterAnimationController from "./FighterAnimationController.js";

export default class FighterAnimationSetup {
    static create(scene, fighter, sprite) {
        const config = FighterAnimationConfig[fighter.id];

        if (!config) {
            throw new Error(
                `Configuração de animação não encontrada para: ${fighter.id}`
            );
        }

        if (!sprite) {
            throw new Error(
                "Sprite não fornecido para configuração das animações."
            );
        }

        FighterAnimationRegistry.register(
            scene,
            config
        );

        const controller = new FighterAnimationController(
            fighter,
            sprite,
            config
        );

        return controller;
    }
}
