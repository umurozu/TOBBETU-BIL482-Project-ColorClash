/**
 * Strategy Pattern - IElementalMode Interface
 * Defines the contract for elemental mode strategies (Fire/Water)
 */

import type { Character } from '../../entities/Character';
import type { AttackResult, CharacterForm, ElementalMode, VisualConfig } from '../../types';

/**
 * Strategy interface for elemental modes
 * Each mode changes attack/defense behavior and visual appearance
 */
export interface IElementalMode {
    /** Display name of the mode */
    readonly name: ElementalMode;

    /** Primary color for character rendering */
    readonly color: string;

    /** Damage multiplier (Fire: high, Water: low) */
    readonly damageMultiplier: number;

    /** Defense multiplier (Fire: low, Water: high) */
    readonly defenseMultiplier: number;

    /** Attack speed bonus */
    readonly attackSpeedMultiplier: number;

    /** Attack hitbox range multiplier */
    readonly attackRangeMultiplier: number;

    /** Attack hitbox height multiplier */
    readonly attackHeightMultiplier: number;

    /** Visual style for active attack */
    readonly attackEffect: 'slash' | 'beam';

    /** Horizontal movement multiplier */
    readonly moveSpeedMultiplier: number;

    /** Jump strength multiplier */
    readonly jumpForceMultiplier: number;

    /** Gravity modifier for this mode */
    readonly gravityMultiplier: number;

    /** Allows in-air lift when jump is held */
    readonly canFly: boolean;

    /** Upward lift force used while flying */
    readonly flightLift: number;

    /** Form variant for rendering */
    readonly form: CharacterForm;

    /**
     * Execute an attack with this mode's characteristics
     * @param attacker - The character performing the attack
     * @param target - The character being attacked
     * @returns Attack result with damage and effects
     */
    attack(attacker: Character, target: Character): AttackResult;

    /**
     * Calculate damage reduction based on this mode's defense
     * @param character - The character defending
     * @param incomingDamage - Raw damage amount
     * @returns Reduced damage after defense calculation
     */
    defend(character: Character, incomingDamage: number): number;

    /**
     * Get visual configuration for rendering
     * @returns Visual settings for this mode
     */
    getVisualConfig(): VisualConfig;

    /**
     * Get particle type for attack effects
     */
    getParticleType(): 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'dark';
}
