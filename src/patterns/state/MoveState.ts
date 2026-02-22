/**
 * Move State
 * Handles character movement based on input
 */

import type { ICharacterState } from './ICharacterState';
import type { Character } from '../../entities/Character';
import { CHARACTER_SPEED, JUMP_FORCE } from '../../constants/GameConfig';

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

        character.velocity.x = moveX * CHARACTER_SPEED;

        // Handle jump
        if (character.inputFlags.up && character.isGrounded) {
            character.velocity.y = JUMP_FORCE;
            character.isGrounded = false;
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
