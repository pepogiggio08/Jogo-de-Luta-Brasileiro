
const FighterVisualConfig = {
    tim_maia: {
        type: "sprite",
        texture: "tim-walk",
        frame: 0,
        scale: 1.04,
        originX: 0.5,
        originY: 1,
        idleAnimation: "tim-idle"
    },

    sidney_magal: {
    type: "sprite",
    texture: "sidney-walk",
    frame: 0,
    scale: 0.53,
    originX: 0.5,
    originY: 1,
    idleAnimation: "sidney-idle"
    },

    opponent: {
        type: "rectangle",
        width: 24,
        height: 40,
        color: 0x65b5e8,
        offsetY: -20
    }
};

export default FighterVisualConfig;
