/**
 * Particle System
 * Manages particle effects using Object Pool pattern
 */

import { Particle } from '../entities/Particle';
import { ObjectPool } from '../patterns/pool/ObjectPool';
import type { ParticleType, Vector2 } from '../types';
import { PARTICLE_POOL_SIZE, FIRE_VISUAL, WATER_VISUAL } from '../constants/GameConfig';

export class ParticleSystem {
    private pool: ObjectPool<Particle>;

    constructor() {
        this.pool = new ObjectPool<Particle>(
            () => new Particle(),
            PARTICLE_POOL_SIZE
        );
    }

    /**
     * Spawn particles at a position
     */
    spawn(
        position: Vector2,
        type: ParticleType,
        count: number = 10
    ): void {
        const colors = this.getColorsForType(type);

        for (let i = 0; i < count; i++) {
            const particle = this.pool.acquire();

            // Random spread
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 150;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed - 100; // Bias upward

            // Random color from palette
            const color = colors[Math.floor(Math.random() * colors.length)] ?? '#ffffff';

            // Random lifetime and size
            const lifetime = 200 + Math.random() * 400;
            const size = 4 + Math.random() * 8;

            particle.init(
                position.x + (Math.random() - 0.5) * 20,
                position.y + (Math.random() - 0.5) * 20,
                velocityX,
                velocityY,
                color,
                type,
                lifetime,
                size
            );
        }
    }

    /**
     * Spawn hit effect particles
     */
    spawnHitEffect(position: Vector2, type: ParticleType): void {
        // Spawn main effect particles
        this.spawn(position, type, 15);

        // Spawn additional spark particles
        this.spawn(position, 'hit', 5);
    }

    /**
     * Get color palette for particle type
     */
    private getColorsForType(type: ParticleType): string[] {
        switch (type) {
            case 'fire':
                return FIRE_VISUAL.particleColors;
            case 'water':
                return WATER_VISUAL.particleColors;
            case 'hit':
                return ['#ffffff', '#ffff00', '#ffcc00'];
            default:
                return ['#ffffff', '#cccccc'];
        }
    }

    /**
     * Update all active particles
     */
    update(deltaTime: number): void {
        const activeParticles = this.pool.getActiveObjects();

        activeParticles.forEach(particle => {
            const alive = particle.update(deltaTime);
            if (!alive) {
                this.pool.release(particle);
            }
        });
    }

    /**
     * Render all active particles
     */
    render(ctx: CanvasRenderingContext2D): void {
        const activeParticles = this.pool.getActiveObjects();

        activeParticles.forEach(particle => {
            particle.render(ctx);
        });
    }

    /**
     * Clear all particles
     */
    clear(): void {
        this.pool.releaseAll();
    }

    /**
     * Get debug info
     */
    getDebugInfo(): { active: number; pooled: number } {
        return {
            active: this.pool.getActiveCount(),
            pooled: this.pool.getAvailableCount(),
        };
    }
}
