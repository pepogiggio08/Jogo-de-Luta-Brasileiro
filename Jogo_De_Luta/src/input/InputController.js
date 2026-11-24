export default class InputController {

    
    constructor(scene) {
    if (!scene.input.keyboard) {
        throw new Error("Sistema de teclado indisponível.");
    }

    this.keys = scene.input.keyboard.addKeys({
        left: "LEFT",
        right: "RIGHT",
        leftA: "A",
        rightD: "D",
        jump: "SPACE",
        jumpW: "W",
        jumpUp: "UP"
    });

    this.previousJumpDown = false;
}
    read() {
        const left =
            this.keys.left.isDown || this.keys.leftA.isDown;

        const right =
            this.keys.right.isDown || this.keys.rightD.isDown;

        const jumpDown =
            this.keys.jump.isDown ||
            this.keys.jumpW.isDown ||
            this.keys.jumpUp.isDown;

        const input = {
            horizontal: Number(right) - Number(left),
            jumpPressed: jumpDown && !this.previousJumpDown
        };

        this.previousJumpDown = jumpDown;

        return input;
    }
}