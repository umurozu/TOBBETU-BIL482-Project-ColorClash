/**
 * Character Entity
 * Main player character with Strategy (elemental modes) and State (behavior) patterns
 */

import type {
    PlayerId,
    CharacterType,
    ElementalMode,
    Vector2,
    KeyBindings,
    Rectangle,
    HealthChangeEvent,
    ModeChangeEvent,
    AttackResult
} from '../types';
import type { IElementalMode } from '../patterns/strategy/IElementalMode';
import type { ICharacterState } from '../patterns/state/ICharacterState';
import { IdleState, MoveState, AttackState, HitState } from '../patterns/state';
import { Subject } from '../patterns/observer/Observer';
import { Hitbox } from './Hitbox';
import {
    ABSORBED_DAMAGE_BONUS_CAP,
    CHARACTER_WIDTH,
    CHARACTER_HEIGHT,
    CHARACTER_SPEED,
    GROUND_Y,
    GRAVITY,
    JUMP_FORCE,
    MAX_HEALTH,
    ATTACK_COOLDOWN,
    ATTACK_WIDTH,
    ATTACK_HEIGHT,
    CANVAS_WIDTH
} from '../constants/GameConfig';

/**
 * Input flags set by Command pattern
 */
export interface InputFlags {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    attack: boolean;
    moving: boolean;
}

/**
 * State references for state machine
 */
export interface CharacterStates {
    idle: ICharacterState;
    move: ICharacterState;
    attack: ICharacterState;
    hit: ICharacterState;
}

/**
 * Character class - the main player entity
 * Implements Strategy pattern for elemental modes
 * Implements State pattern for behavior management
 */
export class Character extends Subject<HealthChangeEvent | ModeChangeEvent> {
    // Identity
    readonly playerId: PlayerId;
    readonly characterType: CharacterType;
    readonly keyBindings: KeyBindings;

    // Transform
    position: Vector2;
    velocity: Vector2 = { x: 0, y: 0 };
    readonly width = CHARACTER_WIDTH;
    readonly height = CHARACTER_HEIGHT;
    facingRight: boolean;

    // Combat
    health: number = MAX_HEALTH;
    readonly maxHealth: number = MAX_HEALTH;
    private attackCooldownTimer = 0;
    isAttacking = false;
    isHitStunned = false;
    lastHitStun = 0;
    private attackHitbox: Hitbox | null = null;
    private absorbedDamageBonus = 0;

    // Physics
    isGrounded = true;

    // Strategy Pattern: Current elemental mode
    private elementalMode: IElementalMode;
    private readonly modeStrategies: [IElementalMode, IElementalMode];
    private currentModeIndex = 0;

    // State Pattern: Current state and available states
    private currentState: ICharacterState;
    readonly states: CharacterStates;

    // Input flags (set by Command pattern)
    inputFlags: InputFlags = {
        left: false,
        right: false,
        up: false,
        down: false,
        attack: false,
        moving: false,
    };

    // Reference to opponent for hit detection
    private opponent: Character | null = null;

    constructor(
        playerId: PlayerId,
        characterType: CharacterType,
        position: Vector2,
        keyBindings: KeyBindings,
        facingRight: boolean,
        modes: [IElementalMode, IElementalMode]
    ) {
        super();

        this.playerId = playerId;
        this.characterType = characterType;
        this.position = { ...position };
        this.keyBindings = keyBindings;
        this.facingRight = facingRight;

        // Initialize strategies (Strategy Pattern)
        this.modeStrategies = modes;
        this.elementalMode = this.modeStrategies[0];

        // Initialize states (State Pattern)
        this.states = {
            idle: new IdleState(),
            move: new MoveState(),
            attack: new AttackState(),
            hit: new HitState(),
        };
        this.currentState = this.states.idle;
        this.currentState.enter(this);
    }

    /**
     * Set opponent reference for hit detection
     */
    setOpponent(opponent: Character): void {
        this.opponent = opponent;
    }

    /**
     * Update character logic
     */
    update(deltaTime: number): void {
        // Update cooldowns
        if (this.attackCooldownTimer > 0) {
            this.attackCooldownTimer -= deltaTime * 1000;
        }

        // Update current state
        this.currentState.update(this, deltaTime);

        // Check for state transitions
        const newState = this.currentState.canTransition(this);
        if (newState) {
            this.transitionTo(newState);
        }
    }

    /**
     * Transition to a new state
     */
    private transitionTo(newState: ICharacterState): void {
        this.currentState.exit(this);
        this.currentState = newState;
        this.currentState.enter(this);
    }

    /**
     * Switch elemental mode (Strategy Pattern in action!)
     */
    switchElementalMode(): void {
        if (this.isAttacking || this.isHitStunned) return;

        const nextIndex = (this.currentModeIndex + 1) % this.modeStrategies.length;
        this.setMode(nextIndex, true);
    }

    private setMode(modeIndex: number, notifyObservers: boolean): void {
        const selectedMode = this.modeStrategies[modeIndex] ?? this.modeStrategies[0];
        this.currentModeIndex = selectedMode === this.modeStrategies[0] ? 0 : 1;
        this.elementalMode = selectedMode;

        if (notifyObservers) {
            this.notify({
                playerId: this.playerId,
                newMode: this.elementalMode.name,
            } as ModeChangeEvent);
        }
    }

    /**
     * Get current elemental mode
     */
    getElementalMode(): IElementalMode {
        return this.elementalMode;
    }

    /**
     * Get current mode name
     */
    getModeName(): ElementalMode {
        return this.elementalMode.name;
    }

    /**
     * Get mode-adjusted horizontal movement speed
     */
    getMovementSpeed(): number {
        return CHARACTER_SPEED * this.elementalMode.moveSpeedMultiplier;
    }

    /**
     * Get mode-adjusted jump force
     */
    getJumpForce(): number {
        return JUMP_FORCE * this.elementalMode.jumpForceMultiplier;
    }

    /**
     * Check if current mode allows in-air lift
     */
    canFlyInCurrentMode(): boolean {
        return this.elementalMode.canFly;
    }

    /**
     * Get lift force used in wind-like modes
     */
    getFlightLift(): number {
        return this.elementalMode.flightLift;
    }

    /**
     * Apply gravity
     */
    applyGravity(deltaTime: number): void {
        if (!this.isGrounded) {
            this.velocity.y += GRAVITY * this.elementalMode.gravityMultiplier * deltaTime;
        }
    }

    /**
     * Check ground collision
     */
    checkGroundCollision(): void {
        const groundLevel = GROUND_Y - this.height;

        if (this.position.y >= groundLevel) {
            this.position.y = groundLevel;
            this.velocity.y = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
    }

    /**
     * Check screen boundaries
     */
    checkBoundaries(): void {
        // Left boundary
        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x = 0;
        }

        // Right boundary
        if (this.position.x + this.width > CANVAS_WIDTH) {
            this.position.x = CANVAS_WIDTH - this.width;
            this.velocity.x = 0;
        }
    }

    /**
     * Check if character can attack
     */
    canAttack(): boolean {
        return this.attackCooldownTimer <= 0 && !this.isHitStunned;
    }

    /**
     * Start attack cooldown
     */
    startAttackCooldown(): void {
        this.attackCooldownTimer = ATTACK_COOLDOWN / this.elementalMode.attackSpeedMultiplier;
    }

    /**
     * Create attack hitbox
     */
    createAttackHitbox(): void {
        this.attackHitbox = new Hitbox();
        this.updateAttackHitbox();
    }

    /**
     * Update attack hitbox position
     */
    updateAttackHitbox(): void {
        if (!this.attackHitbox) return;

        const attackWidth = ATTACK_WIDTH * this.elementalMode.attackRangeMultiplier;
        const attackHeight = ATTACK_HEIGHT * this.elementalMode.attackHeightMultiplier;
        const hitboxX = this.facingRight
            ? this.position.x + this.width
            : this.position.x - attackWidth;

        const hitboxY = this.position.y + this.height / 2 - attackHeight / 2;

        this.attackHitbox.init(
            hitboxX,
            hitboxY,
            attackWidth,
            attackHeight,
            this.playerId,
            this.elementalMode.damageMultiplier * 10
        );
        this.attackHitbox.active = true;
    }

    /**
     * Remove attack hitbox
     */
    removeAttackHitbox(): void {
        if (this.attackHitbox) {
            this.attackHitbox.active = false;
            this.attackHitbox = null;
        }
    }

    /**
     * Get attack hitbox (for external hit checking)
     */
    getAttackHitbox(): Hitbox | null {
        return this.attackHitbox;
    }

    /**
     * Check if attack hits opponent
     */
    checkAttackHit(): boolean {
        if (!this.attackHitbox || !this.opponent) return false;

        const opponentRect = this.opponent.getHurtbox();

        if (this.attackHitbox.intersects(opponentRect)) {
            // Calculate attack result using Strategy pattern
            const result = this.elementalMode.attack(this, this.opponent);

            // Apply damage to opponent
            this.opponent.takeDamage(result);

            return true;
        }

        return false;
    }

    /**
     * Get character hurtbox (body collision box)
     */
    getHurtbox(): Rectangle {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height,
        };
    }

    /**
     * Take damage from an attack
     */
    takeDamage(attackResult: AttackResult): void {
        // Apply defense using Strategy pattern
        const reducedDamage = this.elementalMode.defend(this, attackResult.damage);

        // Apply damage
        this.health = Math.max(0, this.health - reducedDamage);

        // Apply knockback
        this.velocity.x = attackResult.knockback.x;
        this.velocity.y = attackResult.knockback.y;

        // Store hit stun duration
        this.lastHitStun = attackResult.hitStun;

        // Transition to hit state
        this.transitionTo(this.states.hit);

        // Notify observers (for health bar)
        this.notify({
            playerId: this.playerId,
            currentHealth: this.health,
            maxHealth: this.maxHealth,
            damage: reducedDamage,
        } as HealthChangeEvent);
    }

    /**
     * Store absorbed damage as bonus for Light mode attacks.
     */
    storeAbsorbedDamageBonus(amount: number): void {
        if (amount <= 0) return;
        this.absorbedDamageBonus = Math.min(
            ABSORBED_DAMAGE_BONUS_CAP,
            this.absorbedDamageBonus + amount
        );
    }

    /**
     * Consume all stored absorbed damage bonus.
     */
    consumeAbsorbedDamageBonus(): number {
        const bonus = this.absorbedDamageBonus;
        this.absorbedDamageBonus = 0;
        return bonus;
    }

    /**
     * Check if character is defeated
     */
    isDefeated(): boolean {
        return this.health <= 0;
    }

    /**
     * Reset character to starting state
     */
    reset(startPosition: Vector2): void {
        this.position = { ...startPosition };
        this.velocity = { x: 0, y: 0 };
        this.health = MAX_HEALTH;
        this.isGrounded = true;
        this.isAttacking = false;
        this.isHitStunned = false;
        this.attackCooldownTimer = 0;
        this.attackHitbox = null;
        this.absorbedDamageBonus = 0;
        this.setMode(0, true);

        // Reset to idle state
        this.transitionTo(this.states.idle);

        // Reset input flags
        this.inputFlags = {
            left: false,
            right: false,
            up: false,
            down: false,
            attack: false,
            moving: false,
        };

        // Notify health change
        this.notify({
            playerId: this.playerId,
            currentHealth: this.health,
            maxHealth: this.maxHealth,
            damage: 0,
        } as HealthChangeEvent);
    }

    /**
     * Get current state name
     */
    getStateName(): string {
        return this.currentState.name;
    }

    /**
     * Render character to canvas
     * NOTE: Replace ctx.fillRect with ctx.drawImage when you have sprite assets
     */
    render(ctx: CanvasRenderingContext2D): void {
        const visualConfig = this.elementalMode.getVisualConfig();

        ctx.save();

        // Draw glow effect
        ctx.shadowColor = visualConfig.glowColor;
        ctx.shadowBlur = 20;

        // =====================================================
        // CHARACTER BODY - Replace with ctx.drawImage for sprites
        // Example: ctx.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height);
        // =====================================================

        // Main body shape by active mode
        ctx.fillStyle = visualConfig.primaryColor;
        if (this.elementalMode.form === 'armored') {
            ctx.fillRect(this.position.x, this.position.y + 6, this.width, this.height - 6);
            ctx.fillRect(this.position.x - 4, this.position.y + 24, this.width + 8, this.height - 34);
        } else if (this.elementalMode.form === 'fluid') {
            ctx.beginPath();
            ctx.moveTo(this.position.x + 12, this.position.y);
            ctx.lineTo(this.position.x + this.width - 12, this.position.y);
            ctx.quadraticCurveTo(
                this.position.x + this.width,
                this.position.y,
                this.position.x + this.width,
                this.position.y + 16
            );
            ctx.lineTo(this.position.x + this.width, this.position.y + this.height - 12);
            ctx.quadraticCurveTo(
                this.position.x + this.width,
                this.position.y + this.height,
                this.position.x + this.width - 12,
                this.position.y + this.height
            );
            ctx.lineTo(this.position.x + 12, this.position.y + this.height);
            ctx.quadraticCurveTo(
                this.position.x,
                this.position.y + this.height,
                this.position.x,
                this.position.y + this.height - 16
            );
            ctx.lineTo(this.position.x, this.position.y + 12);
            ctx.quadraticCurveTo(
                this.position.x,
                this.position.y,
                this.position.x + 12,
                this.position.y
            );
            ctx.fill();
        } else if (this.elementalMode.form === 'aerial') {
            ctx.beginPath();
            ctx.moveTo(this.position.x + this.width / 2, this.position.y);
            ctx.lineTo(this.position.x + this.width, this.position.y + this.height / 2);
            ctx.lineTo(this.position.x + this.width / 2, this.position.y + this.height);
            ctx.lineTo(this.position.x, this.position.y + this.height / 2);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }

        // Secondary color accent
        ctx.fillStyle = visualConfig.secondaryColor;
        if (this.elementalMode.form === 'aerial') {
            ctx.fillRect(this.position.x + 6, this.position.y + this.height / 2 - 8, this.width - 12, 16);
            ctx.fillRect(this.position.x + this.width / 2 - 8, this.position.y + 8, 16, this.height - 16);
        } else if (this.elementalMode.form === 'armored') {
            ctx.fillRect(this.position.x + 8, this.position.y + 14, this.width - 16, 26);
            ctx.fillRect(this.position.x + 20, this.position.y + 52, this.width - 40, this.height - 68);
        } else {
            ctx.fillRect(
                this.position.x + 10,
                this.position.y + 10,
                this.width - 20,
                30
            );
        }

        // Draw face direction indicator
        const eyeX = this.facingRight
            ? this.position.x + this.width - 20
            : this.position.x + 10;
        const eyeY = this.elementalMode.form === 'aerial'
            ? this.position.y + this.height / 2 - 18
            : this.position.y + 25;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(eyeX, eyeY, 10, 10);

        // =====================================================
        // ATTACK ANIMATION - Replace with attack sprite
        // =====================================================

        // Draw attack effect when attacking
        if (this.isAttacking && this.attackHitbox) {
            ctx.fillStyle = `${visualConfig.primaryColor}88`;
            ctx.shadowBlur = 30;

            if (this.elementalMode.attackEffect === 'beam') {
                const beamHeight = Math.max(8, this.attackHitbox.height);
                const beamY = this.attackHitbox.y + this.attackHitbox.height / 2 - beamHeight / 2;
                const beamGradient = ctx.createLinearGradient(
                    this.attackHitbox.x,
                    beamY,
                    this.attackHitbox.x + this.attackHitbox.width,
                    beamY
                );
                beamGradient.addColorStop(0, `${visualConfig.primaryColor}66`);
                beamGradient.addColorStop(0.5, `${visualConfig.secondaryColor}ff`);
                beamGradient.addColorStop(1, `${visualConfig.primaryColor}66`);

                ctx.fillStyle = beamGradient;
                ctx.fillRect(
                    this.attackHitbox.x,
                    beamY,
                    this.attackHitbox.width,
                    beamHeight
                );
            } else {
                // Attack slash effect
                ctx.fillRect(
                    this.attackHitbox.x,
                    this.attackHitbox.y,
                    this.attackHitbox.width,
                    this.attackHitbox.height
                );
            }
        }

        // Draw hit flash when stunned
        if (this.isHitStunned) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }

        ctx.restore();

        // Draw mode indicator above character
        this.drawModeIndicator(ctx);
    }

    /**
     * Draw elemental mode indicator above character
     */
    private drawModeIndicator(ctx: CanvasRenderingContext2D): void {
        const indicatorSize = 16;
        const indicatorX = this.position.x + this.width / 2 - indicatorSize / 2;
        const indicatorY = this.position.y - 25;

        const visualConfig = this.elementalMode.getVisualConfig();

        ctx.save();
        ctx.shadowColor = visualConfig.glowColor;
        ctx.shadowBlur = 10;

        // Mode icon (circle with glow)
        ctx.fillStyle = visualConfig.primaryColor;
        ctx.beginPath();
        ctx.arc(
            indicatorX + indicatorSize / 2,
            indicatorY + indicatorSize / 2,
            indicatorSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(
            indicatorX + indicatorSize / 2 - 2,
            indicatorY + indicatorSize / 2 - 2,
            indicatorSize / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
    }
}
