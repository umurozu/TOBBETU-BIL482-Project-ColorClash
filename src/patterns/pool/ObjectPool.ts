/**
 * Object Pool Pattern
 * Reuses objects to avoid garbage collection spikes during combat
 */

import type { IPoolable } from '../../types';

/**
 * Generic object pool for any poolable type
 */
export class ObjectPool<T extends IPoolable> {
    private pool: T[] = [];
    private activeObjects: Set<T> = new Set();

    constructor(
        private readonly factory: () => T,
        private readonly initialSize: number = 10
    ) {
        this.prewarm(initialSize);
    }

    /**
     * Pre-allocate objects to avoid runtime allocation
     */
    prewarm(count: number): void {
        for (let i = 0; i < count; i++) {
            const obj = this.factory();
            obj.active = false;
            this.pool.push(obj);
        }
    }

    /**
     * Get an object from the pool
     * Creates new if pool is empty
     */
    acquire(): T {
        let obj: T;

        if (this.pool.length > 0) {
            obj = this.pool.pop()!;
        } else {
            // Pool exhausted, create new object
            obj = this.factory();
        }

        obj.active = true;
        obj.reset();
        this.activeObjects.add(obj);

        return obj;
    }

    /**
     * Return an object to the pool
     */
    release(obj: T): void {
        if (!this.activeObjects.has(obj)) {
            return; // Not from this pool
        }

        obj.active = false;
        this.activeObjects.delete(obj);
        this.pool.push(obj);
    }

    /**
     * Release all active objects back to pool
     */
    releaseAll(): void {
        this.activeObjects.forEach(obj => {
            obj.active = false;
            this.pool.push(obj);
        });
        this.activeObjects.clear();
    }

    /**
     * Get all currently active objects
     */
    getActiveObjects(): ReadonlySet<T> {
        return this.activeObjects;
    }

    /**
     * Get count of available objects in pool
     */
    getAvailableCount(): number {
        return this.pool.length;
    }

    /**
     * Get count of active objects
     */
    getActiveCount(): number {
        return this.activeObjects.size;
    }
}
