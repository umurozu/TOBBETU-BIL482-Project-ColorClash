const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');

require.extensions['.ts'] = function registerTypeScript(module, filename) {
    const source = fs.readFileSync(filename, 'utf8');
    const transpiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            strict: false,
            esModuleInterop: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            allowSyntheticDefaultImports: true,
        },
        fileName: filename,
    });
    module._compile(transpiled.outputText, filename);
};

const { CharacterFactory } = require('../src/patterns/factory/CharacterFactory.ts');
const { CollisionSystem } = require('../src/systems/CollisionSystem.ts');
const { MoveCommand, AttackCommand, SwitchModeCommand } = require('../src/patterns/command/Command.ts');
const {
    BASE_ATTACK_DAMAGE,
    LIGHT_MODE,
    PLAYER1_START,
    PLAYER2_START
} = require('../src/constants/GameConfig.ts');

const runtime = {
    CharacterFactory,
    CollisionSystem,
    MoveCommand,
    AttackCommand,
    SwitchModeCommand,
    BASE_ATTACK_DAMAGE,
    LIGHT_MODE,
    PLAYER1_START,
    PLAYER2_START,
};
const tests = [];

function test(name, fn) {
    tests.push({ name, fn });
}

test('Character roster exposes expected archetypes and mode pairs', () => {
    const roster = runtime.CharacterFactory.getCharacterRoster();
    assert.equal(roster.length, 3);
    assert.deepEqual(
        roster.map(item => item.type),
        ['Fighter', 'Geomancer', 'Eclipse']
    );
    assert.deepEqual(roster[0].modes, ['Fire', 'Water']);
    assert.deepEqual(roster[1].modes, ['Earth', 'Wind']);
    assert.deepEqual(roster[2].modes, ['Light', 'Dark']);
});

test('CharacterFactory creates match players with expected ids and spawn coordinates', () => {
    const [player1, player2] = runtime.CharacterFactory.createMatchPlayers('Fighter', 'Geomancer');

    assert.equal(player1.playerId, 'Player1');
    assert.equal(player2.playerId, 'Player2');
    assert.equal(player1.position.x, runtime.PLAYER1_START.x);
    assert.equal(player1.position.y, runtime.PLAYER1_START.y);
    assert.equal(player2.position.x, runtime.PLAYER2_START.x);
    assert.equal(player2.position.y, runtime.PLAYER2_START.y);
    assert.equal(player1.getModeName(), 'Fire');
    assert.equal(player2.getModeName(), 'Earth');
});

test('SwitchModeCommand cycles character mode and returns to initial mode', () => {
    const [player1] = runtime.CharacterFactory.createMatchPlayers('Fighter', 'Fighter');
    const switchModeCommand = new runtime.SwitchModeCommand();

    assert.equal(player1.getModeName(), 'Fire');
    switchModeCommand.execute(player1);
    assert.equal(player1.getModeName(), 'Water');
    switchModeCommand.execute(player1);
    assert.equal(player1.getModeName(), 'Fire');
});

test('MoveCommand updates movement flags and moving state', () => {
    const [player1] = runtime.CharacterFactory.createMatchPlayers('Fighter', 'Fighter');
    const moveLeft = new runtime.MoveCommand('left', true);
    const stopLeft = new runtime.MoveCommand('left', false);

    moveLeft.execute(player1);
    assert.equal(player1.inputFlags.left, true);
    assert.equal(player1.inputFlags.moving, true);

    stopLeft.execute(player1);
    assert.equal(player1.inputFlags.left, false);
    assert.equal(player1.inputFlags.moving, false);
});

test('Attack state applies damage when opponent is inside hitbox', () => {
    const [player1, player2] = runtime.CharacterFactory.createMatchPlayers('Fighter', 'Fighter');

    player1.position.x = 300;
    player1.position.y = runtime.PLAYER1_START.y;
    player2.position.x = 370;
    player2.position.y = runtime.PLAYER2_START.y;

    const initialHealth = player2.health;
    const attackCommand = new runtime.AttackCommand(true);

    attackCommand.execute(player1);
    player1.update(0.016);
    player1.update(0.016);

    assert.ok(player2.health < initialHealth);
});

test('Dark mode absorbed damage is consumed as bonus by next Light attack', () => {
    const [player1, player2] = runtime.CharacterFactory.createMatchPlayers('Eclipse', 'Fighter');
    const switchModeCommand = new runtime.SwitchModeCommand();
    const baseLightDamage = runtime.BASE_ATTACK_DAMAGE * runtime.LIGHT_MODE.damageMultiplier;

    switchModeCommand.execute(player1);
    assert.equal(player1.getModeName(), 'Dark');

    player1.takeDamage({
        damage: 30,
        knockback: { x: 0, y: 0 },
        hitStun: 0,
        particleType: 'fire',
    });

    player1.update(0.25);
    switchModeCommand.execute(player1);
    assert.equal(player1.getModeName(), 'Light');

    const boostedAttack = player1.getElementalMode().attack(player1, player2);
    assert.ok(boostedAttack.damage > baseLightDamage);

    const secondAttack = player1.getElementalMode().attack(player1, player2);
    assert.equal(secondAttack.damage, baseLightDamage);
});

test('CollisionSystem detects overlap and computes overlap midpoint', () => {
    const overlapPoint = runtime.CollisionSystem.getCollisionPoint(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 }
    );

    assert.deepEqual(overlapPoint, { x: 7.5, y: 7.5 });
    assert.equal(
        runtime.CollisionSystem.getCollisionPoint(
            { x: 0, y: 0, width: 10, height: 10 },
            { x: 30, y: 0, width: 5, height: 5 }
        ),
        null
    );
});

test('CollisionSystem resolveCharacterCollision increases distance between overlapping players', () => {
    const [player1, player2] = runtime.CharacterFactory.createMatchPlayers('Fighter', 'Fighter');

    player1.position.x = 400;
    player2.position.x = 430;

    const distanceBefore = Math.abs(player1.position.x - player2.position.x);
    runtime.CollisionSystem.resolveCharacterCollision(player1, player2);
    const distanceAfter = Math.abs(player1.position.x - player2.position.x);

    assert.ok(distanceAfter > distanceBefore);
});

async function runAll() {
    let passed = 0;
    let failed = 0;

    for (const item of tests) {
        try {
            await item.fn();
            passed += 1;
            console.log(`PASS: ${item.name}`);
        } catch (error) {
            failed += 1;
            console.error(`FAIL: ${item.name}`);
            console.error(error instanceof Error ? error.stack : error);
        }
    }

    console.log(`\nSummary: ${passed} passed, ${failed} failed, ${tests.length} total`);

    if (failed > 0) {
        process.exitCode = 1;
    }
}

runAll().catch(error => {
    console.error('Fatal test runner error:', error);
    process.exit(1);
});

