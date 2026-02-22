/**
 * Command Pattern - ICommand Interface
 * Decouples input from character actions
 */

import type { Character } from '../../entities/Character';

/**
 * Command interface for input actions
 */
export interface ICommand {
    /**
     * Execute the command on a character
     */
    execute(character: Character): void;
}

/**
 * Move command - sets movement flags based on direction
 */
export class MoveCommand implements ICommand {
    constructor(
        private readonly direction: 'left' | 'right' | 'up' | 'down',
        private readonly pressed: boolean
    ) { }

    execute(character: Character): void {
        switch (this.direction) {
            case 'left':
                character.inputFlags.left = this.pressed;
                break;
            case 'right':
                character.inputFlags.right = this.pressed;
                break;
            case 'up':
                character.inputFlags.up = this.pressed;
                break;
            case 'down':
                character.inputFlags.down = this.pressed;
                break;
        }

        // Update moving flag
        character.inputFlags.moving =
            character.inputFlags.left ||
            character.inputFlags.right ||
            character.inputFlags.up ||
            character.inputFlags.down;
    }
}

/**
 * Attack command - triggers attack action
 */
export class AttackCommand implements ICommand {
    constructor(private readonly pressed: boolean) { }

    execute(character: Character): void {
        character.inputFlags.attack = this.pressed;
    }
}

/**
 * Switch Mode command - toggles between Fire and Water modes
 * This is the key command for the Strategy Pattern demonstration
 */
export class SwitchModeCommand implements ICommand {
    execute(character: Character): void {
        character.switchElementalMode();
    }
}
