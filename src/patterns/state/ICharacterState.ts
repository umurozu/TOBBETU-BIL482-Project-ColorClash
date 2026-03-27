/**
 * State Pattern - ICharacterState Interface
 * Manages character behavior states (Idle, Move, Attack, Hit)
 */

import type { Character } from '../../entities/Character';

/**
 * State interface for character state machine
 */
export interface ICharacterState {
    /** State identifier */
    readonly name: string;

    /**
     * Called when entering this state
     */
    enter(character: Character): void;

    /**
     * Update logic for this state
     * @param character - The character in this state
     * @param deltaTime - Time since last frame in seconds
     */
    update(character: Character, deltaTime: number): void;

    /**
     * Called when exiting this state
     */
    exit(character: Character): void;

    /**
     * Check if state can transition to another state
     * @returns The new state to transition to, or null to stay
     */
    canTransition(character: Character): ICharacterState | null;
}
