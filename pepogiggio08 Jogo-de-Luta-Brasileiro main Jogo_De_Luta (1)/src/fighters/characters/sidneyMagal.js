
const sidneyMagal = {
    id: "sidney_magal",
    name: "Sidney Magal",

    stats: {
        maxHealth: 900,
        movementSpeed: 185,
        jumpForce: 500,
        weight: 0.85
    },

    combat: {
        damageMultiplier: 0.85,
        defenseMultiplier: 0.9
    },

    pushbox: {
    width: 50,
    height: 120,
    offsetX: 0,
    offsetY: 0
    },

    hurtbox: {
        width: 50,
        height: 120,
        offsetX: 0,
        offsetY: 0
    },
    behavior: {
    idleRequestTimeScale: 3
},

    archetype: "rushdown"
};

export default sidneyMagal;
