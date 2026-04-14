/**
 * Game HUD
 * Contains all UI elements for the game
 */

import type { Character } from '../entities/Character';
import type { IObserver } from '../patterns/observer/Observer';
import type { ElementalMode, ModeChangeEvent, PlayerId } from '../types';
import { CANVAS_HEIGHT, CANVAS_WIDTH, MAX_HEALTH } from '../constants/GameConfig';
import { HealthBar } from './HealthBar';

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
    private playerNames: Map<PlayerId, string> = new Map();

    constructor() {
        // Initialize health bars
        this.healthBars.set('Player1', new HealthBar('Player1', MAX_HEALTH));
        this.healthBars.set('Player2', new HealthBar('Player2', MAX_HEALTH));

        // Fallback values before character subscription
        this.playerModes.set('Player1', 'Fire');
        this.playerModes.set('Player2', 'Fire');
        this.playerNames.set('Player1', 'Player 1');
        this.playerNames.set('Player2', 'Player 2');
        this.healthBars.get('Player1')?.setDisplayName('Player 1');
        this.healthBars.get('Player2')?.setDisplayName('Player 2');
    }

    /**
     * Subscribe to character events
     */
    subscribeToCharacter(character: Character): void {
        const healthBar = this.healthBars.get(character.playerId);
        if (healthBar) {
            character.attach(healthBar);
            healthBar.sync(character.health, character.maxHealth);
            healthBar.setDisplayName(
                this.playerNames.get(character.playerId) ??
                (character.playerId === 'Player1' ? 'Player 1' : 'Player 2')
            );
        }

        this.playerModes.set(character.playerId, character.getModeName());

        // Subscribe to mode changes
        character.attach(this);
    }

    /**
     * Update names displayed by HUD.
     */
    setPlayerDisplayNames(names: Partial<Record<PlayerId, string>>): void {
        const p1 = names.Player1?.trim() || 'Player 1';
        const p2 = names.Player2?.trim() || 'Player 2';

        this.playerNames.set('Player1', p1);
        this.playerNames.set('Player2', p2);

        this.healthBars.get('Player1')?.setDisplayName(p1);
        this.healthBars.get('Player2')?.setDisplayName(p2);
    }

    /**
     * Observer update for mode changes
     */
    update(data: ModeChangeEvent): void {
        this.playerModes.set(data.playerId, data.newMode);
        this.addModeSwitchEffect(
            data.playerId === 'Player1' ? 55 : CANVAS_WIDTH - 55,
            82,
            data.newMode
        );
    }

    /**
     * Update HUD animations
     */
    tick(deltaTime: number): void {
        this.healthBars.forEach(bar => bar.tick(deltaTime));

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
        this.healthBars.forEach(bar => bar.render(ctx));
        this.renderModeIndicators(ctx);
        this.renderModeSwitchEffects(ctx);
        this.renderGameInfo(ctx);
    }

    /**
     * Render mode indicators for both players
     */
    private renderModeIndicators(ctx: CanvasRenderingContext2D): void {
        const y = 70;
        this.renderModeIndicator(ctx, 30, y, 'Player1');
        this.renderModeIndicator(ctx, CANVAS_WIDTH - 80, y, 'Player2');
    }

    /**
     * Render single mode indicator
     */
    private renderModeIndicator(ctx: CanvasRenderingContext2D, x: number, y: number, playerId: PlayerId): void {
        const mode = this.playerModes.get(playerId) ?? 'Fire';
        const modeColor = this.getModeColor(mode);
        const modeLabel = this.getModeLabel(mode);

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, 50, 25);

        ctx.fillStyle = modeColor;
        ctx.shadowColor = modeColor;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(x + 15, y + 12.5, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(modeLabel, x + 25, y + 17);
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
            const color = this.getModeColor(effect.mode);
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
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ELEMENTAL DUEL', CANVAS_WIDTH / 2, 30);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '11px Arial';
        ctx.fillText(
            'WASD + F/G (Left Player) | Arrows + K/L (Right Player) | ESC: Back to Setup',
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

    private getModeColor(mode: ElementalMode): string {
        switch (mode) {
            case 'Fire':
                return '#ff4444';
            case 'Water':
                return '#4488ff';
            case 'Earth':
                return '#8d6e63';
            case 'Wind':
                return '#81d4fa';
            case 'Light':
                return '#ffd54f';
            case 'Dark':
                return '#455a64';
            default:
                return '#ffffff';
        }
    }

    private getModeLabel(mode: ElementalMode): string {
        switch (mode) {
            case 'Fire':
                return 'FI';
            case 'Water':
                return 'WA';
            case 'Earth':
                return 'EA';
            case 'Wind':
                return 'WI';
            case 'Light':
                return 'LI';
            case 'Dark':
                return 'DK';
            default:
                return '--';
        }
    }

    /**
     * Reset HUD
     */
    reset(): void {
        this.healthBars.forEach(bar => bar.reset());
        this.modeSwitchEffects = [];
    }
}
