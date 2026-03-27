/**
 * Water Mode Strategy
 * High defense, moderate damage
 * Blue/Cyan visual theme
 */

import type { IElementalMode } from './IElementalMode';
import type { Character } from '../../entities/Character';
import type { AttackResult, VisualConfig } from '../../types';
import { BASE_ATTACK_DAMAGE, WATER_MODE, WATER_VISUAL, KNOCKBACK_FORCE, HIT_STUN_DURATION } from '../../constants/GameConfig';

export class WaterModeStrategy implements IElementalMode {
    readonly name = 'Water';
    readonly color = WATER_VISUAL.primaryColor;
    readonly damageMultiplier = WATER_MODE.damageMultiplier;
    readonly defenseMultiplier = WATER_MODE.defenseMultiplier;
    readonly attackSpeedMultiplier = WATER_MODE.attackSpeedBonus;

    attack(attacker: Character, target: Character): AttackResult {
        // Water mode deals 0.8x damage with moderate knockback
        const baseDamage = BASE_ATTACK_DAMAGE * this.damageMultiplier;

        // Determine knockback direction based on attacker's facing
        const knockbackDirection = attacker.facingRight ? 1 : -1;

        return {
            damage: baseDamage,
            knockback: {
                x: KNOCKBACK_FORCE * 0.8 * knockbackDirection, // Less knockback for water
                y: -30,
            },
            hitStun: HIT_STUN_DURATION * 0.8, // Slightly less stun
            particleType: 'water',
        };
    }

    defend(_character: Character, incomingDamage: number): number {
        // Water mode has enhanced defense - takes less damage
        return incomingDamage / this.defenseMultiplier;
    }

    getVisualConfig(): VisualConfig {
        return WATER_VISUAL;
    }

    getParticleType(): 'water' {
        return 'water';
    }
}
