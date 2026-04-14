/**
 * Factory Method Pattern - CharacterFactory
 * Creates player characters with proper initialization
 */

import { Character } from '../../entities/Character';
import type {
    CharacterSelectionOption,
    CharacterType,
    PlayerId,
    Vector2
} from '../../types';
import {
    DarkModeStrategy,
    EarthModeStrategy,
    FireModeStrategy,
    type IElementalMode,
    LightModeStrategy,
    WaterModeStrategy,
    WindModeStrategy
} from '../strategy';
import {
    PLAYER1_START,
    PLAYER2_START,
    PLAYER1_KEYS,
    PLAYER2_KEYS
} from '../../constants/GameConfig';

interface CharacterBlueprint {
    type: CharacterType;
    name: string;
    description: string;
    modes: CharacterSelectionOption['modes'];
    createModes(): [IElementalMode, IElementalMode];
}

const CHARACTER_BLUEPRINTS: Record<CharacterType, CharacterBlueprint> = {
    Fighter: {
        type: 'Fighter',
        name: 'Elemental Fighter',
        description: 'Classic balanced duelist with Fire / Water stance play.',
        modes: ['Fire', 'Water'],
        createModes: () => [new FireModeStrategy(), new WaterModeStrategy()],
    },
    Geomancer: {
        type: 'Geomancer',
        name: 'Geo Tempest',
        description: 'Earth / Wind specialist. Wind can glide and control air.',
        modes: ['Earth', 'Wind'],
        createModes: () => [new EarthModeStrategy(), new WindModeStrategy()],
    },
    Eclipse: {
        type: 'Eclipse',
        name: 'Eclipse Warden',
        description: 'Light / Dark specialist. Dark absorbs damage to empower Light beam.',
        modes: ['Light', 'Dark'],
        createModes: () => [new LightModeStrategy(), new DarkModeStrategy()],
    },
};

export class CharacterFactory {
    private static readonly CHARACTER_TYPES: CharacterType[] = ['Fighter', 'Geomancer', 'Eclipse'];

    static isCharacterType(value: string): value is CharacterType {
        return CharacterFactory.CHARACTER_TYPES.includes(value as CharacterType);
    }

    static getCharacterRoster(): CharacterSelectionOption[] {
        return CharacterFactory.CHARACTER_TYPES.map(type => {
            const blueprint = CHARACTER_BLUEPRINTS[type];
            return {
                type: blueprint.type,
                name: blueprint.name,
                description: blueprint.description,
                modes: blueprint.modes,
            };
        });
    }

    static getCharacterName(type: CharacterType): string {
        return CHARACTER_BLUEPRINTS[type].name;
    }

    /**
     * Create a player character
     * @param playerId - Player identifier (Player1 or Player2)
     * @param characterType - Character archetype
     * @param customPosition - Optional custom starting position
     */
    static createPlayer(
        playerId: PlayerId,
        characterType: CharacterType = 'Fighter',
        customPosition?: Vector2
    ): Character {
        const blueprint = CHARACTER_BLUEPRINTS[characterType];

        // Determine starting position
        const position = customPosition ??
            (playerId === 'Player1' ? PLAYER1_START : PLAYER2_START);

        // Determine key bindings
        const keyBindings = playerId === 'Player1' ? PLAYER1_KEYS : PLAYER2_KEYS;

        // Determine facing direction
        const facingRight = playerId === 'Player1';

        // Create and return the character
        const character = new Character(
            playerId,
            characterType,
            { x: position.x, y: position.y },
            keyBindings,
            facingRight,
            blueprint.createModes()
        );

        return character;
    }

    /**
     * Create both players for a match
     */
    static createMatchPlayers(
        player1Type: CharacterType = 'Fighter',
        player2Type: CharacterType = 'Fighter'
    ): [Character, Character] {
        const player1 = CharacterFactory.createPlayer('Player1', player1Type);
        const player2 = CharacterFactory.createPlayer('Player2', player2Type);

        // Set opponents
        player1.setOpponent(player2);
        player2.setOpponent(player1);

        return [player1, player2];
    }
}
