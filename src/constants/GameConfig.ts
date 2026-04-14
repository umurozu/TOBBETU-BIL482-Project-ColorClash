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
    moveSpeedMultiplier: 1.0,
    jumpForceMultiplier: 1.0,
    gravityMultiplier: 1.0,
    canFly: false,
    flightLift: 0,
} as const;

export const WATER_MODE = {
    damageMultiplier: 0.8,
    defenseMultiplier: 1.5,
    attackSpeedBonus: 0.9,
    moveSpeedMultiplier: 0.95,
    jumpForceMultiplier: 1.05,
    gravityMultiplier: 0.9,
    canFly: false,
    flightLift: 0,
} as const;

export const EARTH_MODE = {
    damageMultiplier: 1.2,
    defenseMultiplier: 1.9,
    attackSpeedBonus: 0.8,
    moveSpeedMultiplier: 0.8,
    jumpForceMultiplier: 0.85,
    gravityMultiplier: 1.1,
    canFly: false,
    flightLift: 0,
} as const;

export const WIND_MODE = {
    damageMultiplier: 0.9,
    defenseMultiplier: 1.1,
    attackSpeedBonus: 1.4,
    moveSpeedMultiplier: 1.35,
    jumpForceMultiplier: 1.2,
    gravityMultiplier: 0.45,
    canFly: true,
    flightLift: 180,
} as const;

export const LIGHT_MODE = {
    damageMultiplier: 0.65,
    defenseMultiplier: 0.9,
    attackSpeedBonus: 1.0,
    moveSpeedMultiplier: 1.05,
    jumpForceMultiplier: 1.0,
    gravityMultiplier: 0.95,
    canFly: false,
    flightLift: 0,
    attackRangeMultiplier: 4.2,
    attackHeightMultiplier: 0.45,
} as const;

export const DARK_MODE = {
    damageMultiplier: 0.85,
    defenseMultiplier: 2.0,
    attackSpeedBonus: 0.85,
    moveSpeedMultiplier: 0.9,
    jumpForceMultiplier: 1.0,
    gravityMultiplier: 1.0,
    canFly: false,
    flightLift: 0,
    attackRangeMultiplier: 1.1,
    attackHeightMultiplier: 1.0,
} as const;

export const ABSORBED_DAMAGE_BONUS_CAP = 35;

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

export const EARTH_VISUAL: VisualConfig = {
    primaryColor: '#8d6e63',
    secondaryColor: '#a1887f',
    glowColor: 'rgba(141, 110, 99, 0.5)',
    particleColors: ['#6d4c41', '#8d6e63', '#a1887f', '#bcaaa4'],
};

export const WIND_VISUAL: VisualConfig = {
    primaryColor: '#b3e5fc',
    secondaryColor: '#81d4fa',
    glowColor: 'rgba(129, 212, 250, 0.55)',
    particleColors: ['#e1f5fe', '#b3e5fc', '#81d4fa', '#4fc3f7'],
};

export const LIGHT_VISUAL: VisualConfig = {
    primaryColor: '#fff59d',
    secondaryColor: '#ffd54f',
    glowColor: 'rgba(255, 245, 157, 0.65)',
    particleColors: ['#fffde7', '#fff59d', '#ffe082', '#ffd54f'],
};

export const DARK_VISUAL: VisualConfig = {
    primaryColor: '#263238',
    secondaryColor: '#455a64',
    glowColor: 'rgba(69, 90, 100, 0.7)',
    particleColors: ['#263238', '#37474f', '#455a64', '#607d8b'],
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
