/**
 * Fire Mode Strategy
 * High damage output, lower defense
 * Red/Orange visual theme
 */

import type { IElementalMode } from './IElementalMode';
import type { Character } from '../../entities/Character';
import type { AttackResult, VisualConfig } from '../../types';
import { BASE_ATTACK_DAMAGE, FIRE_MODE, FIRE_VISUAL, KNOCKBACK_FORCE, HIT_STUN_DURATION } from '../../constants/GameConfig';

export class FireModeStrategy implements IElementalMode {
    readonly name = 'Fire';
    readonly color = FIRE_VISUAL.primaryColor;
    readonly damageMultiplier = FIRE_MODE.damageMultiplier;
    readonly defenseMultiplier = FIRE_MODE.defenseMultiplier;
    readonly attackSpeedMultiplier = FIRE_MODE.attackSpeedBonus;

    attack(attacker: Character, target: Character): AttackResult {
        // Fire mode deals 1.5x damage with strong knockback
        const baseDamage = BASE_ATTACK_DAMAGE * this.damageMultiplier;

        // Determine knockback direction based on attacker's facing
        const knockbackDirection = attacker.facingRight ? 1 : -1;

        return {
            damage: baseDamage,
            knockback: {
                x: KNOCKBACK_FORCE * 1.3 * knockbackDirection, // Extra knockback for fire
                y: -50, // Slight upward knockback
            },
            hitStun: HIT_STUN_DURATION,
            particleType: 'fire',
        };
    }

    defend(_character: Character, incomingDamage: number): number {
        // Fire mode has reduced defense - takes more damage
        return incomingDamage / this.defenseMultiplier;
    }

    getVisualConfig(): VisualConfig {
        return FIRE_VISUAL;
    }

    getParticleType(): 'fire' {
        return 'fire';
    }
}
