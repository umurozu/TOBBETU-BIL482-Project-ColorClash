/**
 * Hit State
 * Character is stunned after taking damage
 */

import type { ICharacterState } from './ICharacterState';
import type { Character } from '../../entities/Character';
import { HIT_STUN_DURATION } from '../../constants/GameConfig';

export class HitState implements ICharacterState {
    readonly name = 'hit';

    private stunTimer = 0;
    private stunDuration = HIT_STUN_DURATION;

    enter(character: Character): void {
        this.stunTimer = 0;
        this.stunDuration = character.lastHitStun || HIT_STUN_DURATION;
        character.isHitStunned = true;
    }

    update(character: Character, deltaTime: number): void {
        this.stunTimer += deltaTime * 1000;

        // Apply knockback decay
        character.velocity.x *= 0.9;

        // Apply gravity
        character.applyGravity(deltaTime);

        // Update position
        character.position.x += character.velocity.x * deltaTime;
        character.position.y += character.velocity.y * deltaTime;

        // Check collisions
        character.checkGroundCollision();
        character.checkBoundaries();
    }

    exit(character: Character): void {
        character.isHitStunned = false;
        character.lastHitStun = 0;
    }

    canTransition(_character: Character): ICharacterState | null {
        // Recover from stun
        if (this.stunTimer >= this.stunDuration) {
            return _character.states.idle;
        }

        return null;
    }
}
