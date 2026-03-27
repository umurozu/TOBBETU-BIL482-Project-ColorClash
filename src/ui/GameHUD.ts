/**
 * Game HUD
 * Contains all UI elements for the game
 */

import type { Character } from '../entities/Character';
import type { IObserver } from '../patterns/observer/Observer';
import type { ModeChangeEvent, PlayerId, ElementalMode } from '../types';
import { HealthBar } from './HealthBar';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_HEALTH } from '../constants/GameConfig';

export class GameHUD implements IObserver<ModeChangeEvent> {
    private healthBars: Map<PlayerId, HealthBar> = new Map();
    private modeSwitchEffects: Array<{
        x: number;
        y: number;
        mode: ElementalMode;
        alpha: number;
        scale: number;
    }> = [];

    private playerModes: Map<PlayerId, ElementalMode> = new Map();

    constructor() {
        // Initialize health bars
        this.healthBars.set('Player1', new HealthBar('Player1', MAX_HEALTH));
        this.healthBars.set('Player2', new HealthBar('Player2', MAX_HEALTH));

        // Initial modes
        this.playerModes.set('Player1', 'Fire');
        this.playerModes.set('Player2', 'Fire');
    }

    /**
     * Subscribe to character events
     */
    subscribeToCharacter(character: Character): void {
        const healthBar = this.healthBars.get(character.playerId);
        if (healthBar) {
            character.attach(healthBar);
        }

        // Subscribe to mode changes
        character.attach(this);
    }

    /**
     * Observer update for mode changes
     */
    update(data: ModeChangeEvent): void {
        if ('newMode' in data) {
            this.playerModes.set(data.playerId, data.newMode);
        }
    }

    /**
     * Update HUD animations
     */
    tick(deltaTime: number): void {
        // Update health bars
        this.healthBars.forEach(bar => bar.tick(deltaTime));

        // Update mode switch effects
        this.modeSwitchEffects = this.modeSwitchEffects.filter(effect => {
            effect.alpha -= deltaTime * 2;
            effect.scale += deltaTime * 3;
            return effect.alpha > 0;
        });
    }

    /**
     * Render all HUD elements
     */
    render(ctx: CanvasRenderingContext2D): void {
        // Render health bars
        this.healthBars.forEach(bar => bar.render(ctx));

        // Render mode indicators
        this.renderModeIndicators(ctx);

        // Render mode switch effects
        this.renderModeSwitchEffects(ctx);

        // Render game title/info
        this.renderGameInfo(ctx);
    }

    /**
     * Render mode indicators for both players
     */
    private renderModeIndicators(ctx: CanvasRenderingContext2D): void {
        const y = 70;

        // Player 1 mode (left side)
        this.renderModeIndicator(ctx, 30, y, 'Player1');

        // Player 2 mode (right side)
        this.renderModeIndicator(ctx, CANVAS_WIDTH - 80, y, 'Player2');
    }

    /**
     * Render single mode indicator
     */
    private renderModeIndicator(ctx: CanvasRenderingContext2D, x: number, y: number, playerId: PlayerId): void {
        const mode = this.playerModes.get(playerId) ?? 'Fire';
        const isFireMode = mode === 'Fire';

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, 50, 25);

        // Mode color
        ctx.fillStyle = isFireMode ? '#ff4444' : '#4488ff';
        ctx.shadowColor = isFireMode ? '#ff4444' : '#4488ff';
        ctx.shadowBlur = 10;

        // Mode icon circle
        ctx.beginPath();
        ctx.arc(x + 15, y + 12.5, 8, 0, Math.PI * 2);
        ctx.fill();

        // Mode text
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(isFireMode ? '🔥' : '💧', x + 28, y + 17);

        ctx.restore();
    }

    /**
     * Render mode switch visual effects
     */
    private renderModeSwitchEffects(ctx: CanvasRenderingContext2D): void {
        this.modeSwitchEffects.forEach(effect => {
            ctx.save();
            ctx.globalAlpha = effect.alpha;

            const gradient = ctx.createRadialGradient(
                effect.x, effect.y, 0,
                effect.x, effect.y, 50 * effect.scale
            );

            const color = effect.mode === 'Fire' ? '#ff4444' : '#4488ff';
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 50 * effect.scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    /**
     * Render game info
     */
    private renderGameInfo(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        // Center title
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚔️ FIGHT ⚔️', CANVAS_WIDTH / 2, 30);

        // Instructions at bottom
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '11px Arial';
        ctx.fillText(
            'P1: WASD + F(Attack) + G(Switch) | P2: Arrows + K(Attack) + L(Switch)',
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT - 15
        );

        ctx.restore();
    }

    /**
     * Add mode switch effect
     */
    addModeSwitchEffect(x: number, y: number, mode: ElementalMode): void {
        this.modeSwitchEffects.push({
            x,
            y,
            mode,
            alpha: 1,
            scale: 0.5,
        });
    }

    /**
     * Reset HUD
     */
    reset(): void {
        this.healthBars.forEach(bar => bar.reset());
        this.modeSwitchEffects = [];
        this.playerModes.set('Player1', 'Fire');
        this.playerModes.set('Player2', 'Fire');
    }
}
