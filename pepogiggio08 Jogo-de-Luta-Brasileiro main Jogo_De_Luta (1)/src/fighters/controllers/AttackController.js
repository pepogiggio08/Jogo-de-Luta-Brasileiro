
import FighterState from "../FighterState.js";
import Hitbox from "../../combat/Hitbox.js";

const FRAME_DURATION = 1000 / 60;

export default class AttackController {
    constructor(fighter) {
        this.fighter = fighter;

        this.currentAttack = null;
        this.currentHitbox = null;

        this.phase = null;
        this.elapsedTime = 0;

        this.hasHit = false;
    }

    startAttack(attackData) {
        if (this.currentAttack !== null) {
            return false;
        }

        if (
            this.fighter.state !== FighterState.IDLE &&
            this.fighter.state !== FighterState.WALK
        ) {
            return false;
        }

        if (!this.validateAttackData(attackData)) {
            throw new Error(
                `Configuração de ataque inválida: ${this.fighter.id}`
            );
        }

        if (
            !this.fighter.stateMachine.transition(
                FighterState.ATTACK
            )
        ) {
            return false;
        }

        this.currentAttack = attackData;
        this.currentHitbox = new Hitbox(
            attackData.hitbox
        );

        this.phase = "startup";
        this.elapsedTime = 0;
        this.hasHit = false;

        this.fighter.movement.stopMovement();

        return true;
    }

    update(delta) {
        if (this.currentAttack === null) return;

        if (!Number.isFinite(delta) || delta < 0) {
            return;
        }

        this.elapsedTime += delta;

        const phaseDuration =
            this.currentAttack[this.phase] * FRAME_DURATION;

        if (this.elapsedTime < phaseDuration) {
            return;
        }

        this.elapsedTime -= phaseDuration;

        if (this.phase === "startup") {
            this.phase = "active";
            return;
        }

        if (this.phase === "active") {
            this.currentHitbox = null;

            this.fighter.stateMachine.transition(
                FighterState.RECOVERY
            );

            this.phase = "recovery";
            return;
        }

        if (this.phase === "recovery") {
            this.finishAttack();
        }
    }

    finishAttack() {
        this.currentAttack = null;
        this.currentHitbox = null;

        this.phase = null;
        this.elapsedTime = 0;
        this.hasHit = false;

        const nextState =
            Math.abs(this.fighter.movement.velocityX) > 1
                ? FighterState.WALK
                : FighterState.IDLE;

        this.fighter.stateMachine.transition(nextState);
    }

    cancelAttack() {
        if (this.currentAttack === null) return false;

        this.currentAttack = null;
        this.currentHitbox = null;

        this.phase = null;
        this.elapsedTime = 0;
        this.hasHit = false;

        return true;
    }

    getActiveHitbox() {
        if (this.phase !== "active") return null;
        if (this.hasHit) return null;

        return this.currentHitbox;
    }

    getCurrentDamage() {
        if (this.currentAttack === null) return 0;

        return this.currentAttack.damage;
    }

    registerHit() {
        if (this.phase !== "active") return false;
        if (this.hasHit) return false;

        this.hasHit = true;
        return true;
    }

    validateAttackData(data) {
        if (!data || typeof data !== "object") {
            return false;
        }

        for (const phase of [
            "startup",
            "active",
            "recovery"
        ]) {
            if (
                !Number.isInteger(data[phase]) ||
                data[phase] < 1
            ) {
                return false;
            }
        }

        if (
            !Number.isFinite(data.damage) ||
            data.damage <= 0
        ) {
            return false;
        }

        const hitbox = data.hitbox;

        if (!hitbox || typeof hitbox !== "object") {
            return false;
        }

        return (
            Number.isFinite(hitbox.width) &&
            hitbox.width > 0 &&
            Number.isFinite(hitbox.height) &&
            hitbox.height > 0 &&
            Number.isFinite(hitbox.offsetX ?? 0) &&
            Number.isFinite(hitbox.offsetY ?? 0)
        );
    }
}
