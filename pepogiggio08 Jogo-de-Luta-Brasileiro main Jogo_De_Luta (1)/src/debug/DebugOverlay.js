
export default class DebugOverlay {
    constructor(scene, fighters) {
        this.scene = scene;
        this.fighters = fighters;

        this.graphics = scene.add.graphics();
        this.graphics.setDepth(900);

        // 0: Todas | 1: Pushbox | 2: Hurtbox
        // 3: Hitbox | 4: Nenhuma
        this.boxMode = 0;

        this.toggleKey = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.F3
        );

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

        this.text
            .setDepth(1000)
            .setScrollFactor(0);
    }

    update(collisionInfo = null, attackInfo = []) {
        if (Phaser.Input.Keyboard.JustDown(this.toggleKey)) {
            this.boxMode = (this.boxMode + 1) % 5;
        }

        this.graphics.clear();

        for (const fighter of this.fighters) {
            if (this.boxMode === 0 || this.boxMode === 1) {
                this.drawBox(
                    fighter.pushbox.getBounds(fighter),
                    0x00aaff
                );
            }

            if (this.boxMode === 0 || this.boxMode === 2) {
                this.drawBox(
                    fighter.hurtbox.getBounds(fighter),
                    0xff3333
                );
            }
        }

        // Hitboxes dos ataques ativos
        if (this.boxMode === 0 || this.boxMode === 3) {
            for (const info of attackInfo) {
                this.drawBox(
                    info.hitbox,
                    info.overlapping ? 0x00ff00 : 0xffff00
                );
            }
        }

        const fighter = this.fighters[this.scene.playerIndex];
        const movement = fighter.movement;

        const modes = [
            "Todas",
            "Pushboxes",
            "Hurtboxes",
            "Hitboxes",
            "Nenhuma"
        ];

        this.text.setText([
            `Debug: ${modes[this.boxMode]} (F3)`,
            `Estado: ${fighter.state}`,
            `Posicao X: ${fighter.x.toFixed(1)}`,
            `Posicao Y: ${fighter.y.toFixed(1)}`,
            `Velocidade X: ${movement.velocityX.toFixed(1)}`,
            `No chao: ${movement.isGrounded ? "Sim" : "Nao"}`,
            `Velocidade Y: ${movement.velocityY.toFixed(1)}`,
            `Direcao: ${fighter.facing}`,
            `Sobreposicao: ${collisionInfo ? collisionInfo.overlap.toFixed(2) : "-"}`,
            `Delta A: ${collisionInfo ? collisionInfo.deltaA.toFixed(2) : "-"}`,
            `Delta B: ${collisionInfo ? collisionInfo.deltaB.toFixed(2) : "-"}`
        ]);
    }

    drawBox(bounds, color) {
        this.graphics.lineStyle(1, color, 1);

        this.graphics.strokeRect(
            bounds.left,
            bounds.top,
            bounds.width,
            bounds.height
        );
    }
}
