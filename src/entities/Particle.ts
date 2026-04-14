/**
 * Particle Entity
 * Visual effect particle for combat feedback
 * Implements IPoolable for object pooling
 */

import type { IPoolable, ParticleType } from '../types';

export class Particle implements IPoolable {
    active = false;

    x = 0;
    y = 0;
    velocityX = 0;
    velocityY = 0;
    size = 8;
    color = '#ffffff';
    alpha = 1;
    lifetime = 0;
    maxLifetime = 500;
    type: ParticleType = 'spark';

    // Visual variation
    rotation = 0;
    rotationSpeed = 0;
    scale = 1;
    scaleDecay = 0.98;

    reset(): void {
        this.x = 0;
        this.y = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.size = 8;
        this.color = '#ffffff';
        this.alpha = 1;
        this.lifetime = 0;
        this.maxLifetime = 500;
        this.type = 'spark';
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.scale = 1;
        this.scaleDecay = 0.98;
    }

    /**
     * Initialize particle with configuration
     */
    init(
        x: number,
        y: number,
        velocityX: number,
        velocityY: number,
        color: string,
        type: ParticleType,
        lifetime: number = 500,
        size: number = 8
    ): void {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
        this.type = type;
        this.lifetime = 0;
        this.maxLifetime = lifetime;
        this.size = size;
        this.alpha = 1;
        this.scale = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
    }

    /**
     * Update particle physics and lifetime
     * @returns true if particle is still alive
     */
    update(deltaTime: number): boolean {
        if (!this.active) return false;

        this.lifetime += deltaTime * 1000;

        // Check if expired
        if (this.lifetime >= this.maxLifetime) {
            this.active = false;
            return false;
        }

        // Update physics
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        // Apply gravity based on type
        if (this.type === 'fire') {
            this.velocityY -= 50 * deltaTime; // Rise up
            this.velocityX *= 0.99;
        } else if (this.type === 'wind') {
            this.velocityY += 45 * deltaTime; // Glide slowly downward
            this.velocityX *= 1.01;
        } else if (this.type === 'light') {
            this.velocityY -= 20 * deltaTime;
            this.velocityX *= 1.015;
        } else if (this.type === 'dark') {
            this.velocityY += 130 * deltaTime;
            this.velocityX *= 0.95;
        } else if (this.type === 'earth') {
            this.velocityY += 280 * deltaTime; // Heavy fall
            this.velocityX *= 0.93;
        } else {
            this.velocityY += 200 * deltaTime; // Fall down
            this.velocityX *= 0.98;
        }

        // Update visual properties
        this.rotation += this.rotationSpeed * deltaTime;
        this.scale *= this.scaleDecay;
        this.alpha = 1 - (this.lifetime / this.maxLifetime);

        return true;
    }

    /**
     * Render particle to canvas
     */
    render(ctx: CanvasRenderingContext2D): void {
        if (!this.active || this.alpha <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;

        const renderSize = this.size * this.scale;

        // Different rendering based on particle type
        switch (this.type) {
            case 'fire':
                // Fire: Glowing circle with gradient
                const fireGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, renderSize);
                fireGradient.addColorStop(0, this.color);
                fireGradient.addColorStop(0.5, this.color);
                fireGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = fireGradient;
                ctx.beginPath();
                ctx.arc(0, 0, renderSize, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'water':
                // Water: Teardrop shape
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, renderSize * 0.6, 0, Math.PI * 2);
                ctx.fill();
                // Add highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(-renderSize * 0.2, -renderSize * 0.2, renderSize * 0.2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'earth':
                // Earth: rock chunks
                ctx.fillStyle = this.color;
                ctx.fillRect(-renderSize * 0.6, -renderSize * 0.6, renderSize * 1.2, renderSize * 1.2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(-renderSize * 0.4, -renderSize * 0.4, renderSize * 0.5, renderSize * 0.5);
                break;

            case 'wind':
                // Wind: streak
                ctx.strokeStyle = this.color;
                ctx.lineWidth = Math.max(1, renderSize * 0.25);
                ctx.beginPath();
                ctx.moveTo(-renderSize, 0);
                ctx.quadraticCurveTo(0, -renderSize * 0.4, renderSize, 0);
                ctx.stroke();
                break;

            case 'light':
                // Light: thin beam shard
                ctx.strokeStyle = this.color;
                ctx.lineWidth = Math.max(1, renderSize * 0.2);
                ctx.beginPath();
                ctx.moveTo(-renderSize, -renderSize * 0.2);
                ctx.lineTo(renderSize, renderSize * 0.2);
                ctx.stroke();
                break;

            case 'dark':
                // Dark: dense orb
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, renderSize * 0.65, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                ctx.beginPath();
                ctx.arc(renderSize * 0.2, renderSize * 0.1, renderSize * 0.3, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'hit':
                // Hit: Star burst
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                    const outerX = Math.cos(angle) * renderSize;
                    const outerY = Math.sin(angle) * renderSize;
                    const innerAngle = angle + Math.PI / 5;
                    const innerX = Math.cos(innerAngle) * renderSize * 0.4;
                    const innerY = Math.sin(innerAngle) * renderSize * 0.4;

                    if (i === 0) {
                        ctx.moveTo(outerX, outerY);
                    } else {
                        ctx.lineTo(outerX, outerY);
                    }
                    ctx.lineTo(innerX, innerY);
                }
                ctx.closePath();
                ctx.fill();
                break;

            default:
                // Spark: Simple square
                ctx.fillStyle = this.color;
                ctx.fillRect(-renderSize / 2, -renderSize / 2, renderSize, renderSize);
        }

        ctx.restore();
    }
}
