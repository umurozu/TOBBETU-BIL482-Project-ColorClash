/**
 * Main Entry Point
 * Initializes and starts the fighting game
 */

import { GameEngine } from './core/GameEngine';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

/**
 * Initialize the game
 */
function initGame(): void {
    // Get canvas element
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    try {
        // Create game engine singleton
        const engine = GameEngine.getInstance(canvas);

        // Initialize game (creates players, sets up systems)
        engine.init();

        // Start the game loop
        engine.start();

        // Log startup info
        console.log('%c⚔️ Elemental Fighter Loaded! ⚔️', 'color: #4ecdc4; font-size: 20px; font-weight: bold;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff6b6b;');
        console.log('%cControls:', 'color: #ffcc00; font-weight: bold;');
        console.log('%c  Player 1: WASD (move) | F (attack) | G (switch mode)', 'color: #ff6b6b;');
        console.log('%c  Player 2: Arrows (move) | K (attack) | L (switch mode)', 'color: #4ecdc4;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff6b6b;');
        console.log('%c🔥 Fire Mode = High Damage | 💧 Water Mode = High Defense', 'color: #ffffff;');

        // Add keyboard shortcut for restart
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR') {
                engine.restart();
            }
            if (e.code === 'KeyP') {
                engine.togglePause();
            }
        });

        // Expose engine to window for debugging
        (window as unknown as { gameEngine: GameEngine }).gameEngine = engine;

    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
}
