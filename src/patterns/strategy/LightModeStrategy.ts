/**
 * Light Mode Strategy
 * Long-range beam stance with low base damage.
 * Damage absorbed in Dark mode is converted into bonus beam damage.
 */

import type { IElementalMode } from './IElementalMode';
import type { Character } from '../../entities/Character';
import type { AttackResult, CharacterForm, VisualConfig } from '../../types';
import {
    BASE_ATTACK_DAMAGE,
    HIT_STUN_DURATION,
    KNOCKBACK_FORCE,
    LIGHT_MODE,
    LIGHT_VISUAL
} from '../../constants/GameConfig';

export class LightModeStrategy implements IElementalMode {
    readonly name = 'Light';
    readonly color = LIGHT_VISUAL.primaryColor;
    readonly damageMultiplier = LIGHT_MODE.damageMultiplier;
    readonly defenseMultiplier = LIGHT_MODE.defenseMultiplier;
    readonly attackSpeedMultiplier = LIGHT_MODE.attackSpeedBonus;
    readonly attackRangeMultiplier = LIGHT_MODE.attackRangeMultiplier;
    readonly attackHeightMultiplier = LIGHT_MODE.attackHeightMultiplier;
    readonly attackEffect = 'beam' as const;
    readonly moveSpeedMultiplier = LIGHT_MODE.moveSpeedMultiplier;
    readonly jumpForceMultiplier = LIGHT_MODE.jumpForceMultiplier;
    readonly gravityMultiplier = LIGHT_MODE.gravityMultiplier;
    readonly canFly = LIGHT_MODE.canFly;
    readonly flightLift = LIGHT_MODE.flightLift;
    readonly form: CharacterForm = 'aerial';

    attack(attacker: Character, _target: Character): AttackResult {
        const knockbackDirection = attacker.facingRight ? 1 : -1;
        const absorbedBonusDamage = attacker.consumeAbsorbedDamageBonus();

        return {
            damage: BASE_ATTACK_DAMAGE * this.damageMultiplier + absorbedBonusDamage,
            knockback: {
                x: KNOCKBACK_FORCE * 0.9 * knockbackDirection,
                y: -15,
            },
            hitStun: HIT_STUN_DURATION * 0.75,
            particleType: 'light',
        };
    }

    defend(_character: Character, incomingDamage: number): number {
        return incomingDamage / this.defenseMultiplier;
    }

    getVisualConfig(): VisualConfig {
        return LIGHT_VISUAL;
    }

    getParticleType(): 'light' {
        return 'light';
    }
}
