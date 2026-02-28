/**
 * Hitbox Entity
 * AABB collision box for attack detection
 * Implements IPoolable for object pooling
 */

import type { IPoolable, Rectangle, Vector2 } from '../types';

export class Hitbox implements IPoolable {
    active = false;

    x = 0;
    y = 0;
    width = 0;
    height = 0;

    ownerId: string = '';
    damage = 0;

    reset(): void {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.ownerId = '';
        this.damage = 0;
    }

    /**
     * Initialize hitbox with given parameters
     */
    init(x: number, y: number, width: number, height: number, ownerId: string, damage: number): void {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ownerId = ownerId;
        this.damage = damage;
    }

    /**
     * Update hitbox position
     */
    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    /**
     * Get rectangle for collision detection
     */
    getRect(): Rectangle {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
    }

    /**
     * AABB collision check with another rectangle
     */
    intersects(other: Rectangle): boolean {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

    /**
     * Get center position
     */
    getCenter(): Vector2 {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
        };
    }
}
