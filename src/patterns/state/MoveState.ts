/**
 * Move State
 * Handles character movement based on input
 */

import type { ICharacterState } from './ICharacterState';
import type { Character } from '../../entities/Character';

export class MoveState implements ICharacterState {
    readonly name = 'move';

    enter(_character: Character): void {
        // Movement state entered
    }

    update(character: Character, deltaTime: number): void {
        // Apply horizontal movement based on input
        let moveX = 0;

        if (character.inputFlags.left) {
            moveX -= 1;
            character.facingRight = false;
        }
        if (character.inputFlags.right) {
            moveX += 1;
            character.facingRight = true;
        }

        character.velocity.x = moveX * character.getMovementSpeed();

        // Handle jump / flight
        if (character.inputFlags.up) {
            if (character.isGrounded) {
                character.velocity.y = character.getJumpForce();
                character.isGrounded = false;
            } else if (character.canFlyInCurrentMode()) {
                character.velocity.y = Math.min(character.velocity.y, -character.getFlightLift());
            }
        }

        if (character.inputFlags.down && character.canFlyInCurrentMode() && !character.isGrounded) {
            character.velocity.y += 320 * deltaTime;
        }

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
        character.velocity.x = 0;
    }

    canTransition(character: Character): ICharacterState | null {
        // Priority: Attack > Idle (when not moving)
        if (character.inputFlags.attack && character.canAttack()) {
            return character.states.attack;
        }

        if (!character.inputFlags.moving) {
            return character.states.idle;
        }

        return null;
    }
}
