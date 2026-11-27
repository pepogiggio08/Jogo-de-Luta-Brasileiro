
export default class AttackSystem {
    constructor() {
        this.debugInfo = [];
    }

    update(fighters) {
        this.debugInfo = [];

        if (!Array.isArray(fighters) || fighters.length !== 2) {
            throw new Error(
                "AttackSystem exige exatamente dois lutadores."
            );
        }

        for (let i = 0; i < fighters.length; i++) {
            const attacker = fighters[i];
            const defender = fighters[1 - i];

            if (
                !attacker.attackController ||
                defender.isDefeated()
            ) {
                continue;
            }

            const attackController =
                attacker.attackController;

            const hitbox =
                attackController.getActiveHitbox();

            if (!hitbox) continue;

            const hitboxBounds =
                hitbox.getBounds(attacker);

            const hurtboxBounds =
                defender.hurtbox.getBounds(defender);

            const overlapping = this.intersects(
                hitboxBounds,
                hurtboxBounds
            );

            this.debugInfo.push({
                attacker: attacker.id,
                defender: defender.id,
                hitbox: hitboxBounds,
                hurtbox: hurtboxBounds,
                overlapping
            });

            if (!overlapping) continue;

            if (!attackController.registerHit()) {
                continue;
            }

            const damage =
                attackController.getCurrentDamage();

            defender.takeDamage(damage);
        }
    }

    intersects(a, b) {
        return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }
}
