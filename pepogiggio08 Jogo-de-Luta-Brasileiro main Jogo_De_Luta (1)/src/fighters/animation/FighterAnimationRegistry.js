
export default class FighterAnimationRegistry {

    static register(scene, config) {
        for (const animation of config.animations) {

            // Evita registrar novamente uma animação existente.
            if (scene.anims.exists(animation.key)) {
                continue;
            }

            scene.anims.create({
                key: animation.key,

                frames: scene.anims.generateFrameNumbers(
                    animation.texture,
                    {
                        start: animation.start,
                        end: animation.end
                    }
                ),

                frameRate: animation.frameRate,
                repeat: animation.repeat
            });
        }
    }
}
