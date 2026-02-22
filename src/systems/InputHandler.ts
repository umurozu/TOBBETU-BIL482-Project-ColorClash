/**
 * Input Handler System
 * Maps keyboard presses to Command objects (Command Pattern)
 */

import type { Character } from '../entities/Character';
import type { KeyBindings, PlayerId } from '../types';
import { MoveCommand, AttackCommand, SwitchModeCommand, type ICommand } from '../patterns/command/Command';
import { PLAYER1_KEYS, PLAYER2_KEYS } from '../constants/GameConfig';

interface PlayerInput {
    character: Character;
    keyBindings: KeyBindings;
}

/**
 * Input Handler - manages keyboard input and dispatches commands
 */
export class InputHandler {
    private players: Map<PlayerId, PlayerInput> = new Map();
    private keyState: Map<string, boolean> = new Map();
    private switchModePressed: Map<PlayerId, boolean> = new Map();

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Register a player for input handling
     */
    registerPlayer(character: Character): void {
        const keyBindings = character.playerId === 'Player1' ? PLAYER1_KEYS : PLAYER2_KEYS;

        this.players.set(character.playerId, {
            character,
            keyBindings,
        });

        this.switchModePressed.set(character.playerId, false);
    }

    /**
     * Remove a player from input handling
     */
    unregisterPlayer(playerId: PlayerId): void {
        this.players.delete(playerId);
        this.switchModePressed.delete(playerId);
    }

    /**
     * Setup keyboard event listeners
     */
    private setupEventListeners(): void {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    /**
     * Cleanup event listeners
     */
    destroy(): void {
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }

    /**
     * Handle key down events
     */
    private handleKeyDown(event: KeyboardEvent): void {
        // Prevent default for game keys
        if (this.isGameKey(event.code)) {
            event.preventDefault();
        }

        // Track key state
        this.keyState.set(event.code, true);

        // Process input for each player
        this.players.forEach((playerInput, playerId) => {
            const command = this.mapKeyToCommand(event.code, playerInput.keyBindings, true, playerId);
            if (command) {
                command.execute(playerInput.character);
            }
        });
    }

    /**
     * Handle key up events
     */
    private handleKeyUp(event: KeyboardEvent): void {
        // Track key state
        this.keyState.set(event.code, false);

        // Process input for each player
        this.players.forEach((playerInput, playerId) => {
            const command = this.mapKeyToCommand(event.code, playerInput.keyBindings, false, playerId);
            if (command) {
                command.execute(playerInput.character);
            }

            // Reset switch mode flag on key up
            if (event.code === playerInput.keyBindings.switchMode) {
                this.switchModePressed.set(playerId, false);
            }
        });
    }

    /**
     * Map a key code to a command
     */
    private mapKeyToCommand(
        keyCode: string,
        bindings: KeyBindings,
        pressed: boolean,
        playerId: PlayerId
    ): ICommand | null {
        // Movement commands
        if (keyCode === bindings.left) {
            return new MoveCommand('left', pressed);
        }
        if (keyCode === bindings.right) {
            return new MoveCommand('right', pressed);
        }
        if (keyCode === bindings.up) {
            return new MoveCommand('up', pressed);
        }
        if (keyCode === bindings.down) {
            return new MoveCommand('down', pressed);
        }

        // Attack command
        if (keyCode === bindings.attack) {
            return new AttackCommand(pressed);
        }

        // Switch mode command (only on key down, not held)
        if (keyCode === bindings.switchMode && pressed) {
            const wasPressed = this.switchModePressed.get(playerId) ?? false;
            if (!wasPressed) {
                this.switchModePressed.set(playerId, true);
                return new SwitchModeCommand();
            }
        }

        return null;
    }

    /**
     * Check if a key code is a game-related key
     */
    private isGameKey(keyCode: string): boolean {
        const allKeys = [
            ...Object.values(PLAYER1_KEYS),
            ...Object.values(PLAYER2_KEYS),
        ];
        return allKeys.includes(keyCode);
    }

    /**
     * Check if a specific key is currently pressed
     */
    isKeyPressed(keyCode: string): boolean {
        return this.keyState.get(keyCode) ?? false;
    }
}
