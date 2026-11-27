
import BodyBox from "./BodyBox.js";

export default class Hitbox extends BodyBox {
    getBounds(fighter) {
        if (fighter.facing !== 1 && fighter.facing !== -1) {
            throw new Error(
                `Direção inválida ao calcular Hitbox: ${fighter.id}`
            );
        }

        const centerX =
            fighter.x + this.offsetX * fighter.facing;

        const left = centerX - this.width / 2;
        const right = centerX + this.width / 2;

        const top =
            fighter.y - this.height + this.offsetY;

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
