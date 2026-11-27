
export default class FighterView {
    constructor(scene, fighter, visualConfig) {
        this.scene = scene;
        this.fighter = fighter;
        this.visualConfig = visualConfig;

        if (!visualConfig || !visualConfig.type) {
            throw new Error(
                "Configuração visual inválida."
            );
        }

        this.sprite = this.createVisual();

        this.updatePosition();
        this.updateFacing();
    }

    createVisual() {
        if (this.visualConfig.type === "sprite") {
            const sprite = this.scene.add.sprite(
                this.fighter.x,
                this.fighter.y,
                this.visualConfig.texture,
                this.visualConfig.frame ?? 0
            );

            sprite.setOrigin(
                this.visualConfig.originX ?? 0.5,
                this.visualConfig.originY ?? 1
            );

            sprite.setScale(
                this.visualConfig.scale ?? 1
            );

            return sprite;
        }

        if (this.visualConfig.type === "rectangle") {
            const rectangle = this.scene.add.rectangle(
                this.fighter.x,
                this.fighter.y + (this.visualConfig.offsetY ?? 0),
                this.visualConfig.width,
                this.visualConfig.height,
                this.visualConfig.color
            );

            return rectangle;
        }

        throw new Error(
            `Tipo visual desconhecido: ${this.visualConfig.type}`
        );
    }

    updatePosition() {
        this.sprite.setPosition(
            this.fighter.x,
            this.fighter.y + (this.visualConfig.offsetY ?? 0)
        );
    }

    updateFacing() {
        if (typeof this.sprite.setFlipX === "function") {
            this.sprite.setFlipX(
                this.fighter.facing === -1
            );
        }
    }

    update() {
        this.updatePosition();
        this.updateFacing();
    }

    destroy() {
        this.sprite.destroy();
    }
}
