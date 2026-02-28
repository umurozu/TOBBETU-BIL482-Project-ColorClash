/**
 * Idle State
 * Default state when character is not performing any action
 */

import type { ICharacterState } from './ICharacterState';
import type { Character } from '../../entities/Character';

export class IdleState implements ICharacterState {
    readonly name = 'idle';

    enter(character: Character): void {
        character.velocity.x = 0;
        // Keep vertical velocity for gravity
    }

    update(character: Character, deltaTime: number): void {
        // Apply gravity
        character.applyGravity(deltaTime);

        // Check for ground collision
        character.checkGroundCollision();
    }

    exit(_character: Character): void {
        // No cleanup needed
    }

    canTransition(character: Character): ICharacterState | null {
        // Check if character should transition based on input flags
        if (character.inputFlags.attack && character.canAttack()) {
            return character.states.attack;
        }

        if (character.inputFlags.moving) {
            return character.states.move;
        }

        return null;
    }
}
