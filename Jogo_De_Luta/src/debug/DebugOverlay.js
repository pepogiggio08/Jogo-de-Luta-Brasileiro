export default class DebugOverlay {
    constructor(scene, fighter) {
        this.scene = scene;
        this.fighter = fighter;

        this.text = scene.add.text(8, 8, "", {
            fontSize: "10px",
            fontFamily: "monospace",
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: {
                x: 6,
                y: 4
            }
        });

        this.text.setDepth(1000);
    }

    update() {
        const fighter = this.fighter;
        const movement = fighter.movement;

        this.text.setText([
            `Estado: ${fighter.state}`,
            `Posicao X: ${fighter.x.toFixed(1)}`,
            `Posicao Y: ${fighter.y.toFixed(1)}`,
            `Velocidade X: ${movement.velocityX.toFixed(1)}`,
            `No chao: ${movement.isGrounded ? "Sim" : "Nao"}`,
            `Velocidade Y: ${movement.velocityY.toFixed(1)}`,
            `Direcao: ${fighter.facing}`,
        ]);
    }
}