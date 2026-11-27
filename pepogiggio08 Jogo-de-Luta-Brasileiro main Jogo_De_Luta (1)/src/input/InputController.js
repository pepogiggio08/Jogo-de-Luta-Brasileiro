
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
            jumpUp: "UP",
            crouch: "DOWN",
            crouchS: "S",
            attack: "J",
            switchFighter: "TAB"
        });

        this.previousJumpDown = false;
        this.previousAttackDown = false;
        this.previousSwitchDown = false;
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

        const crouchDown =
            this.keys.crouch.isDown ||
            this.keys.crouchS.isDown;

        const attackDown = this.keys.attack.isDown;
        const switchDown = this.keys.switchFighter.isDown;

        const input = {
            horizontal: Number(right) - Number(left),
            jumpPressed: jumpDown && !this.previousJumpDown,
            crouchDown,
            attackPressed: attackDown && !this.previousAttackDown,
            switchFighterPressed:
                switchDown && !this.previousSwitchDown
        };

        this.previousJumpDown = jumpDown;
        this.previousAttackDown = attackDown;
        this.previousSwitchDown = switchDown;

        return input;
    }
}
