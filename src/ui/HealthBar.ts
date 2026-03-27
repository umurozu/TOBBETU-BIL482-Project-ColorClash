/**
 * Health Bar UI Component
 * Subscribes to character health changes (Observer Pattern)
 */

import type { IObserver } from '../patterns/observer/Observer';
import type { HealthChangeEvent, PlayerId } from '../types';
import {
    HEALTH_BAR_WIDTH,
    HEALTH_BAR_HEIGHT,
    HEALTH_BAR_PADDING,
    CANVAS_WIDTH
} from '../constants/GameConfig';

export class HealthBar implements IObserver<HealthChangeEvent> {
    private currentHealth: number;
    private displayHealth: number; // For smooth animation
    private maxHealth: number;
    private readonly playerId: PlayerId;

    // Position based on player
    private readonly x: number;
    private readonly y: number = HEALTH_BAR_PADDING;

    // Animation
    private readonly animationSpeed = 5;

    // Visual
    private damageFlashAlpha = 0;

    constructor(playerId: PlayerId, maxHealth: number) {
        this.playerId = playerId;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.displayHealth = maxHealth;

        // Position: Player1 on left, Player2 on right
        if (playerId === 'Player1') {
            this.x = HEALTH_BAR_PADDING;
        } else {
            this.x = CANVAS_WIDTH - HEALTH_BAR_WIDTH - HEALTH_BAR_PADDING;
        }
    }

    /**
     * Observer update method - receives health changes
     */
    update(data: HealthChangeEvent): void {
        if ('currentHealth' in data && data.playerId === this.playerId) {
            this.currentHealth = data.currentHealth;
            this.maxHealth = data.maxHealth;

            // Trigger damage flash
            if (data.damage > 0) {
                this.damageFlashAlpha = 1;
            }
        }
    }

    /**
     * Update health bar animation
     */
    tick(deltaTime: number): void {
        // Smooth health bar animation
        if (this.displayHealth !== this.currentHealth) {
            const diff = this.currentHealth - this.displayHealth;
            this.displayHealth += diff * this.animationSpeed * deltaTime;

            // Snap to target when close
            if (Math.abs(diff) < 0.5) {
                this.displayHealth = this.currentHealth;
            }
        }

        // Fade out damage flash
        if (this.damageFlashAlpha > 0) {
            this.damageFlashAlpha -= deltaTime * 3;
            if (this.damageFlashAlpha < 0) {
                this.damageFlashAlpha = 0;
            }
        }
    }

    /**
     * Render health bar
     */
    render(ctx: CanvasRenderingContext2D): void {
        const healthPercent = this.displayHealth / this.maxHealth;
        const healthWidth = HEALTH_BAR_WIDTH * healthPercent;

        ctx.save();

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.x - 2, this.y - 2, HEALTH_BAR_WIDTH + 4, HEALTH_BAR_HEIGHT + 4);

        // Health bar background (empty portion)
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x, this.y, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);

        // Health bar fill with gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + HEALTH_BAR_HEIGHT);

        // Color based on health percentage
        if (healthPercent > 0.5) {
            gradient.addColorStop(0, '#44ff44');
            gradient.addColorStop(1, '#22cc22');
        } else if (healthPercent > 0.25) {
            gradient.addColorStop(0, '#ffcc00');
            gradient.addColorStop(1, '#ff9900');
        } else {
            gradient.addColorStop(0, '#ff4444');
            gradient.addColorStop(1, '#cc2222');
        }

        ctx.fillStyle = gradient;

        // For Player2, fill from right to left
        if (this.playerId === 'Player2') {
            ctx.fillRect(
                this.x + HEALTH_BAR_WIDTH - healthWidth,
                this.y,
                healthWidth,
                HEALTH_BAR_HEIGHT
            );
        } else {
            ctx.fillRect(this.x, this.y, healthWidth, HEALTH_BAR_HEIGHT);
        }

        // Damage flash overlay
        if (this.damageFlashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${this.damageFlashAlpha * 0.5})`;
            ctx.fillRect(this.x, this.y, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);
        }

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);

        // Player label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = this.playerId === 'Player1' ? 'left' : 'right';
        ctx.fillText(
            this.playerId === 'Player1' ? 'P1' : 'P2',
            this.playerId === 'Player1' ? this.x : this.x + HEALTH_BAR_WIDTH,
            this.y + HEALTH_BAR_HEIGHT + 18
        );

        // Health value
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${Math.ceil(this.displayHealth)}/${this.maxHealth}`,
            this.x + HEALTH_BAR_WIDTH / 2,
            this.y + HEALTH_BAR_HEIGHT / 2 + 4
        );

        ctx.restore();
    }

    /**
     * Reset health bar to full
     */
    reset(): void {
        this.currentHealth = this.maxHealth;
        this.displayHealth = this.maxHealth;
        this.damageFlashAlpha = 0;
    }
}
