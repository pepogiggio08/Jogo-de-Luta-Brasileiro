

const FighterState = Object.freeze({
    IDLE: "idle",
    WALK: "walk",
    CROUCH: "crouch",
    JUMP: "jump",
    LANDING: "landing",
    ATTACK: "attack",
    BLOCK: "block",
    HIT: "hit",
    KNOCKDOWN: "knockdown",
    RECOVERY: "recovery",
    VICTORY: "victory",
    DEFEAT: "defeat"
});

export default FighterState;
