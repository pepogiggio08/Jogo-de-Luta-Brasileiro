
import FighterState from "./FighterState.js";
import FighterStateMachine from "./FighterStateMachine.js";
import FighterMovement from "./FighterMovement.js";
import AttackController from "./controllers/AttackController.js";
import HitstunController from "./controllers/HitstunController.js";
import Pushbox from "../combat/Pushbox.js";
import Hurtbox from "../combat/Hurtbox.js";

export default class Fighter {
    constructor(config) {
        const character = config.data;

        // Identificação
        this.id = character.id;
        this.name = character.name;
        this.archetype = character.archetype;

        // Atributos
        this.maxHealth = character.stats.maxHealth;
        this.health = this.maxHealth;

        this.movementSpeed = character.stats.movementSpeed;
        this.jumpForce = character.stats.jumpForce;
        this.weight = character.stats.weight;

        this.jumpPreparationDuration =
            character.stats.jumpPreparationDuration ?? 10 / 30;

        if (
            !Number.isFinite(this.jumpPreparationDuration) ||
            this.jumpPreparationDuration < 0
        ) {
            throw new Error(
                `Duração de preparação do salto inválida: ${this.id}`
            );
        }

        // Dados de combate
        this.damageMultiplier =
            character.combat.damageMultiplier;

        this.defenseMultiplier =
            character.combat.defenseMultiplier;

        this.attacks = character.attacks ?? {};

        this.pushbox = new Pushbox(character.pushbox);
        this.hurtbox = new Hurtbox(character.hurtbox);

        // Posição
        this.x = config.x;
        this.y = config.y;

        this.facing = config.facing ?? 1;

        // Estado inicial
        this.stateMachine = new FighterStateMachine(
            FighterState.IDLE
        );

        // Sistemas
        this.movement = null;
        this.attackController = null;
        this.hitstunController = null;
    }

    initializeMovement(arena) {
        if (this.movement !== null) {
            throw new Error("Movimentação já inicializada.");
        }

        this.movement = new FighterMovement(this, arena);
    }

    initializeAttackController() {
        if (this.attackController !== null) {
            throw new Error(
                "Controlador de ataques já inicializado."
            );
        }

        this.attackController = new AttackController(this);
    }

    initializeHitstunController() {
        if (this.hitstunController !== null) {
            throw new Error(
                "Controlador de hitstun já inicializado."
            );
        }

        this.hitstunController = new HitstunController(this);
    }

    get state() {
        return this.stateMachine.getState();
    }

    setFacing(direction) {
        if (direction !== 1 && direction !== -1) {
            throw new Error("Direção inválida.");
        }

        this.facing = direction;
    }

    takeDamage(amount) {
        if (!Number.isFinite(amount) || amount <= 0) return;

        const finalDamage =
            amount * this.defenseMultiplier;

        this.health = Math.max(
            0,
            this.health - finalDamage
        );
    }

    heal(amount) {
        if (!Number.isFinite(amount) || amount <= 0) return;

        this.health = Math.min(
            this.maxHealth,
            this.health + amount
        );
    }

    isDefeated() {
        return this.health <= 0;
    }
}
