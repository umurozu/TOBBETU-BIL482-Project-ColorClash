/**
 * Dark Mode Strategy
 * Defensive stance that absorbs a portion of incoming damage and stores it
 * as bonus damage for the next Light beam attack.
 */

import type { IElementalMode } from './IElementalMode';
import type { Character } from '../../entities/Character';
import type { AttackResult, CharacterForm, VisualConfig } from '../../types';
import {
    BASE_ATTACK_DAMAGE,
    DARK_MODE,
    DARK_VISUAL,
    HIT_STUN_DURATION,
    KNOCKBACK_FORCE
} from '../../constants/GameConfig';

export class DarkModeStrategy implements IElementalMode {
    readonly name = 'Dark';
    readonly color = DARK_VISUAL.primaryColor;
    readonly damageMultiplier = DARK_MODE.damageMultiplier;
    readonly defenseMultiplier = DARK_MODE.defenseMultiplier;
    readonly attackSpeedMultiplier = DARK_MODE.attackSpeedBonus;
    readonly attackRangeMultiplier = DARK_MODE.attackRangeMultiplier;
    readonly attackHeightMultiplier = DARK_MODE.attackHeightMultiplier;
    readonly attackEffect = 'slash' as const;
    readonly moveSpeedMultiplier = DARK_MODE.moveSpeedMultiplier;
    readonly jumpForceMultiplier = DARK_MODE.jumpForceMultiplier;
    readonly gravityMultiplier = DARK_MODE.gravityMultiplier;
    readonly canFly = DARK_MODE.canFly;
    readonly flightLift = DARK_MODE.flightLift;
    readonly form: CharacterForm = 'armored';

    attack(attacker: Character, _target: Character): AttackResult {
        const knockbackDirection = attacker.facingRight ? 1 : -1;

        return {
            damage: BASE_ATTACK_DAMAGE * this.damageMultiplier,
            knockback: {
                x: KNOCKBACK_FORCE * knockbackDirection,
                y: -25,
            },
            hitStun: HIT_STUN_DURATION * 0.9,
            particleType: 'dark',
        };
    }

    defend(character: Character, incomingDamage: number): number {
        const reducedDamage = incomingDamage / this.defenseMultiplier;
        const absorbedDamage = Math.max(0, incomingDamage - reducedDamage);
        character.storeAbsorbedDamageBonus(absorbedDamage);
        return reducedDamage;
    }

    getVisualConfig(): VisualConfig {
        return DARK_VISUAL;
    }

    getParticleType(): 'dark' {
        return 'dark';
    }
}
