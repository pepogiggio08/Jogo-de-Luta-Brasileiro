
const timMaia = {
    id: "tim_maia",
    name: "Tim Maia",

    stats: {
        maxHealth: 1200,
        movementSpeed: 145,
        jumpForce: 480,
        jumpPreparationDuration: 10 / 30,
        weight: 1.3
    },

    combat: {
        damageMultiplier: 1.2,
        defenseMultiplier: 0.9
    },

    attacks: {
        primaryAttack: {
            id: "heavy_punch",
            name: "Soco Pesado",

            startup: 9,
            active: 10,
            recovery: 28,

            damage: 100,

            hitbox: {
                width: 48,
                height: 24,
                offsetX: 35,
                offsetY: -60
            }
        }
    },

    pushbox: {
        width: 40,
        height: 100,
        offsetX: 0,
        offsetY: 0
    },

    hurtbox: {
        width: 40,
        height: 100,
        offsetX: 0,
        offsetY: 0
    },

    archetype: "heavy"
};

export default timMaia;
