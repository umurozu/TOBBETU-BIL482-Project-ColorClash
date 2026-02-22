/**
 * Factory Method Pattern - CharacterFactory
 * Creates player characters with proper initialization
 */

import { Character } from '../../entities/Character';
import type { PlayerId, Vector2 } from '../../types';
import {
    PLAYER1_START,
    PLAYER2_START,
    PLAYER1_KEYS,
    PLAYER2_KEYS
} from '../../constants/GameConfig';

export class CharacterFactory {
    /**
     * Create a player character
     * @param playerId - Player identifier (Player1 or Player2)
     * @param characterType - Character type (for future expansion)
     * @param customPosition - Optional custom starting position
     */
    static createPlayer(
        playerId: PlayerId,
        characterType: string = 'Fighter',
        customPosition?: Vector2
    ): Character {
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
            facingRight
        );

        return character;
    }

    /**
     * Create both players for a match
     */
    static createMatchPlayers(): [Character, Character] {
        const player1 = CharacterFactory.createPlayer('Player1', 'Fighter');
        const player2 = CharacterFactory.createPlayer('Player2', 'Fighter');

        // Set opponents
        player1.setOpponent(player2);
        player2.setOpponent(player1);

        return [player1, player2];
    }
}
