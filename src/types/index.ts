/**
 * Core type definitions for the Fighting Game
 */

// ============================================
// Vector and Position Types
// ============================================

export interface Vector2 {
    x: number;
    y: number;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

// ============================================
// Player Types
// ============================================

export type PlayerId = 'Player1' | 'Player2';

export type CharacterType = 'Fighter' | 'Geomancer' | 'Eclipse';

export type ElementalMode = 'Fire' | 'Water' | 'Earth' | 'Wind' | 'Light' | 'Dark';

export type CharacterForm = 'default' | 'armored' | 'fluid' | 'aerial';

export type Direction = 'left' | 'right' | 'up' | 'down' | 'none';

// ============================================
// State Types
// ============================================

export type CharacterStateName = 'idle' | 'move' | 'attack' | 'hit' | 'block';

// ============================================
// Command Types
// ============================================

export type CommandType = 'move' | 'attack' | 'switchMode' | 'block';

export interface MoveDirection {
    horizontal: Direction;
    vertical: Direction;
}

// ============================================
// Combat Types
// ============================================

export interface AttackResult {
    damage: number;
    knockback: Vector2;
    hitStun: number;
    particleType: ParticleType;
}

export interface DamageInfo {
    amount: number;
    source: PlayerId;
    knockback: Vector2;
    hitStun: number;
}

// ============================================
// Visual Types
// ============================================

export interface VisualConfig {
    primaryColor: string;
    secondaryColor: string;
    glowColor: string;
    particleColors: string[];
}

export type ParticleType = 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'dark' | 'hit' | 'spark';

export interface ParticleConfig {
    x: number;
    y: number;
    type: ParticleType;
    velocityX: number;
    velocityY: number;
    lifetime: number;
    size: number;
    color: string;
}

// ============================================
// Input Types
// ============================================

export interface KeyBindings {
    up: string;
    down: string;
    left: string;
    right: string;
    attack: string;
    switchMode: string;
}

export interface InputState {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    attack: boolean;
    switchMode: boolean;
}

export interface CharacterSelectionOption {
    type: CharacterType;
    name: string;
    description: string;
    modes: [ElementalMode, ElementalMode];
}

export interface MatchCharacterSelection {
    Player1: CharacterType;
    Player2: CharacterType;
}

// ============================================
// Health Event Types (for Observer Pattern)
// ============================================

export interface HealthChangeEvent {
    playerId: PlayerId;
    currentHealth: number;
    maxHealth: number;
    damage: number;
}

export interface ModeChangeEvent {
    playerId: PlayerId;
    newMode: ElementalMode;
}

// ============================================
// Object Pool Interface
// ============================================

export interface IPoolable {
    active: boolean;
    reset(): void;
}

// ============================================
// Game State
// ============================================

export interface GameState {
    isRunning: boolean;
    isPaused: boolean;
    winner: PlayerId | null;
    roundTime: number;
}
