/**
 * Wind Mode Strategy
 * Agile mode with flight mobility and fast attacks
 */

import type { IElementalMode } from './IElementalMode';
import type { Character } from '../../entities/Character';
import type { AttackResult, CharacterForm, VisualConfig } from '../../types';
import {
    BASE_ATTACK_DAMAGE,
    WIND_MODE,
    WIND_VISUAL,
    HIT_STUN_DURATION,
    KNOCKBACK_FORCE
} from '../../constants/GameConfig';

export class WindModeStrategy implements IElementalMode {
    readonly name = 'Wind';
    readonly color = WIND_VISUAL.primaryColor;
    readonly damageMultiplier = WIND_MODE.damageMultiplier;
    readonly defenseMultiplier = WIND_MODE.defenseMultiplier;
    readonly attackSpeedMultiplier = WIND_MODE.attackSpeedBonus;
    readonly attackRangeMultiplier = 1;
    readonly attackHeightMultiplier = 1;
    readonly attackEffect = 'slash' as const;
    readonly moveSpeedMultiplier = WIND_MODE.moveSpeedMultiplier;
    readonly jumpForceMultiplier = WIND_MODE.jumpForceMultiplier;
    readonly gravityMultiplier = WIND_MODE.gravityMultiplier;
    readonly canFly = WIND_MODE.canFly;
    readonly flightLift = WIND_MODE.flightLift;
    readonly form: CharacterForm = 'aerial';

    attack(attacker: Character, _target: Character): AttackResult {
        const knockbackDirection = attacker.facingRight ? 1 : -1;

        return {
            damage: BASE_ATTACK_DAMAGE * this.damageMultiplier,
            knockback: {
                x: KNOCKBACK_FORCE * 1.15 * knockbackDirection,
                y: -75,
            },
            hitStun: HIT_STUN_DURATION * 0.7,
            particleType: 'wind',
        };
    }

    defend(_character: Character, incomingDamage: number): number {
        return incomingDamage / this.defenseMultiplier;
    }

    getVisualConfig(): VisualConfig {
        return WIND_VISUAL;
    }

    getParticleType(): 'wind' {
        return 'wind';
    }
}
