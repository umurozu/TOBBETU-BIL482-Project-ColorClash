/**
 * Collision System
 * Handles AABB collision detection between game entities
 */

import type { Rectangle } from '../types';
import type { Character } from '../entities/Character';

export class CollisionSystem {
    /**
     * Check AABB collision between two rectangles
     */
    static checkAABB(a: Rectangle, b: Rectangle): boolean {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    /**
     * Check if two characters are colliding (body collision)
     */
    static checkCharacterCollision(a: Character, b: Character): boolean {
        return this.checkAABB(a.getHurtbox(), b.getHurtbox());
    }

    /**
     * Resolve character body collision (push apart)
     */
    static resolveCharacterCollision(a: Character, b: Character): void {
        if (!this.checkCharacterCollision(a, b)) return;

        const aBox = a.getHurtbox();
        const bBox = b.getHurtbox();

        // Calculate overlap
        const overlapX = Math.min(
            aBox.x + aBox.width - bBox.x,
            bBox.x + bBox.width - aBox.x
        );

        // Push characters apart horizontally
        const pushAmount = overlapX / 2;

        if (a.position.x < b.position.x) {
            a.position.x -= pushAmount;
            b.position.x += pushAmount;
        } else {
            a.position.x += pushAmount;
            b.position.x -= pushAmount;
        }
    }

    /**
     * Get collision point between two rectangles
     */
    static getCollisionPoint(a: Rectangle, b: Rectangle): { x: number; y: number } | null {
        if (!this.checkAABB(a, b)) return null;

        // Return center of overlap region
        const overlapX = Math.max(a.x, b.x);
        const overlapY = Math.max(a.y, b.y);
        const overlapRight = Math.min(a.x + a.width, b.x + b.width);
        const overlapBottom = Math.min(a.y + a.height, b.y + b.height);

        return {
            x: (overlapX + overlapRight) / 2,
            y: (overlapY + overlapBottom) / 2,
        };
    }
}
