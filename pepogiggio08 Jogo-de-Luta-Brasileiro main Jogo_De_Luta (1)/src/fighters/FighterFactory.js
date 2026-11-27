
import Fighter from "./fighter.js";
import FighterView from "./views/FighterView.js";
import FighterAnimationSetup from "./animation/FighterAnimationSetup.js";
import FighterController from "./controllers/FighterController.js";

export default class FighterFactory {

    static create({
        scene,
        data,
        x,
        y,
        facing = 1,
        arena,
        visualConfig
    }) {
        if (!data) {
            throw new Error("Dados do personagem não fornecidos.");
        }

        if (!arena) {
            throw new Error("Arena não fornecida para o lutador.");
        }

        if (!scene) {
            throw new Error("Cena não fornecida para o lutador.");
        }

        if (!visualConfig) {
            throw new Error(
                `Configuração visual não encontrada para o personagem: ${data.id}`
            );
        }

        // Modelo lógico
        const fighter = new Fighter({
            data,
            x,
            y,
            facing
        });

        fighter.initializeMovement(arena);
        fighter.initializeAttackController();
        fighter.initializeHitstunController();

        // Representação visual
        const view = new FighterView(
            scene,
            fighter,
            visualConfig
        );

        // Animações, quando disponíveis
        let animationController = null;

        if (visualConfig.type === "sprite") {
            animationController = FighterAnimationSetup.create(
                scene,
                fighter,
                view.sprite
            );

            if (visualConfig.idleAnimation) {
                view.sprite.play(visualConfig.idleAnimation);
            }
        }

        // Controlador
        const controller = new FighterController(
            fighter,
            view,
            animationController
        );

        return {
            fighter,
            view,
            controller
        };
    }
}
