/**
 * Game Engine - Singleton Pattern
 * Central orchestrator for the game loop, rendering, and game state
 */

import { Character } from '../entities/Character';
import { CharacterFactory } from '../patterns/factory/CharacterFactory';
import { InputHandler } from '../systems/InputHandler';
import { ParticleSystem } from '../systems/ParticleSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { GameHUD } from '../ui/GameHUD';
import type { GameState, PlayerId } from '../types';
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GROUND_Y,
    PLAYER1_START,
    PLAYER2_START
} from '../constants/GameConfig';

/**
 * GameEngine Singleton
 * Manages the game loop, state, and all subsystems
 */
export class GameEngine {
    // Singleton instance
    private static instance: GameEngine | null = null;

    // Canvas and rendering
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    // Game Loop
    private isRunning = false;
    private lastTime = 0;
    private animationFrameId: number | null = null;

    // Game objects
    private player1: Character | null = null;
    private player2: Character | null = null;

    // Systems
    private inputHandler: InputHandler;
    private particleSystem: ParticleSystem;
    private hud: GameHUD;

    // Game state
    private gameState: GameState = {
        isRunning: false,
        isPaused: false,
        winner: null,
        roundTime: 0,
    };

    // Performance tracking
    private fps = 0;
    private frameCount = 0;
    private fpsUpdateTime = 0;

    /**
     * Private constructor for Singleton pattern
     */
    private constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = context;

        // Set canvas size
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        // Initialize systems
        this.inputHandler = new InputHandler();
        this.particleSystem = new ParticleSystem();
        this.hud = new GameHUD();

        // Bind game loop
        this.gameLoop = this.gameLoop.bind(this);
    }

    /**
     * Get or create the singleton instance
     */
    static getInstance(canvas?: HTMLCanvasElement): GameEngine {
        if (!GameEngine.instance) {
            if (!canvas) {
                throw new Error('Canvas required for first initialization');
            }
            GameEngine.instance = new GameEngine(canvas);
        }
        return GameEngine.instance;
    }

    /**
     * Initialize the game
     */
    init(): void {
        // Create players using Factory pattern
        [this.player1, this.player2] = CharacterFactory.createMatchPlayers();

        // Register players with input handler
        this.inputHandler.registerPlayer(this.player1);
        this.inputHandler.registerPlayer(this.player2);

        // Subscribe HUD to player events (Observer pattern)
        this.hud.subscribeToCharacter(this.player1);
        this.hud.subscribeToCharacter(this.player2);

        // Reset game state
        this.gameState = {
            isRunning: true,
            isPaused: false,
            winner: null,
            roundTime: 0,
        };

        console.log('Game initialized');
        console.log('Player 1: WASD to move, F to attack, G to switch mode');
        console.log('Player 2: Arrow keys to move, K to attack, L to switch mode');
    }

    /**
     * Start the game loop
     */
    start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);

        console.log('Game started');
    }

    /**
     * Stop the game loop
     */
    stop(): void {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Main game loop with delta time calculation
     */
    private gameLoop(currentTime: number): void {
        if (!this.isRunning) return;

        // Calculate delta time in seconds
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent spiral of death
        const cappedDelta = Math.min(deltaTime, 0.1);

        // Update FPS counter
        this.updateFPS(currentTime);

        // Game update
        if (!this.gameState.isPaused) {
            this.update(cappedDelta);
        }

        // Render
        this.render();

        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    /**
     * Update game logic
     */
    private update(deltaTime: number): void {
        if (!this.player1 || !this.player2) return;

        // Update round time
        this.gameState.roundTime += deltaTime;

        // Update players
        this.player1.update(deltaTime);
        this.player2.update(deltaTime);

        // Resolve character-to-character collision
        CollisionSystem.resolveCharacterCollision(this.player1, this.player2);

        // Update particle system
        this.particleSystem.update(deltaTime);

        // Update HUD
        this.hud.tick(deltaTime);

        // Spawn particles on hit
        this.checkAndSpawnHitParticles();

        // Check for victory
        this.checkVictory();
    }

    /**
     * Check for hits and spawn particles
     */
    private checkAndSpawnHitParticles(): void {
        if (!this.player1 || !this.player2) return;

        // Check Player 1 attack hitting Player 2
        const p1Hitbox = this.player1.getAttackHitbox();
        if (p1Hitbox && p1Hitbox.active) {
            const hitPoint = CollisionSystem.getCollisionPoint(
                p1Hitbox.getRect(),
                this.player2.getHurtbox()
            );
            if (hitPoint) {
                this.particleSystem.spawnHitEffect(
                    hitPoint,
                    this.player1.getElementalMode().getParticleType()
                );
            }
        }

        // Check Player 2 attack hitting Player 1
        const p2Hitbox = this.player2.getAttackHitbox();
        if (p2Hitbox && p2Hitbox.active) {
            const hitPoint = CollisionSystem.getCollisionPoint(
                p2Hitbox.getRect(),
                this.player1.getHurtbox()
            );
            if (hitPoint) {
                this.particleSystem.spawnHitEffect(
                    hitPoint,
                    this.player2.getElementalMode().getParticleType()
                );
            }
        }
    }

    /**
     * Check for victory condition
     */
    private checkVictory(): void {
        if (!this.player1 || !this.player2) return;

        if (this.player1.isDefeated() && !this.gameState.winner) {
            this.gameState.winner = 'Player2';
            this.showVictory('Player2');
        } else if (this.player2.isDefeated() && !this.gameState.winner) {
            this.gameState.winner = 'Player1';
            this.showVictory('Player1');
        }
    }

    /**
     * Show victory screen
     */
    private showVictory(winner: PlayerId): void {
        console.log(`${winner} wins!`);

        // Auto restart after delay
        setTimeout(() => {
            this.restart();
        }, 3000);
    }

    /**
     * Restart the game
     */
    restart(): void {
        if (!this.player1 || !this.player2) return;

        // Reset players
        this.player1.reset(PLAYER1_START);
        this.player2.reset(PLAYER2_START);

        // Reset systems
        this.particleSystem.clear();
        this.hud.reset();

        // Reset game state
        this.gameState = {
            isRunning: true,
            isPaused: false,
            winner: null,
            roundTime: 0,
        };

        console.log('Game restarted');
    }

    /**
     * Render the game
     */
    private render(): void {
        // Clear canvas
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw background
        this.renderBackground();

        // Draw arena
        this.renderArena();

        // Draw particles (behind characters)
        this.particleSystem.render(this.ctx);

        // Draw players
        if (this.player1) this.player1.render(this.ctx);
        if (this.player2) this.player2.render(this.ctx);

        // Draw HUD
        this.hud.render(this.ctx);

        // Draw victory overlay if game over
        if (this.gameState.winner) {
            this.renderVictoryOverlay();
        }

        // Draw debug info
        this.renderDebugInfo();
    }

    /**
     * Render background gradient
     */
    private renderBackground(): void {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    /**
     * Render arena/ground
     */
    private renderArena(): void {
        // Ground
        const groundGradient = this.ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
        groundGradient.addColorStop(0, '#2d1b4e');
        groundGradient.addColorStop(1, '#1a1a2e');

        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

        // Ground line
        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#4ecdc4';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(0, GROUND_Y);
        this.ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Arena boundaries (decorative)
        this.ctx.strokeStyle = 'rgba(78, 205, 196, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);

        // Left boundary
        this.ctx.beginPath();
        this.ctx.moveTo(50, GROUND_Y - 200);
        this.ctx.lineTo(50, GROUND_Y);
        this.ctx.stroke();

        // Right boundary
        this.ctx.beginPath();
        this.ctx.moveTo(CANVAS_WIDTH - 50, GROUND_Y - 200);
        this.ctx.lineTo(CANVAS_WIDTH - 50, GROUND_Y);
        this.ctx.stroke();

        this.ctx.setLineDash([]);
    }

    /**
     * Render victory overlay
     */
    private renderVictoryOverlay(): void {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Victory text
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = this.gameState.winner === 'Player1' ? '#ff6b6b' : '#4ecdc4';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText(
            `${this.gameState.winner} WINS!`,
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2
        );

        // Restart message
        this.ctx.font = '20px Arial';
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText(
            'Restarting in 3 seconds...',
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 + 50
        );
        this.ctx.restore();
    }

    /**
     * Render debug information
     */
    private renderDebugInfo(): void {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'right';

        const particleInfo = this.particleSystem.getDebugInfo();
        this.ctx.fillText(
            `FPS: ${this.fps} | Particles: ${particleInfo.active}/${particleInfo.pooled + particleInfo.active}`,
            CANVAS_WIDTH - 10,
            CANVAS_HEIGHT - 35
        );

        if (this.player1 && this.player2) {
            this.ctx.fillText(
                `P1: ${this.player1.getStateName()} (${this.player1.getModeName()}) | P2: ${this.player2.getStateName()} (${this.player2.getModeName()})`,
                CANVAS_WIDTH - 10,
                CANVAS_HEIGHT - 50
            );
        }

        this.ctx.restore();
    }

    /**
     * Update FPS counter
     */
    private updateFPS(currentTime: number): void {
        this.frameCount++;

        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    }

    /**
     * Get canvas element
     */
    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    /**
     * Get rendering context
     */
    getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    /**
     * Get game state
     */
    getGameState(): GameState {
        return { ...this.gameState };
    }

    /**
     * Pause/unpause the game
     */
    togglePause(): void {
        this.gameState.isPaused = !this.gameState.isPaused;
        console.log(this.gameState.isPaused ? 'Game paused' : 'Game resumed');
    }

    /**
     * Cleanup
     */
    destroy(): void {
        this.stop();
        this.inputHandler.destroy();
        GameEngine.instance = null;
    }
}
