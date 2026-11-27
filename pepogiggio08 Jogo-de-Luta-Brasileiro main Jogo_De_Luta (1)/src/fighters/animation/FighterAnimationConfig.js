
const FighterAnimationConfig = {
    tim_maia: {
        animations: [
            {
                key: "tim-walk",
                texture: "tim-walk",
                start: 1,
                end: 19,
                frameRate: 20,
                repeat: -1
            },
            {
                key: "tim-idle",
                texture: "tim-idle",
                start: 0,
                end: 12,
                frameRate: 8,
                repeat: -1
            },
            {
                key: "tim-walk-to-idle",
                texture: "tim-walk-to-idle",
                start: 0,
                end: 4,
                frameRate: 12,
                repeat: 0
            },
            {
                key: "tim-jump-start",
                texture: "tim-jump-start",
                start: 0,
                end: 20,
                frameRate: 30,
                repeat: 0
            },
            {
                key: "tim-jump-airborne",
                texture: "tim-jump-airborne",
                start: 0,
                end: 8,
                frameRate: 6,
                repeat: -1
            },
            {
                key: "tim-jump-landing",
                texture: "tim-jump-landing",
                start: 0,
                end: 16,
                frameRate: 40,
                repeat: 0
            },
            {
                key: "tim-crouch-start",
                texture: "tim-crouch-start",
                start: 0,
                end: 8,
                frameRate: 24,
                repeat: 0
            },
            {
                key: "tim-crouch-end",
                texture: "tim-crouch-end",
                start: 0,
                end: 8,
                frameRate: 24,
                repeat: 0
            }
        ],

        sequences: {
            idle: "tim-idle",
            walk: "tim-walk",
            walkToIdle: "tim-walk-to-idle",
            jumpStart: "tim-jump-start",
            jumpAirborne: "tim-jump-airborne",
            jumpLanding: "tim-jump-landing",
            crouchStart: "tim-crouch-start",
            crouchEnd: "tim-crouch-end"
        },

        behavior: {
            jumpLaunchFrame: 10,
            landingStartRatio: 0.5,
            landingTimeScale: 0.75
        }
    },

    sidney_magal: {
        animations: [
            {
                key: "sidney-idle",
                texture: "sidney-idle",
                start: 0,
                end: 11,
                frameRate: 9,
                repeat: -1
            },
            {
                key: "sidney-walk",
                texture: "sidney-walk",
                start: 0,
                end: 20,
                frameRate: 12,
                repeat: -1
            },
            {
                key: "sidney-walk-to-idle",
                texture: "sidney-walk-to-idle",
                start: 5,
                end: 11,
                frameRate: 20,
                repeat: 0
            }
        ],

        sequences: {
            idle: "sidney-idle",
            walk: "sidney-walk",
            walkToIdle: "sidney-walk-to-idle"
        },

        behavior: {}
    }
};

export default FighterAnimationConfig;
