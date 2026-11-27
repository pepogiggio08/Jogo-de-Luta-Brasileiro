
export default class CollisionSystem {
    constructor(arena) {
        this.arena = arena;
        this.debugInfo = null;
        this.maxCombatDistance = 380;
    }

    resolve(fighters) {
        this.debugInfo = null;

        if (fighters.length !== 2) {
            throw new Error(
                "O CollisionSystem atual espera exatamente dois lutadores."
            );
        }

        const [fighterA, fighterB] = fighters;

        const movementA = {
            deltaX: fighterA.movement.pendingDeltaX,
            deltaY: fighterA.movement.pendingDeltaY
        };

        const movementB = {
            deltaX: fighterB.movement.pendingDeltaX,
            deltaY: fighterB.movement.pendingDeltaY
        };

        // Respeita os limites da arena.
        this.clampMovement(fighterA, movementA);
        this.clampMovement(fighterB, movementB);

        const boundsA = fighterA.pushbox.getBounds(fighterA);
        const boundsB = fighterB.pushbox.getBounds(fighterB);

        const nextBoundsA = this.getBoundsAt(
            fighterA,
            movementA
        );

        const nextBoundsB = this.getBoundsAt(
            fighterB,
            movementB
        );

        // A Pushbox só atua quando existe sobreposição vertical.
        const verticalOverlap =
            this.overlapsVertically(boundsA, boundsB) ||
            this.overlapsVertically(nextBoundsA, nextBoundsB);

        if (verticalOverlap) {
            this.resolvePushboxes(
                fighterA,
                fighterB,
                movementA,
                movementB,
                boundsA,
                boundsB,
                nextBoundsA,
                nextBoundsB,
                movementA.deltaY > 0 || movementB.deltaY > 0
            );
        }

        this.resolveMaxDistance(
            fighterA,
            fighterB,
            movementA,
            movementB
        );

        this.clampMovement(fighterA, movementA);
        this.clampMovement(fighterB, movementB);

        return [movementA, movementB];
    }

    resolvePushboxes(
        fighterA,
        fighterB,
        movementA,
        movementB,
        boundsA,
        boundsB,
        nextBoundsA,
        nextBoundsB,
        isFalling
    ) {
        const centerA = (boundsA.left + boundsA.right) / 2;
        const centerB = (boundsB.left + boundsB.right) / 2;

        // Define quem estava à esquerda antes do movimento.
        const aIsLeft = centerA <= centerB;

        const minimumDistance =
            fighterA.pushbox.width / 2 +
            fighterB.pushbox.width / 2;

        const nextCenterA =
            (nextBoundsA.left + nextBoundsA.right) / 2;

        const nextCenterB =
            (nextBoundsB.left + nextBoundsB.right) / 2;

        const currentDistance = aIsLeft
            ? nextCenterB - nextCenterA
            : nextCenterA - nextCenterB;

        const overlap = minimumDistance - currentDistance;

        this.debugInfo = {
            overlap,
            deltaA: movementA.deltaX,
            deltaB: movementB.deltaX
        };

        if (overlap <= 0) return;

        const maxCorrection = isFalling ? 6 : 2;

        const correction = Math.min(
            overlap,
            maxCorrection
        );

        this.distributeSeparation(
            aIsLeft,
            correction,
            movementA,
            movementB,
            nextBoundsA,
            nextBoundsB
        );

        // Interrompe somente as velocidades que pressionam
        // os personagens um contra o outro.
        if (aIsLeft) {
            fighterA.movement.stopHorizontalVelocity(1);
            fighterB.movement.stopHorizontalVelocity(-1);
        } else {
            fighterB.movement.stopHorizontalVelocity(1);
            fighterA.movement.stopHorizontalVelocity(-1);
        }
    }

    resolveMaxDistance(fighterA, fighterB, movementA, movementB) {
        const centerA =
            fighterA.x + fighterA.pushbox.offsetX + movementA.deltaX;

        const centerB =
            fighterB.x + fighterB.pushbox.offsetX + movementB.deltaX;

        const aIsLeft = centerA <= centerB;

        const leftMovement = aIsLeft ? movementA : movementB;
        const rightMovement = aIsLeft ? movementB : movementA;

        const distance = Math.abs(centerB - centerA);

        const excess = distance - this.maxCombatDistance;

        if (excess <= 0) {
            return;
        }

        const leftOutward = Math.max(0, -leftMovement.deltaX);
        const rightOutward = Math.max(0, rightMovement.deltaX);

        const totalOutward = leftOutward + rightOutward;

        let leftCorrection;
        let rightCorrection;

        if (totalOutward > 0) {
            leftCorrection = excess * (leftOutward / totalOutward);
            rightCorrection = excess * (rightOutward / totalOutward);
        } else {
            leftCorrection = excess / 2;
            rightCorrection = excess / 2;
        }

        leftMovement.deltaX += leftCorrection;
        rightMovement.deltaX -= rightCorrection;
    }

    distributeSeparation(
        aIsLeft,
        overlap,
        movementA,
        movementB,
        boundsA,
        boundsB
    ) {
        const leftBounds = aIsLeft ? boundsA : boundsB;
        const rightBounds = aIsLeft ? boundsB : boundsA;

        const leftMovement = aIsLeft ? movementA : movementB;
        const rightMovement = aIsLeft ? movementB : movementA;

        const leftSpace = Math.max(
            0,
            leftBounds.left - this.arena.left
        );

        const rightSpace = Math.max(
            0,
            this.arena.right - rightBounds.right
        );

        // Primeiro, divide a separação igualmente.
        let leftPush = Math.min(overlap / 2, leftSpace);
        let rightPush = Math.min(overlap / 2, rightSpace);

        let remaining = overlap - leftPush - rightPush;

        // Redistribui o restante quando um personagem
        // não tem espaço suficiente por causa da parede.
        const extraLeft = Math.min(
            remaining,
            leftSpace - leftPush
        );

        leftPush += extraLeft;
        remaining -= extraLeft;

        const extraRight = Math.min(
            remaining,
            rightSpace - rightPush
        );

        rightPush += extraRight;

        // Aplica a correção horizontal.
        leftMovement.deltaX -= leftPush;
        rightMovement.deltaX += rightPush;
    }

    clampToVisibleBounds(fighters, movements, visibleBounds) {
        for (let i = 0; i < fighters.length; i++) {
            const fighter = fighters[i];
            const movement = movements[i];

            const bounds = fighter.pushbox.getBounds(fighter);

            const minDeltaX = visibleBounds.left - bounds.left;
            const maxDeltaX = visibleBounds.right - bounds.right;

            movement.deltaX = Math.max(
                minDeltaX,
                Math.min(maxDeltaX, movement.deltaX)
            );
        }
    }

    overlapsVertically(boundsA, boundsB) {
        return (
            boundsA.top < boundsB.bottom &&
            boundsA.bottom > boundsB.top
        );
    }

    getBoundsAt(fighter, movement) {
        return fighter.pushbox.getBounds({
            x: fighter.x + movement.deltaX,
            y: fighter.y + movement.deltaY
        });
    }

    clampMovement(fighter, movement) {
        const bounds = fighter.pushbox.getBounds(fighter);

        const minDeltaX = this.arena.left - bounds.left;
        const maxDeltaX = this.arena.right - bounds.right;

        movement.deltaX = Math.max(
            minDeltaX,
            Math.min(maxDeltaX, movement.deltaX)
        );
    }
}
