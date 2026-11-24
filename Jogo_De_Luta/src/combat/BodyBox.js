
export default class BodyBox {
    constructor({
        width,
        height,
        offsetX = 0,
        offsetY = 0
    }) {
        if (!Number.isFinite(width) || width <= 0) {
            throw new Error("Largura da BodyBox inválida.");
        }

        if (!Number.isFinite(height) || height <= 0) {
            throw new Error("Altura da BodyBox inválida.");
        }

        if (!Number.isFinite(offsetX) || !Number.isFinite(offsetY)) {
            throw new Error("Deslocamento da BodyBox inválido.");
        }

        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    getBounds(fighter) {
        const centerX = fighter.x + this.offsetX;

        const left = centerX - this.width / 2;
        const right = centerX + this.width / 2;

        const top = fighter.y - this.height + this.offsetY;
        const bottom = fighter.y + this.offsetY;

        return {
            left,
            right,
            top,
            bottom,
            width: this.width,
            height: this.height
        };
    }
}
