export default class CameraController {

    constructor(scene, fighterA, fighterB, arena) {
        this.scene = scene;
        this.fighterA = fighterA;
        this.fighterB = fighterB;
        this.arena = arena;
        this.deadZone = 80;
        this.followSpeed = 5;

        this.camera = scene.cameras.main;
        this.screenMargin = 0;
        // Controle vertical da câmera
        this.verticalFollowSpeed = 3;
        this.maxVerticalOffset = 35;
        this.currentVerticalOffset = 0;
    }
    
    
    getCameraMovement(delta, movementA, movementB) { 
        const nextPositionA =
            this.fighterA.x + movementA;

        const nextPositionB =
            this.fighterB.x + movementB;

        const midpoint = (
            nextPositionA + nextPositionB
        ) / 2;

        const cameraCenter =
            this.camera.scrollX + this.camera.width / 2;

        const offset = midpoint - cameraCenter;

        if (Math.abs(offset) <= this.deadZone) {
            return 0;
        }

        const direction = Math.sign(offset);

        const targetScrollX =
            midpoint -
            this.camera.width / 2 -
            direction * this.deadZone;

        const maxScrollX = Math.max(
            0,
            this.arena.right - this.camera.width
        );

        const clampedTarget = Phaser.Math.Clamp(
            targetScrollX,
            0,
            maxScrollX
        );

        const smoothing = 1 - Math.exp(
            -this.followSpeed * delta / 1000
        );

        return (
            clampedTarget - this.camera.scrollX
        ) * smoothing;
    }

    getVerticalCameraMovement(delta) {
    const movement = this.fighterA.movement;

    let targetOffset = 0;

    if (!movement.isGrounded) {
        const jumpHeight = Math.max(
            0,
            movement.groundLevel - this.fighterA.y
        );

        targetOffset = Math.min(
            jumpHeight * 0.35,
            this.maxVerticalOffset
        );
    }

    const smoothing = 1 - Math.exp(
        -this.verticalFollowSpeed * delta / 1000
    );

    this.currentVerticalOffset += (
        targetOffset - this.currentVerticalOffset
    ) * smoothing;

    return this.currentVerticalOffset;
    }


    applyCameraMovement(movement) {
        this.camera.scrollX += movement;
    }


    getVisibleBounds(cameraMovement = 0) {
    const nextScrollX =
        this.camera.scrollX + cameraMovement;

    const left = nextScrollX + this.screenMargin;

    const right =
        nextScrollX +
        this.camera.width -
        this.screenMargin;

    return {
        left,
        right
    };
    }
}
