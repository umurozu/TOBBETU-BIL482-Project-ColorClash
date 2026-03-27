/**
 * Game Configuration Constants
 * Central location for all game balance and settings
 */

import type { KeyBindings, VisualConfig } from '../types';

// ============================================
// Canvas & Display
// ============================================

export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 576;
export const GROUND_Y = 480; // Ground level for characters

// ============================================
// Character Settings
// ============================================

export const CHARACTER_WIDTH = 80;
export const CHARACTER_HEIGHT = 120;
export const CHARACTER_SPEED = 300; // pixels per second
export const JUMP_FORCE = -500;
export const GRAVITY = 1200;
export const MAX_HEALTH = 100;

// ============================================
// Combat Settings
// ============================================

export const BASE_ATTACK_DAMAGE = 10;
export const ATTACK_RANGE = 100;
export const ATTACK_WIDTH = 80;
export const ATTACK_HEIGHT = 60;
export const ATTACK_DURATION = 300; // milliseconds
export const ATTACK_COOLDOWN = 500; // milliseconds
export const HIT_STUN_DURATION = 200; // milliseconds
export const KNOCKBACK_FORCE = 200;

// ============================================
// Mode Multipliers (Strategy Pattern values)
// ============================================

export const FIRE_MODE = {
    damageMultiplier: 1.5,
    defenseMultiplier: 0.7,
    attackSpeedBonus: 1.2,
} as const;

export const WATER_MODE = {
    damageMultiplier: 0.8,
    defenseMultiplier: 1.5,
    attackSpeedBonus: 0.9,
} as const;

// ============================================
// Visual Configurations
// ============================================

export const FIRE_VISUAL: VisualConfig = {
    primaryColor: '#ff4444',
    secondaryColor: '#ff8800',
    glowColor: 'rgba(255, 68, 68, 0.5)',
    particleColors: ['#ff4444', '#ff8800', '#ffcc00', '#ff6600'],
};

export const WATER_VISUAL: VisualConfig = {
    primaryColor: '#4488ff',
    secondaryColor: '#00ccff',
    glowColor: 'rgba(68, 136, 255, 0.5)',
    particleColors: ['#4488ff', '#00ccff', '#88ddff', '#0088cc'],
};

// ============================================
// Player Starting Positions
// ============================================

export const PLAYER1_START = {
    x: 200,
    y: GROUND_Y - CHARACTER_HEIGHT,
};

export const PLAYER2_START = {
    x: CANVAS_WIDTH - 200 - CHARACTER_WIDTH,
    y: GROUND_Y - CHARACTER_HEIGHT,
};

// ============================================
// Input Key Bindings
// ============================================

export const PLAYER1_KEYS: KeyBindings = {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    attack: 'KeyF',
    switchMode: 'KeyG',
};

export const PLAYER2_KEYS: KeyBindings = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    attack: 'KeyK',
    switchMode: 'KeyL',
};

// ============================================
// Particle System
// ============================================

export const PARTICLE_POOL_SIZE = 100;
export const PARTICLE_DEFAULT_LIFETIME = 500; // milliseconds
export const PARTICLE_DEFAULT_SIZE = 8;

// ============================================
// UI Settings
// ============================================

export const HEALTH_BAR_WIDTH = 300;
export const HEALTH_BAR_HEIGHT = 25;
export const HEALTH_BAR_PADDING = 30;

// ============================================
// Game Loop
// ============================================

export const TARGET_FPS = 60;
export const FIXED_TIMESTEP = 1000 / TARGET_FPS; // ~16.67ms
