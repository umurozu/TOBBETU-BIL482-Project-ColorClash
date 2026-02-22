/**
 * Attack State
 * Handles attack execution and hit detection
 */

import type { ICharacterState } from './ICharacterState';
import type { Character } from '../../entities/Character';
import { ATTACK_DURATION } from '../../constants/GameConfig';

export class AttackState implements ICharacterState {
    readonly name = 'attack';

    private attackTimer = 0;
    private hasHit = false;

    enter(character: Character): void {
        this.attackTimer = 0;
        this.hasHit = false;
        character.isAttacking = true;
        character.startAttackCooldown();

        // Create attack hitbox
        character.createAttackHitbox();
    }

    update(character: Character, deltaTime: number): void {
        this.attackTimer += deltaTime * 1000; // Convert to ms

        // Apply gravity even during attack
        character.applyGravity(deltaTime);
        character.position.y += character.velocity.y * deltaTime;
        character.checkGroundCollision();

        // Update hitbox position
        character.updateAttackHitbox();

        // Check for hits (only once per attack)
        if (!this.hasHit) {
            const hit = character.checkAttackHit();
            if (hit) {
                this.hasHit = true;
            }
        }
    }

    exit(character: Character): void {
        character.isAttacking = false;
        character.removeAttackHitbox();
    }

    canTransition(character: Character): ICharacterState | null {
        // Attack finished
        if (this.attackTimer >= ATTACK_DURATION) {
            // Return to appropriate state
            if (character.inputFlags.moving) {
                return character.states.move;
            }
            return character.states.idle;
        }

        return null;
    }
}
