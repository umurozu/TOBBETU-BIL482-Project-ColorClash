/**
 * Main Entry Point
 * Game mode selection + normal match + tournament flow
 */

import { GameEngine } from './core/GameEngine';
import { CharacterFactory } from './patterns/factory/CharacterFactory';
import type { CharacterSelectionOption, CharacterType, MatchCharacterSelection, PlayerId } from './types';

type GameMode = 'normal' | 'tournament';
type TournamentSize = 2 | 4 | 6 | 8;

interface DuelParticipant {
    seed: number;
    name: string;
    character: CharacterType;
}

interface TournamentMatch {
    round: number;
    matchNumber: number;
    player1: DuelParticipant;
    player2: DuelParticipant;
}

interface TournamentRuntime {
    size: TournamentSize;
    round: number;
    remaining: DuelParticipant[];
    pendingMatches: TournamentMatch[];
    nextRoundParticipants: DuelParticipant[];
    roundEliminated: DuelParticipant[];
    eliminatedOrder: DuelParticipant[];
}

const TOURNAMENT_SIZES: TournamentSize[] = [2, 4, 6, 8];
const ROUND_PROGRESS_DURATION_MS = 3000;
const TOURNAMENT_FINAL_SHOW_MS = 5000;

let currentEngine: GameEngine | null = null;
let shortcutsBound = false;
let gameStarted = false;
let currentMode: GameMode = 'normal';
let currentTournamentSize: TournamentSize = 2;
let tournamentRuntime: TournamentRuntime | null = null;
let rosterCache: CharacterSelectionOption[] = [];
let tournamentFinalTimeoutId: number | null = null;

document.addEventListener('DOMContentLoaded', () => {
    initSetupScreen();
});

function initSetupScreen(): void {
    const p1Container = document.getElementById('p1CharacterOptions');
    const p2Container = document.getElementById('p2CharacterOptions');
    const startButton = document.getElementById('startMatchButton');
    const summary = document.getElementById('selectedCharactersSummary');
    const participantsContainer = document.getElementById('tournamentParticipants');

    if (!p1Container || !p2Container || !startButton || !summary || !participantsContainer) {
        console.error('Setup UI not found.');
        return;
    }

    rosterCache = CharacterFactory.getCharacterRoster();
    const firstType = rosterCache[0]?.type ?? 'Fighter';
    const secondType = rosterCache[1]?.type ?? firstType;

    renderCharacterOptions(p1Container, 'p1-character', rosterCache, firstType);
    renderCharacterOptions(p2Container, 'p2-character', rosterCache, secondType);
    renderTournamentParticipants(currentTournamentSize);

    bindModeInputs();

    startButton.addEventListener('click', () => {
        clearTournamentResults();
        if (currentMode === 'normal') {
            startNormalMode();
            return;
        }

        startTournamentMode();
    });

    summary.textContent = 'Normal mode: choose 2 players and start.';
    syncSetupVisibility();
}

function bindModeInputs(): void {
    const modeRadios = document.querySelectorAll<HTMLInputElement>('input[name="gameMode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;
            currentMode = radio.value === 'tournament' ? 'tournament' : 'normal';
            clearTournamentResults();
            syncSetupVisibility();
        });
    });

    const sizeRadios = document.querySelectorAll<HTMLInputElement>('input[name="tournamentSize"]');
    sizeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;
            const parsedSize = Number.parseInt(radio.value, 10);
            if (isTournamentSize(parsedSize)) {
                currentTournamentSize = parsedSize;
                renderTournamentParticipants(currentTournamentSize);
            }
        });
    });
}

function syncSetupVisibility(): void {
    const normalSetup = document.getElementById('normalSetupSection');
    const tournamentOptions = document.getElementById('tournamentOptionsSection');
    const tournamentSetup = document.getElementById('tournamentSetupSection');
    const startButton = document.getElementById('startMatchButton');
    const description = document.getElementById('setupDescription');
    const summary = document.getElementById('selectedCharactersSummary');

    if (!normalSetup || !tournamentOptions || !tournamentSetup || !startButton || !description || !summary) {
        return;
    }

    if (currentMode === 'normal') {
        normalSetup.classList.remove('hidden');
        tournamentOptions.classList.add('hidden');
        tournamentSetup.classList.add('hidden');
        startButton.textContent = 'Start Match';
        description.textContent = 'Choose 2 players and start a classic 1v1 duel.';
        summary.textContent = 'Normal mode: choose 2 players and start.';
    } else {
        normalSetup.classList.add('hidden');
        tournamentOptions.classList.remove('hidden');
        tournamentSetup.classList.remove('hidden');
        startButton.textContent = 'Start Tournament';
        description.textContent = 'Tournament mode: choose size, names and characters.';
        summary.textContent = `Tournament mode: ${currentTournamentSize} competitors will enter the bracket.`;
    }
}

function renderCharacterOptions(
    container: HTMLElement,
    groupName: string,
    roster: CharacterSelectionOption[],
    defaultType: CharacterType
): void {
    container.innerHTML = '';

    roster.forEach(option => {
        const label = document.createElement('label');
        label.className = 'character-option';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = groupName;
        input.value = option.type;
        input.checked = option.type === defaultType;

        const card = document.createElement('div');
        card.className = 'character-card';

        const title = document.createElement('h4');
        title.textContent = option.name;

        const modes = document.createElement('div');
        modes.className = 'mode-pair';
        modes.textContent = `${option.modes[0]} / ${option.modes[1]}`;

        const desc = document.createElement('p');
        desc.textContent = option.description;

        card.appendChild(title);
        card.appendChild(modes);
        card.appendChild(desc);

        label.appendChild(input);
        label.appendChild(card);
        container.appendChild(label);
    });
}

function renderTournamentParticipants(size: TournamentSize): void {
    const container = document.getElementById('tournamentParticipants');
    if (!container) return;

    container.innerHTML = '';

    for (let index = 0; index < size; index++) {
        const seed = index + 1;
        const defaultType = rosterCache[index % rosterCache.length]?.type ?? 'Fighter';

        const card = document.createElement('section');
        card.className = 'participant-card';

        const title = document.createElement('h4');
        title.textContent = `Competitor ${seed}`;

        const nameLabel = document.createElement('label');
        nameLabel.className = 'field-label';
        nameLabel.textContent = 'Name';
        nameLabel.setAttribute('for', `tournamentName${seed}`);

        const nameInput = document.createElement('input');
        nameInput.id = `tournamentName${seed}`;
        nameInput.className = 'participant-name-input';
        nameInput.type = 'text';
        nameInput.maxLength = 20;
        nameInput.value = `Player ${seed}`;

        const characterLabel = document.createElement('label');
        characterLabel.className = 'field-label';
        characterLabel.textContent = 'Character';
        characterLabel.setAttribute('for', `tournamentCharacter${seed}`);

        const characterSelect = document.createElement('select');
        characterSelect.id = `tournamentCharacter${seed}`;
        characterSelect.className = 'participant-character-select';

        rosterCache.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.type;
            optionElement.textContent = `${option.name} (${option.modes[0]} / ${option.modes[1]})`;
            optionElement.selected = option.type === defaultType;
            characterSelect.appendChild(optionElement);
        });

        card.appendChild(title);
        card.appendChild(nameLabel);
        card.appendChild(nameInput);
        card.appendChild(characterLabel);
        card.appendChild(characterSelect);
        container.appendChild(card);
    }
}

function startNormalMode(): void {
    const player1Type = getSelectedCharacterType('p1-character');
    const player2Type = getSelectedCharacterType('p2-character');

    if (!player1Type || !player2Type) {
        return;
    }

    const player1Name = readInputName('p1NameInput', 'Player 1');
    const player2Name = readInputName('p2NameInput', 'Player 2');

    tournamentRuntime = null;
    setTournamentBanner(`${player1Name} vs ${player2Name}`, false);
    hideOverlay();

    launchMatch(
        {
            Player1: player1Type,
            Player2: player2Type,
        },
        {
            autoRestartOnVictory: true,
            victorySubtext: 'Restarting in 3 seconds...',
            playerDisplayNames: {
                Player1: player1Name,
                Player2: player2Name,
            },
        }
    );

    const summary = document.getElementById('selectedCharactersSummary');
    if (summary) {
        summary.textContent =
            `Normal mode started: ${player1Name} (${CharacterFactory.getCharacterName(player1Type)}) vs ` +
            `${player2Name} (${CharacterFactory.getCharacterName(player2Type)})`;
    }
}

function startTournamentMode(): void {
    clearTournamentFinalTimeout();
    hideTournamentFinalOverlay();

    const participants = collectTournamentParticipants();
    if (participants.length < 2) {
        return;
    }

    tournamentRuntime = {
        size: currentTournamentSize,
        round: 1,
        remaining: participants,
        pendingMatches: [],
        nextRoundParticipants: [],
        roundEliminated: [],
        eliminatedOrder: [],
    };

    hideOverlay();
    startTournamentRound();
}

function startTournamentRound(): void {
    const state = tournamentRuntime;
    if (!state) return;

    if (state.remaining.length <= 1) {
        finishTournament();
        return;
    }

    state.pendingMatches = [];
    state.nextRoundParticipants = [];
    state.roundEliminated = [];
    const entrants = [...state.remaining];

    if (entrants.length % 2 !== 0) {
        const byePlayer = entrants.shift();
        if (byePlayer) {
            state.nextRoundParticipants.push(byePlayer);
            setTournamentBanner(`Round ${state.round}: ${byePlayer.name} gets a bye`, true);
        }
    }

    let matchNumber = 1;
    for (let index = 0; index < entrants.length; index += 2) {
        const player1 = entrants[index];
        const player2 = entrants[index + 1];

        if (!player1 || !player2) {
            continue;
        }

        state.pendingMatches.push({
            round: state.round,
            matchNumber,
            player1,
            player2,
        });
        matchNumber++;
    }

    runNextTournamentMatch();
}

function runNextTournamentMatch(): void {
    const state = tournamentRuntime;
    if (!state) return;

    const match = state.pendingMatches.shift();
    if (!match) {
        proceedAfterRoundEnd();
        return;
    }

    setTournamentBanner(
        `Round ${match.round} - Match ${match.matchNumber}: ${match.player1.name} vs ${match.player2.name}`,
        true
    );

    launchMatch(
        {
            Player1: match.player1.character,
            Player2: match.player2.character,
        },
        {
            autoRestartOnVictory: false,
            victorySubtext: 'Preparing next match...',
            playerDisplayNames: {
                Player1: match.player1.name,
                Player2: match.player2.name,
            },
            onMatchEnd: winner => {
                handleTournamentMatchEnd(match, winner);
            },
        }
    );
}

function handleTournamentMatchEnd(match: TournamentMatch, winner: PlayerId): void {
    const state = tournamentRuntime;
    if (!state) return;

    const winningParticipant = winner === 'Player1' ? match.player1 : match.player2;
    const losingParticipant = winner === 'Player1' ? match.player2 : match.player1;

    state.nextRoundParticipants.push(winningParticipant);
    state.roundEliminated.push(losingParticipant);
    state.eliminatedOrder.push(losingParticipant);

    setTournamentBanner(`${winningParticipant.name} advanced to next round`, true);

    window.setTimeout(() => {
        if (!tournamentRuntime) return;

        if (tournamentRuntime.pendingMatches.length > 0) {
            runNextTournamentMatch();
            return;
        }

        proceedAfterRoundEnd();
    }, 1400);
}

function proceedAfterRoundEnd(): void {
    const state = tournamentRuntime;
    if (!state) return;

    const completedRound = state.round;
    const winners = [...state.nextRoundParticipants];
    const eliminated = [...state.roundEliminated];

    if (winners.length <= 1) {
        showRoundProgressOverlay(
            completedRound,
            eliminated,
            winners,
            ['Tournament finished. Champion decided.']
        );
        window.setTimeout(() => {
            if (!tournamentRuntime) return;
            hideRoundProgressOverlay();
            state.remaining = [...winners];
            finishTournament();
        }, ROUND_PROGRESS_DURATION_MS);
        return;
    }

    const nextRound = completedRound + 1;
    const nextPairings = buildRoundPairingPreview(winners, nextRound);

    showRoundProgressOverlay(completedRound, eliminated, winners, nextPairings);

    window.setTimeout(() => {
        if (!tournamentRuntime) return;
        hideRoundProgressOverlay();
        state.remaining = [...winners];
        state.round = nextRound;
        startTournamentRound();
    }, ROUND_PROGRESS_DURATION_MS);
}

function finishTournament(): void {
    const state = tournamentRuntime;
    if (!state) return;

    const champion = state.remaining[0] ?? state.nextRoundParticipants[0] ?? null;
    const secondPlace = state.eliminatedOrder[state.eliminatedOrder.length - 1] ?? null;
    const thirdPlace = state.eliminatedOrder[state.eliminatedOrder.length - 2] ?? null;

    setTournamentBanner('', false);
    showTournamentFinalOverlay(champion, secondPlace, thirdPlace);

    clearTournamentFinalTimeout();
    tournamentFinalTimeoutId = window.setTimeout(() => {
        tournamentFinalTimeoutId = null;
        hideTournamentFinalOverlay();
        renderTournamentResults(champion, secondPlace, thirdPlace);
        showOverlay();
        tournamentRuntime = null;
    }, TOURNAMENT_FINAL_SHOW_MS);

    const summary = document.getElementById('selectedCharactersSummary');
    if (summary) {
        summary.textContent =
            champion
                ? `Tournament finished. Champion: ${champion.name}`
                : 'Tournament finished.';
    }
}

function renderTournamentResults(
    champion: DuelParticipant | null,
    secondPlace: DuelParticipant | null,
    thirdPlace: DuelParticipant | null
): void {
    const resultsSection = document.getElementById('tournamentResultsSection');
    const podium = document.getElementById('tournamentPodium');

    if (!resultsSection || !podium) {
        return;
    }

    podium.innerHTML = '';

    const places: Array<{ label: string; participant: DuelParticipant | null }> = [
        { label: '1st Place', participant: champion },
        { label: '2nd Place', participant: secondPlace },
        { label: '3rd Place', participant: thirdPlace },
    ];

    places.forEach(place => {
        const item = document.createElement('li');
        const participantText = place.participant
            ? `${place.participant.name} (${CharacterFactory.getCharacterName(place.participant.character)})`
            : 'N/A';
        item.innerHTML = `<strong>${place.label}</strong> ${participantText}`;
        podium.appendChild(item);
    });

    resultsSection.classList.remove('hidden');
}

function clearTournamentResults(): void {
    const resultsSection = document.getElementById('tournamentResultsSection');
    const podium = document.getElementById('tournamentPodium');

    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }

    if (podium) {
        podium.innerHTML = '';
    }

    hideRoundProgressOverlay();
    hideTournamentFinalOverlay();
    clearTournamentFinalTimeout();
}

function buildRoundPairingPreview(participants: DuelParticipant[], round: number): string[] {
    const pairings: string[] = [];
    const queue = [...participants];

    if (queue.length % 2 !== 0) {
        const bye = queue.shift();
        if (bye) {
            pairings.push(`Round ${round}: ${bye.name} gets a bye`);
        }
    }

    for (let index = 0; index < queue.length; index += 2) {
        const player1 = queue[index];
        const player2 = queue[index + 1];
        if (!player1 || !player2) {
            continue;
        }
        pairings.push(`${player1.name} vs ${player2.name}`);
    }

    return pairings.length > 0 ? pairings : ['Waiting for next matchup.'];
}

function showRoundProgressOverlay(
    round: number,
    eliminated: DuelParticipant[],
    advanced: DuelParticipant[],
    nextPairings: string[]
): void {
    const overlay = document.getElementById('tournamentRoundOverlay');
    const title = document.getElementById('roundOverlayTitle');
    const eliminatedList = document.getElementById('roundOverlayEliminated');
    const advancedList = document.getElementById('roundOverlayAdvanced');
    const pairingsList = document.getElementById('roundOverlayPairings');
    const card = document.getElementById('tournamentRoundCard');

    if (!overlay || !title || !eliminatedList || !advancedList || !pairingsList || !card) {
        return;
    }

    title.textContent = `Round ${round} Summary`;
    eliminatedList.innerHTML = '';
    advancedList.innerHTML = '';
    pairingsList.innerHTML = '';

    if (eliminated.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No eliminations this round.';
        eliminatedList.appendChild(li);
    } else {
        eliminated.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player.name} eliminated`;
            eliminatedList.appendChild(li);
        });
    }

    advanced.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name} advanced`;
        advancedList.appendChild(li);
    });

    nextPairings.forEach(pairing => {
        const li = document.createElement('li');
        li.textContent = pairing;
        pairingsList.appendChild(li);
    });

    overlay.classList.remove('hidden');
    card.classList.remove('enter');
    // Restart CSS animation for repeated rounds.
    void card.offsetWidth;
    card.classList.add('enter');
    currentEngine?.setInputEnabled(false);
}

function hideRoundProgressOverlay(): void {
    const overlay = document.getElementById('tournamentRoundOverlay');
    const card = document.getElementById('tournamentRoundCard');
    if (!overlay || !card) {
        return;
    }

    overlay.classList.add('hidden');
    card.classList.remove('enter');
}

function showTournamentFinalOverlay(
    champion: DuelParticipant | null,
    secondPlace: DuelParticipant | null,
    thirdPlace: DuelParticipant | null
): void {
    const overlay = document.getElementById('tournamentFinalOverlay');
    const podium = document.getElementById('tournamentFinalPodium');
    const subtitle = document.getElementById('tournamentFinalSubtitle');

    if (!overlay || !podium || !subtitle) {
        return;
    }

    const entries: Array<{
        rank: 1 | 2 | 3;
        medalLabel: string;
        participant: DuelParticipant | null;
        className: 'gold' | 'silver' | 'bronze';
        colors: string[];
    }> = [
            {
                rank: 1,
                medalLabel: 'Gold Medal',
                participant: champion,
                className: 'gold',
                colors: ['#fde047', '#facc15', '#f59e0b', '#fef3c7'],
            },
            {
                rank: 2,
                medalLabel: 'Silver Medal',
                participant: secondPlace,
                className: 'silver',
                colors: ['#e5e7eb', '#cbd5e1', '#94a3b8', '#f8fafc'],
            },
            {
                rank: 3,
                medalLabel: 'Bronze Medal',
                participant: thirdPlace,
                className: 'bronze',
                colors: ['#fdba74', '#fb923c', '#b45309', '#fed7aa'],
            },
        ];

    podium.innerHTML = '';
    entries.forEach(entry => {
        const item = document.createElement('li');
        item.className = `final-podium-entry rank-${entry.rank}`;

        const medalWrap = document.createElement('div');
        medalWrap.className = 'final-medal-wrap';

        const medal = document.createElement('span');
        medal.className = `final-medal ${entry.className}`;
        medal.textContent = `${entry.rank}`;

        const medalText = document.createElement('span');
        medalText.className = 'final-medal-label';
        medalText.textContent = entry.medalLabel;

        const medalBurst = document.createElement('div');
        medalBurst.className = 'confetti-burst confetti-medal';

        medalWrap.appendChild(medal);
        medalWrap.appendChild(medalBurst);

        const textWrap = document.createElement('div');
        textWrap.className = 'final-name-wrap';

        const name = document.createElement('div');
        name.className = 'final-player-name';
        name.textContent = entry.participant?.name ?? 'N/A';

        const character = document.createElement('div');
        character.className = 'final-player-character';
        character.textContent = entry.participant
            ? CharacterFactory.getCharacterName(entry.participant.character)
            : '-';

        const nameBurst = document.createElement('div');
        nameBurst.className = 'confetti-burst confetti-name';

        textWrap.appendChild(name);
        textWrap.appendChild(character);
        textWrap.appendChild(nameBurst);

        item.appendChild(medalWrap);
        item.appendChild(medalText);
        item.appendChild(textWrap);
        podium.appendChild(item);

        triggerConfettiOnEntry(item, entry.colors);
        window.setTimeout(() => {
            if (overlay.classList.contains('hidden')) {
                return;
            }
            triggerConfettiOnEntry(item, entry.colors);
        }, 900 + entry.rank * 280);
    });

    subtitle.textContent = champion
        ? `Champion: ${champion.name}`
        : 'Tournament Complete';

    overlay.classList.remove('hidden');
    currentEngine?.setInputEnabled(false);
}

function hideTournamentFinalOverlay(): void {
    const overlay = document.getElementById('tournamentFinalOverlay');
    const podium = document.getElementById('tournamentFinalPodium');

    if (!overlay || !podium) {
        return;
    }

    overlay.classList.add('hidden');
    podium.innerHTML = '';
}

function clearTournamentFinalTimeout(): void {
    if (tournamentFinalTimeoutId === null) {
        return;
    }

    clearTimeout(tournamentFinalTimeoutId);
    tournamentFinalTimeoutId = null;
}

function triggerConfettiOnEntry(entryElement: HTMLElement, colors: string[]): void {
    const bursts = entryElement.querySelectorAll<HTMLElement>('.confetti-burst');
    bursts.forEach((burst, index) => {
        spawnConfettiBurst(burst, colors, index === 0 ? 20 : 16);
    });
}

function spawnConfettiBurst(
    container: HTMLElement,
    colors: string[],
    pieceCount: number
): void {
    container.innerHTML = '';

    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 230)}px`);
        piece.style.setProperty('--dy', `${Math.round(-55 - Math.random() * 190)}px`);
        piece.style.setProperty('--rot', `${Math.round(Math.random() * 540)}deg`);
        piece.style.setProperty('--delay', `${(Math.random() * 0.32).toFixed(2)}s`);
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)] ?? '#ffffff';
        container.appendChild(piece);
    }
}

function collectTournamentParticipants(): DuelParticipant[] {
    const participants: DuelParticipant[] = [];

    for (let seed = 1; seed <= currentTournamentSize; seed++) {
        const nameInput = document.getElementById(`tournamentName${seed}`) as HTMLInputElement | null;
        const characterSelect = document.getElementById(`tournamentCharacter${seed}`) as HTMLSelectElement | null;

        const fallbackName = `Player ${seed}`;
        const name = nameInput?.value.trim() || fallbackName;

        const selectedType = characterSelect?.value ?? 'Fighter';
        const character = CharacterFactory.isCharacterType(selectedType) ? selectedType : 'Fighter';

        participants.push({
            seed,
            name,
            character,
        });
    }

    return participants;
}

function getSelectedCharacterType(groupName: string): CharacterType | null {
    const selected = document.querySelector<HTMLInputElement>(
        `input[name="${groupName}"]:checked`
    );

    if (!selected) {
        return null;
    }

    if (!CharacterFactory.isCharacterType(selected.value)) {
        return null;
    }

    return selected.value;
}

function readInputName(inputId: string, fallback: string): string {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    return input?.value.trim() || fallback;
}

function launchMatch(
    selection: MatchCharacterSelection,
    flowOptions: {
        autoRestartOnVictory: boolean;
        victorySubtext: string;
        playerDisplayNames: Record<PlayerId, string>;
        onMatchEnd?: (winner: PlayerId) => void;
    }
): void {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;

    if (!canvas) {
        console.error('Canvas element not found.');
        return;
    }

    try {
        const engine = GameEngine.getInstance(canvas);
        engine.init(selection, flowOptions);

        if (!gameStarted) {
            engine.start();
            gameStarted = true;
        }

        currentEngine = engine;
        bindGlobalShortcuts();

        (window as unknown as { gameEngine: GameEngine }).gameEngine = engine;
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
}

function bindGlobalShortcuts(): void {
    if (shortcutsBound) {
        return;
    }

    window.addEventListener('keydown', event => {
        if (event.code === 'Escape') {
            if (isEditableElementTarget(event.target) || isGameplayInputBlockedByUI()) {
                return;
            }

            event.preventDefault();
            returnToSetupScreen();
            return;
        }

        if (isEditableElementTarget(event.target) || isGameplayInputBlockedByUI()) {
            return;
        }

        if (!currentEngine) {
            return;
        }

        if (event.code === 'KeyR') {
            currentEngine.restart();
        }

        if (event.code === 'KeyP') {
            currentEngine.togglePause();
        }
    });

    shortcutsBound = true;
}

function returnToSetupScreen(): void {
    clearTournamentFinalTimeout();
    hideRoundProgressOverlay();
    hideTournamentFinalOverlay();
    setTournamentBanner('', false);
    tournamentRuntime = null;

    if (currentEngine) {
        currentEngine.stop();
        currentEngine.setInputEnabled(false);
    }

    gameStarted = false;
    showOverlay();
    syncSetupVisibility();

    const summary = document.getElementById('selectedCharactersSummary');
    if (summary) {
        summary.textContent = currentMode === 'normal'
            ? 'Back to setup. Choose characters and press Start Match.'
            : `Back to setup. Configure ${currentTournamentSize} competitors and press Start Tournament.`;
    }
}

function hideOverlay(): void {
    const overlay = document.getElementById('characterSelectOverlay');
    overlay?.classList.add('hidden');
}

function showOverlay(): void {
    const overlay = document.getElementById('characterSelectOverlay');
    overlay?.classList.remove('hidden');
    currentEngine?.setInputEnabled(false);
}

function setTournamentBanner(text: string, visible: boolean): void {
    const banner = document.getElementById('tournamentBanner');
    if (!banner) return;

    if (visible) {
        banner.textContent = text;
        banner.classList.remove('hidden');
        return;
    }

    banner.textContent = '';
    banner.classList.add('hidden');
}

function isTournamentSize(value: number): value is TournamentSize {
    return TOURNAMENT_SIZES.includes(value as TournamentSize);
}

function isEditableElementTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    const tag = target.tagName;
    return (
        target.isContentEditable ||
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT'
    );
}

function isGameplayInputBlockedByUI(): boolean {
    const setupOpen = !document.getElementById('characterSelectOverlay')?.classList.contains('hidden');
    const roundOverlayOpen = !document.getElementById('tournamentRoundOverlay')?.classList.contains('hidden');
    const finalOverlayOpen = !document.getElementById('tournamentFinalOverlay')?.classList.contains('hidden');

    return setupOpen || roundOverlayOpen || finalOverlayOpen;
}
