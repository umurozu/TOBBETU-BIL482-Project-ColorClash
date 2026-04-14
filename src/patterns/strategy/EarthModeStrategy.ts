/**
 * Earth Mode Strategy
 * Tanky mode with high defense and heavier impact
 */

import type { IElementalMode } from './IElementalMode';
import type { Character } from '../../entities/Character';
import type { AttackResult, CharacterForm, VisualConfig } from '../../types';
import {
    BASE_ATTACK_DAMAGE,
    EARTH_MODE,
    EARTH_VISUAL,
    HIT_STUN_DURATION,
    KNOCKBACK_FORCE
} from '../../constants/GameConfig';

export class EarthModeStrategy implements IElementalMode {
    readonly name = 'Earth';
    readonly color = EARTH_VISUAL.primaryColor;
    readonly damageMultiplier = EARTH_MODE.damageMultiplier;
    readonly defenseMultiplier = EARTH_MODE.defenseMultiplier;
    readonly attackSpeedMultiplier = EARTH_MODE.attackSpeedBonus;
    readonly attackRangeMultiplier = 1;
    readonly attackHeightMultiplier = 1;
    readonly attackEffect = 'slash' as const;
    readonly moveSpeedMultiplier = EARTH_MODE.moveSpeedMultiplier;
    readonly jumpForceMultiplier = EARTH_MODE.jumpForceMultiplier;
    readonly gravityMultiplier = EARTH_MODE.gravityMultiplier;
    readonly canFly = EARTH_MODE.canFly;
    readonly flightLift = EARTH_MODE.flightLift;
    readonly form: CharacterForm = 'armored';

    attack(attacker: Character, _target: Character): AttackResult {
        const knockbackDirection = attacker.facingRight ? 1 : -1;

        return {
            damage: BASE_ATTACK_DAMAGE * this.damageMultiplier,
            knockback: {
                x: KNOCKBACK_FORCE * 1.5 * knockbackDirection,
                y: -20,
            },
            hitStun: HIT_STUN_DURATION * 1.2,
            particleType: 'earth',
        };
    }

    defend(_character: Character, incomingDamage: number): number {
        return incomingDamage / this.defenseMultiplier;
    }

    getVisualConfig(): VisualConfig {
        return EARTH_VISUAL;
    }

    getParticleType(): 'earth' {
        return 'earth';
    }
}
