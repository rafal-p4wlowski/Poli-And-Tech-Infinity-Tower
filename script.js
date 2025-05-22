/**
 * Poli & Tech: Infinity Tower
 * Gra platformowa stworzona z użyciem Canvas.
 */

// ===== GŁÓWNE USTAWIENIA GRY I STAŁE =====

// ===== ELEMENTY DOM =====
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const startBtn = document.getElementById('start-btn');
const newGameBtn = document.getElementById('new-game-btn');
const scoreDisplay = document.getElementById('score-display'); // Wyświetlacz punktów podczas gry
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const backBtn = document.getElementById('back-btn'); // Przycisk powrotu z ustawień
const characterOptions = document.querySelectorAll('.character-option');
const soundToggle = document.getElementById('sound-toggle');
const highScoreDisplayMenu = document.getElementById('high-score-display-menu'); // Wyświetlacz najlepszego wyniku w menu głównym

// Elementy dla rankingu i nazwy gracza
const playerNameMenu = document.getElementById('player-name-menu');
const playerNameInput = document.getElementById('playerNameInput');
const savePlayerNameBtn = document.getElementById('savePlayerNameBtn');
const skipPlayerNameBtn = document.getElementById('skipPlayerNameBtn');
const currentPlayerDisplayMenu = document.getElementById('current-player-display-menu');
const currentPlayerNameSpan = document.getElementById('currentPlayerNameSpan');
const changePlayerNameBtn = document.getElementById('change-player-name-btn');

const rankingBtn = document.getElementById('ranking-btn'); // Przycisk "Ranking" w menu głównym
const leaderboardMenu = document.getElementById('leaderboard-menu'); // Kontener menu rankingu
const leaderboardList = document.getElementById('leaderboard-list'); // Lista ol dla wyników
const refreshLeaderboardBtn = document.getElementById('refresh-leaderboard-btn');
const backToMainMenuFromLeaderboardBtn = document.getElementById('back-to-main-menu-from-leaderboard-btn');


// ===== SKALOWANIE GRY DO ROZMIARU EKRANU =====
let gameScale = 1;
const BASE_WIDTH = 400;
const BASE_HEIGHT = 600;

/**
 * Dostosowuje rozmiar gry do ekranu przy zachowaniu proporcji
 */
function resizeGame() {
    const container = document.getElementById('game-container');
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const maxWidth = Math.min(windowWidth * 0.95, BASE_WIDTH * 1.5);
    const maxHeight = Math.min(windowHeight * 0.9, BASE_HEIGHT * 1.5);
    
    let newWidth, newHeight;
    if (maxWidth / maxHeight > BASE_WIDTH / BASE_HEIGHT) {
        newHeight = maxHeight;
        newWidth = (newHeight * BASE_WIDTH) / BASE_HEIGHT;
    } else {
        newWidth = maxWidth;
        newHeight = (newWidth * BASE_HEIGHT) / BASE_WIDTH;
    }
    
    container.style.width = `${newWidth}px`;
    container.style.height = `${newHeight}px`;
    
    gameScale = newWidth / BASE_WIDTH;
    
    canvas.width = BASE_WIDTH;
    canvas.height = BASE_HEIGHT;
}
window.addEventListener('resize', resizeGame);

// ===== ELEMENTY CANVAS DLA PODGLĄDU POSTACI =====
const poliPreviewCanvas = document.getElementById('poli-preview-canvas');
const techPreviewCanvas = document.getElementById('tech-preview-canvas');
const poliPreviewCtx = poliPreviewCanvas.getContext('2d');
const techPreviewCtx = techPreviewCanvas.getContext('2d');

// ===== KOLORY MOTYWU =====
const THEME_COLOR_FACULTY_PURPLE = '#70126B';
const THEME_COLOR_POLYTECHNIC_BLUE = '#00B6ED';
const THEME_COLOR_WHITE = '#FFFFFF';
const BLINKING_PLATFORM_MAIN_COLOR = '#E40134';

// ===== FIZYKA GRY =====
const GRAVITY_ACCELERATION = 1000; 
const JUMP_VELOCITY_INITIAL = -1000; 
const PLAYER_MAX_HORIZ_SPEED = 500; 

// ===== STAŁE PLATFORM =====
const PLATFORM_COUNT = 5; 
const PLATFORM_HEIGHT = 15; 
const MIN_PLATFORM_WIDTH = 180;
const MAX_PLATFORM_WIDTH = 280;
const PLATFORM_WIDTH_DECREASE_RATE = 12;
const PLATFORM_DIFFICULTY_STEP = 80;
const MIN_PLATFORM_WIDTH_HARD = 25;
const PLATFORM_BASE_MOVE_SPEED = 90;
const PLATFORM_MAX_MOVE_SPEED = 250;

// ===== STAŁE GRACZA =====
const PLAYER_WIDTH = 60; 
const PLAYER_HEIGHT = 70; 

// ===== STAŁE ANIMACJI =====
const JUMP_ANIMATION_DURATION = 500; 
const ARM_ANGLE = -10; 
const BARREL_ROLL_THRESHOLD_VELOCITY = JUMP_VELOCITY_INITIAL * 1.3; 
const BARREL_ROLL_DURATION = 700; 

// ===== TYPY PLATFORM =====
const PLATFORM_TYPES = {
    NORMAL: 'normal',
    BOUNCY: 'bouncy',
    MOVING: 'moving',
    FRAGILE: 'fragile',
    BLINKING: 'blinking'
};

// ===== USTAWIENIA MRUGAJĄCYCH PLATFORM =====
const BLINKING_PLATFORM_INTERVAL = 3000;
const BLINKING_PLATFORM_VISIBLE_DURATION = 2000;

// ===== TYPY ZNAJDZIEK I USTAWIENIA =====
const COLLECTIBLE_TYPES = {
    COIN: 'coin',
    POWER_UP: 'power_up',
    SHIELD: 'shield',
    REVERSE_CONTROLS: 'reverse_controls'
};
const COLLECTIBLE_CHANCE = 0.2; 
const POWER_UP_DURATION_SECONDS = 5; 
const SHIELD_DURATION_SECONDS = 10; 
const REVERSE_CONTROLS_DURATION_SECONDS = 3; 

// ===== STAŁE PODNOSZENIA EKRANU =====
const INITIAL_SCREEN_PUSH_SPEED = 20;
const SCREEN_PUSH_ACCELERATION = 1.5;
const SCREEN_PUSH_SCORE_INTERVAL = 200;

// ===== ESTETYCZNE ZMIANY ŚWIATA GRY =====
const BACKGROUND_THEMES = [ 
    { skyLight: '#87CEFA', skyDark: '#00B6ED' }, 
    { skyLight: '#FFDAB9', skyDark: '#FFA07A' }, 
    { skyLight: '#483D8B', skyDark: '#191970' }, 
    { skyLight: '#ADD8E6', skyDark: '#4682B4' }, 
    { skyLight: '#FFC0CB', skyDark: '#DB7093' }  
];
const BACKGROUND_THEME_SCORE_INTERVAL = 2000; 
const BACKGROUND_THEME_TRANSITION_DURATION_SCORE = BACKGROUND_THEME_SCORE_INTERVAL; 
const PLATFORM_PALETTE_SCORE_INTERVAL = BACKGROUND_THEME_SCORE_INTERVAL / 2; 

// ===== ŚCIEŻKI DO ZASOBÓW =====
const CHARACTER_MODELS_PATH = { 
    poli: './models/poli.svg',
    tech: './models/tech.svg'
};
const SOUND_PATHS = { 
    background: './sounds/background.mp3',
    jump: './sounds/jump.flac',
    gameOver: './sounds/game-over.mp3',
    coin: './sounds/coin.wav',
    powerup: './sounds/powerup.wav',
    shield: './sounds/shield.mp3',
    shield_break: './sounds/shield_break.wav'
};

// ===== GLOBALNE ZMIENNE STANU GRY =====
const sounds = {}; 
let currentCharacter = 'poli'; 
let characterPreviews = { poli: new Image(), tech: new Image() }; 
let gameRunning = false; 
let score = 0; 
let highScore = 0; // Lokalny najlepszy wynik
let platforms = []; 
let collectibles = []; 
let cameraOffset = 0; 
let currentScreenPushSpeed = INITIAL_SCREEN_PUSH_SPEED; 
let player = {};
let keys = { ArrowLeft: false, ArrowRight: false };
let lastTime = 0; 
let gameTime = 0;

// Zmienne dla rankingu i nazwy gracza
let currentPlayerName = ''; // Przechowuje aktualną nazwę gracza


// ===== INICJALIZACJA I KONTROLA DŹWIĘKÓW =====
function initSounds() {
    for (const key in SOUND_PATHS) {
        sounds[key] = new Audio(SOUND_PATHS[key]);
        sounds[key].addEventListener('error', (e) => {
            console.error(`Nie udało się załadować dźwięku "${key}": ${SOUND_PATHS[key]}`, e);
        });
    }
    sounds.background.loop = true;
    sounds.background.volume = 0.4;
    sounds.jump.volume = 0.2;
    sounds.gameOver.volume = 0.4;
    sounds.coin.volume = 0.2;
    sounds.powerup.volume = 0.2;
    sounds.shield.volume = 0.2;
    sounds.shield_break.volume = 0.2;

    if (soundToggle) {
        setSoundMuted(!soundToggle.checked); 
    }
}

function setSoundMuted(muted) {
    for (const key in sounds) {
        if (sounds[key] instanceof Audio) {
            sounds[key].muted = muted;
        }
    }
}

function playSound(soundName) {
    if (sounds[soundName] && sounds[soundName].play) {
        sounds[soundName].currentTime = 0; 
        sounds[soundName].play().catch(e => console.warn(`Problem z odtwarzaniem dźwięku "${soundName}":`, e.message));
    } else {
        console.warn(`Próba odtworzenia nieznanego lub nieprawidłowego dźwięku: "${soundName}"`);
    }
}

// ===== FUNKCJE POMOCNICZE =====
function getPlatformParameters(currentScore) {
    const difficultyLevel = Math.floor(currentScore / PLATFORM_DIFFICULTY_STEP);
    let minWidth = MIN_PLATFORM_WIDTH - (difficultyLevel * PLATFORM_WIDTH_DECREASE_RATE);
    let maxWidth = MAX_PLATFORM_WIDTH - (difficultyLevel * PLATFORM_WIDTH_DECREASE_RATE * 1.5);
    minWidth = Math.max(minWidth, MIN_PLATFORM_WIDTH_HARD); 
    maxWidth = Math.max(maxWidth, MIN_PLATFORM_WIDTH_HARD + 40);
    if (maxWidth < minWidth) maxWidth = minWidth + 10; 
    return { minWidth, maxWidth };
}

// ZMODYFIKOWANE SZANSE NA PLATFORMY SPECJALNE
function getSpecialPlatformChances(level) {
    return {
        [PLATFORM_TYPES.BOUNCY]: Math.min(0.06 + level * 0.012, 0.18),
        [PLATFORM_TYPES.MOVING]: Math.min(0.05 + level * 0.015, 0.20),
        [PLATFORM_TYPES.FRAGILE]: Math.min(0.04 + level * 0.018, 0.25),
        [PLATFORM_TYPES.BLINKING]: Math.min(0.03 + level * 0.01, 0.15)
    };
}

function createCollectible(x, y, type = null) {
    if (!type) { 
        const roll = Math.random();
        if (roll < 0.65) type = COLLECTIBLE_TYPES.COIN;
        else if (roll < 0.80) type = COLLECTIBLE_TYPES.POWER_UP;
        else if (roll < 0.95) type = COLLECTIBLE_TYPES.SHIELD;
        else type = COLLECTIBLE_TYPES.REVERSE_CONTROLS;
    }

    const properties = {
        [COLLECTIBLE_TYPES.COIN]: { color: '#FFD700', size: 15, sound: 'coin' }, 
        [COLLECTIBLE_TYPES.POWER_UP]: { color: '#E40134', size: 20, sound: 'powerup' }, 
        [COLLECTIBLE_TYPES.SHIELD]: { color: '#00A4B7', size: 20, sound: 'shield' }, 
        [COLLECTIBLE_TYPES.REVERSE_CONTROLS]: { color: '#009D4C', size: 25, sound: 'shield_break' } 
    };
    collectibles.push({
        x: x, y: y - 25, 
        type: type, color: properties[type].color,
        size: properties[type].size, collected: false, angle: 0, 
        sound: properties[type].sound 
    });
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function interpolateColor(color1, color2, factor) {
    if (factor <= 0) return color1;
    if (factor >= 1) return color2;

    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// ===== ANIMACJA GRACZA (SVG) =====
function updatePlayerModelImage() {
    if (!player.svgDoc) return; 

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(player.svgDoc); 
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' }); 
    const url = URL.createObjectURL(svgBlob); 
    const img = new Image();

    img.onload = function() {
        player.model = img; 
        URL.revokeObjectURL(url); 
    };
    img.onerror = function() {
        console.error("updatePlayerModelImage: Błąd ładowania obrazu z zaktualizowanych danych SVG.");
        URL.revokeObjectURL(url);
    }
    img.src = url; 
}

function startJumpAnimation() {
    if (!player.svgDoc || !player.leftArm || !player.rightArm) return; 
    player.isJumping = true; 
    player.jumpStartTime = Date.now(); 
}

function animateArms() {
    if (!player.isJumping || !player.svgDoc || !player.leftArm || !player.rightArm) return;

    const elapsed = Date.now() - player.jumpStartTime; 
    const progress = Math.min(elapsed / JUMP_ANIMATION_DURATION, 1); 
    let angle; 
    
    if (progress < 0.5) angle = ARM_ANGLE * (progress * 2);
    else angle = ARM_ANGLE * (1 - (progress - 0.5) * 2);

    const leftX = parseInt(player.leftArm.getAttribute('x'));
    const leftY = parseInt(player.leftArm.getAttribute('y'));
    const leftWidth = parseInt(player.leftArm.getAttribute('width'));

    const rightX = parseInt(player.rightArm.getAttribute('x'));
    const rightY = parseInt(player.rightArm.getAttribute('y'));
    const rightWidth = parseInt(player.rightArm.getAttribute('width'));

    const leftArmRotatePointX = leftX + leftWidth / 2;
    const leftArmRotatePointY = leftY;
    const rightArmRotatePointX = rightX + rightWidth / 2;
    const rightArmRotatePointY = rightY;

    player.leftArm.setAttribute('transform', `rotate(${-angle} ${leftArmRotatePointX} ${leftArmRotatePointY})`);
    player.rightArm.setAttribute('transform', `rotate(${angle} ${rightArmRotatePointX} ${rightArmRotatePointY})`);
    updatePlayerModelImage(); 

    if (progress >= 1) { 
        player.isJumping = false; 
        player.leftArm.setAttribute('transform', player.leftArmTransform || '');
        player.rightArm.setAttribute('transform', player.rightArmTransform || '');
        updatePlayerModelImage();
    }
}

function startBarrelRollAnimation(currentVy) {
    if (player.powerUpActive || Math.abs(currentVy) > Math.abs(BARREL_ROLL_THRESHOLD_VELOCITY)) {
        if (!player.isBarrelRolling) { 
            player.isBarrelRolling = true;
            player.barrelRollStartTime = Date.now();
            player.barrelRollDirection = (player.vx >= 0) ? 1 : -1; 
        }
    }
}

function animateBarrelRoll() {
    if (!player.isBarrelRolling || !player.modelLoaded || !player.model) return;
    const elapsed = Date.now() - player.barrelRollStartTime;
    const progress = Math.min(elapsed / BARREL_ROLL_DURATION, 1);
    if (progress >= 1) { 
        player.isBarrelRolling = false;
    }
}

// ===== KONFIGURACJA UI I POSTACI =====
function loadCharacterPreviews() {
    ['poli', 'tech'].forEach(charName => {
        const previewImg = characterPreviews[charName];
        const previewCtxToUse = (charName === 'poli') ? poliPreviewCtx : techPreviewCtx;
        const previewCanvasToUse = (charName === 'poli') ? poliPreviewCanvas : techPreviewCanvas;
        previewImg.onload = function() { 
            previewCtxToUse.clearRect(0, 0, previewCanvasToUse.width, previewCanvasToUse.height); 
            previewCtxToUse.drawImage(previewImg, 0, 0, previewCanvasToUse.width, previewCanvasToUse.height); 
        };
        previewImg.onerror = function() { 
            console.warn(`Nie można załadować podglądu dla ${charName}. Rysowanie zastępczego elementu.`);
            previewCtxToUse.fillStyle = (charName === 'poli') ? THEME_COLOR_POLYTECHNIC_BLUE : THEME_COLOR_FACULTY_PURPLE;
            previewCtxToUse.fillRect(10, 10, previewCanvasToUse.width - 20, previewCanvasToUse.height - 20); 
        };
        previewImg.src = CHARACTER_MODELS_PATH[charName]; 
    });
}

function loadPlayerModel(characterType = currentCharacter) {
    if (!CHARACTER_MODELS_PATH[characterType]) {
        console.error(`Ścieżka do modelu postaci "${characterType}" nie jest zdefiniowana.`);
        player.modelLoaded = false; return;
    }
    player.modelLoaded = false; player.svgDoc = null; 
    fetch(CHARACTER_MODELS_PATH[characterType]) 
        .then(response => {
            if (!response.ok) throw new Error(`Błąd HTTP! status: ${response.status} dla ${CHARACTER_MODELS_PATH[characterType]}`);
            return response.text(); 
        })
        .then(svgText => {
            const parser = new DOMParser();
            player.svgDoc = parser.parseFromString(svgText, 'image/svg+xml'); 
            const parseError = player.svgDoc.getElementsByTagName('parsererror');
            if (parseError.length > 0 || !player.svgDoc.documentElement) { 
                console.error("Błąd parsowania SVG:", parseError.length > 0 ? parseError[0].textContent : "Brak elementu głównego SVG");
                throw new Error("Błąd parsowania SVG.");
            }

            player.leftArm = player.svgDoc.querySelector('#left-arm');
            player.rightArm = player.svgDoc.querySelector('#right-arm');
            player.head = player.svgDoc.querySelector('#head');

            if (!player.head) console.warn("Element #head nie został znaleziony w SVG.");
            if (!player.leftArm) console.warn("Element #left-arm nie został znaleziony w SVG.");
            if (!player.rightArm) console.warn("Element #right-arm nie został znaleziony w SVG.");

            if(player.leftArm) player.leftArmTransform = player.leftArm.getAttribute('transform') || '';
            if(player.rightArm) player.rightArmTransform = player.rightArm.getAttribute('transform') || '';
            if(player.head) {
                player.headTransform = player.head.getAttribute('transform') || '';
                player.head.setAttribute('transform', player.headTransform); 
            }

            updatePlayerModelImage(); 
            player.modelLoaded = true; 
        })
        .catch(error => { 
            console.warn(`Nie udało się załadować modelu SVG ${characterType}: ${error}. Używanie domyślnego koloru.`);
            player.model = null; player.modelLoaded = false;
        });
    player.color = (characterType === 'poli') ? THEME_COLOR_POLYTECHNIC_BLUE : THEME_COLOR_FACULTY_PURPLE; 
}

function setupCharacterSelection() {
    characterOptions.forEach(option => {
        option.addEventListener('click', function() {
            currentCharacter = this.dataset.character; 
            characterOptions.forEach(opt => opt.classList.remove('selected')); 
            this.classList.add('selected'); 
            loadPlayerModel(currentCharacter); 
        });
    });
    const defaultOption = document.querySelector(`.character-option[data-character="${currentCharacter}"]`);
    if (defaultOption) defaultOption.classList.add('selected');
}

// ===== ZARZĄDZANIE NAZWĄ GRACZA I RANKINGIEM =====
function loadPlayerName() {
    const savedName = localStorage.getItem('poliTechPlayerName');
    if (savedName) {
        currentPlayerName = savedName;
        currentPlayerNameSpan.textContent = savedName;
        playerNameMenu.style.display = 'none';
        menu.style.display = 'flex'; // Pokaż menu główne
    } else {
        playerNameMenu.style.display = 'flex'; // Pokaż menu wpisywania nazwy
        menu.style.display = 'none';
        currentPlayerNameSpan.textContent = 'Graczu';
    }
    updateLocalHighScoreDisplay(); // Aktualizuj wyświetlanie lokalnego high score
}

function savePlayerNameAndProceed() {
    const nameToSave = playerNameInput.value.trim();
    if (nameToSave && nameToSave.length > 2 && nameToSave.length <= 15) { // Prosta walidacja
        currentPlayerName = nameToSave;
        localStorage.setItem('poliTechPlayerName', nameToSave);
        currentPlayerNameSpan.textContent = nameToSave;
        playerNameMenu.style.display = 'none';
        menu.style.display = 'flex';
        fetchLeaderboard(); // Pobierz ranking od razu po zapisaniu nazwy
    } else {
        alert('Nazwa gracza musi mieć od 3 do 15 znaków.');
        playerNameInput.focus();
    }
}

function skipPlayerName() {
    currentPlayerName = ''; // Ustaw pustą nazwę, jeśli gracz pomija
    currentPlayerNameSpan.textContent = 'Graczu (anonim)';
    playerNameMenu.style.display = 'none';
    menu.style.display = 'flex';
    fetchLeaderboard(); // Pobierz ranking nawet jeśli gracz jest anonimowy
}

function changePlayerName() {
    menu.style.display = 'none';
    settingsMenu.style.display = 'none';
    leaderboardMenu.style.display = 'none';
    playerNameMenu.style.display = 'flex';
    playerNameInput.value = currentPlayerName; // Wypełnij input obecną nazwą
    playerNameInput.focus();
}

async function fetchLeaderboard() {
    if (!leaderboardList) return;
    leaderboardList.innerHTML = '<li class="loading">Ładowanie rankingu...</li>';
    try {
        const response = await fetch('/get-leaderboard'); 
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        }
        const leaderboardData = await response.json();
        displayLeaderboard(leaderboardData);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        leaderboardList.innerHTML = '<li class="empty">Nie udało się załadować rankingu. Spróbuj odświeżyć.</li>';
    }
}

function displayLeaderboard(leaderboardData) {
    if (!leaderboardList) return;
    leaderboardList.innerHTML = ''; 
    if (leaderboardData && leaderboardData.length > 0) {
        leaderboardData.forEach((entry, index) => {
            const listItem = document.createElement('li');
            // Wyróżnij aktualnego gracza, jeśli jest w rankingu
            if (entry.playerName === currentPlayerName && currentPlayerName !== '') {
                listItem.innerHTML = `<strong>${index + 1}. ${entry.playerName} - ${entry.score} pkt (To Ty!)</strong>`;
                listItem.style.color = THEME_COLOR_POLYTECHNIC_BLUE; // Kolor wyróżnienia
            } else {
                listItem.textContent = `${index + 1}. ${entry.playerName} - ${entry.score} pkt`;
            }
            leaderboardList.appendChild(listItem);
        });
    } else {
        leaderboardList.innerHTML = '<li class="empty">Brak wyników w rankingu. Bądź pierwszy!</li>';
    }
}

async function submitScoreToLeaderboard(finalScore) {
    if (!currentPlayerName) {
        console.log('Wynik nie zostanie zapisany w rankingu online - brak nazwy gracza.');
        return; // Nie wysyłaj, jeśli gracz jest anonimowy
    }
    if (finalScore <= 0) {
        console.log('Wynik 0 lub mniej, nie wysyłamy do rankingu.');
        return;
    }

    console.log(`Wysyłanie wyniku: ${finalScore} dla gracza: ${currentPlayerName}`);
    try {
        const response = await fetch('/submit-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName: currentPlayerName, score: finalScore }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorData.details || errorData.error}`);
        }
        const result = await response.json();
        console.log('Odpowiedź serwera po zapisie wyniku:', result.message);
        fetchLeaderboard(); 
    } catch (error) {
        console.error('Błąd podczas wysyłania wyniku do rankingu:', error);
    }
}

function updateLocalHighScoreDisplay() {
    const localHighScore = parseInt(localStorage.getItem('poliTechLocalHighScore') || '0');
    if (localHighScore > 0) {
        highScoreDisplayMenu.innerText = `Twój najlepszy wynik: ${localHighScore}`;
        highScoreDisplayMenu.style.display = 'block';
    } else {
        highScoreDisplayMenu.style.display = 'none';
    }
    highScore = localHighScore;
}


// ===== KONFIGURACJA UI I NAWIGACJA =====
function setupMenusAndNavigation() {
    startBtn.addEventListener('click', () => {
        showGameScreen();
        startGameLogic();
    });

    newGameBtn.addEventListener('click', () => {
        showGameScreen(); 
        resetGameLogic(); 
        startGameLogic(); 
    });
    
    settingsBtn.addEventListener('click', () => {
        menu.style.display = 'none';
        settingsMenu.style.display = 'flex';
    });
    backBtn.addEventListener('click', () => { 
        settingsMenu.style.display = 'none';
        menu.style.display = 'flex';
        updateLocalHighScoreDisplay(); 
    });

    rankingBtn.addEventListener('click', () => {
        menu.style.display = 'none';
        leaderboardMenu.style.display = 'flex';
        fetchLeaderboard(); 
    });
    backToMainMenuFromLeaderboardBtn.addEventListener('click', () => {
        leaderboardMenu.style.display = 'none';
        menu.style.display = 'flex';
    });
    refreshLeaderboardBtn.addEventListener('click', fetchLeaderboard);

    savePlayerNameBtn.addEventListener('click', savePlayerNameAndProceed);
    playerNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            savePlayerNameAndProceed();
        }
    });
    skipPlayerNameBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        skipPlayerName();
    });
    changePlayerNameBtn.addEventListener('click', changePlayerName);


    if (soundToggle) { 
        soundToggle.addEventListener('change', function() {
            setSoundMuted(!this.checked);
        });
    }
}

function showPlayerNameScreen() {
    playerNameMenu.style.display = 'flex';
    menu.style.display = 'none';
    settingsMenu.style.display = 'none';
    leaderboardMenu.style.display = 'none';
    canvas.style.display = 'block'; 
    scoreDisplay.style.display = 'none'; 
}

function showMainMenu() {
    playerNameMenu.style.display = 'none';
    menu.style.display = 'flex';
    settingsMenu.style.display = 'none';
    leaderboardMenu.style.display = 'none';
    canvas.style.display = 'block';
    scoreDisplay.style.display = 'none';
    updateLocalHighScoreDisplay();
}

function showGameScreen() {
    playerNameMenu.style.display = 'none';
    menu.style.display = 'none';
    settingsMenu.style.display = 'none';
    leaderboardMenu.style.display = 'none';
    canvas.style.display = 'block';
    scoreDisplay.style.display = 'block'; 
}

function resetPlayerState() {
    const initialSvgDoc = player.svgDoc;
    const initialModel = player.model;
    const initialModelLoaded = player.modelLoaded;
    const initialLeftArmTransform = player.leftArmTransform;
    const initialRightArmTransform = player.rightArmTransform;
    const initialHeadTransform = player.headTransform;

    player = {
        x: canvas.width / 2 - PLAYER_WIDTH / 2, 
        y: canvas.height - 100, 
        vx: 0, vy: 0, 
        width: PLAYER_WIDTH, height: PLAYER_HEIGHT,
        color: (currentCharacter === 'poli') ? THEME_COLOR_POLYTECHNIC_BLUE : THEME_COLOR_FACULTY_PURPLE,
        modelLoaded: initialModelLoaded, model: initialModel, svgDoc: initialSvgDoc, 
        leftArm: initialSvgDoc ? initialSvgDoc.querySelector('#left-arm') : null,
        rightArm: initialSvgDoc ? initialSvgDoc.querySelector('#right-arm') : null,
        head: initialSvgDoc ? initialSvgDoc.querySelector('#head') : null,
        leftArmTransform: initialLeftArmTransform || '', 
        rightArmTransform: initialRightArmTransform || '',
        headTransform: initialHeadTransform || '',
        lastDirection: 'right', 
        powerUpActive: false, 
        powerUpTimer: 0, 
        hasShield: false, 
        shieldTimer: 0, 
        isJumping: false, jumpStartTime: 0, 
        isBarrelRolling: false, barrelRollStartTime: 0, barrelRollDirection: 1, 
        controlsReversed: false, 
        reverseControlsTimer: 0 
    };

    if (player.leftArm && player.leftArmTransform !== undefined) player.leftArm.setAttribute('transform', player.leftArmTransform);
    if (player.rightArm && player.rightArmTransform !== undefined) player.rightArm.setAttribute('transform', player.rightArmTransform);
    if (player.head && player.headTransform !== undefined) player.head.setAttribute('transform', player.headTransform);

    if (player.modelLoaded) { 
        updatePlayerModelImage();
    }
}

// ===== TWORZENIE ELEMENTÓW GRY (PLATFORMY, ZNAJDŹKI) =====
function createInitialPlatforms() {
    platforms = [];
    platforms.push({
        x: 0, y: canvas.height - 20, width: canvas.width, height: PLATFORM_HEIGHT,
        isBase: true, type: PLATFORM_TYPES.NORMAL, 
        colorTop: '#A0429B', colorBottom: THEME_COLOR_FACULTY_PURPLE, highlightColor: '#B788B5',
        level: 0, health: Infinity, 
        bounceVelocity: JUMP_VELOCITY_INITIAL,
        borderRadius: 10 
    });

    const { minWidth, maxWidth } = getPlatformParameters(0); 
    for (let i = 0; i < PLATFORM_COUNT; i++) {
        const lastPlatformY = platforms[platforms.length - 1].y;
        const newY = lastPlatformY - (50 + Math.random() * 40); 
        addNewPlatform(maxWidth, minWidth, newY);
    }
}

function addNewPlatform(maxWidth, minWidth, y) {
    const platformWidth = Math.random() * (maxWidth - minWidth) + minWidth; 
    const x = Math.random() * (canvas.width - platformWidth); 
    const level = Math.floor(score / PLATFORM_DIFFICULTY_STEP); 
    const chances = getSpecialPlatformChances(level); 
    let platformType = PLATFORM_TYPES.NORMAL; 
    const roll = Math.random();
    let cumulativeChance = 0;

    for (const [type, chance] of Object.entries(chances)) {
        cumulativeChance += chance;
        if (roll < cumulativeChance) {
            platformType = type;
            break;
        }
    }

    const basePlatformColors = {
        [PLATFORM_TYPES.NORMAL]: { colorTop: '#A0429B', colorBottom: THEME_COLOR_FACULTY_PURPLE, highlightColor: '#B788B5' },
        [PLATFORM_TYPES.BOUNCY]: { colorTop: '#1A48A6', colorBottom: '#13357A', highlightColor: '#7185AF' },
        [PLATFORM_TYPES.MOVING]: { colorTop: '#19A65D', colorBottom: '#009D4C', highlightColor: '#66C493' },
        [PLATFORM_TYPES.FRAGILE]: { colorTop: '#F18A3B', colorBottom: '#F07E26', highlightColor: '#F9CBA8' },
        [PLATFORM_TYPES.BLINKING]: { colorTop: BLINKING_PLATFORM_MAIN_COLOR, colorBottom: '#A00020', highlightColor: '#F05070' } // Kolory dla mrugającej platformy
    };

    const platformColorPalettes = [
        basePlatformColors, 
        { 
            [PLATFORM_TYPES.NORMAL]: { colorTop: '#C062BB', colorBottom: '#90328B', highlightColor: '#D7A8D5' },
            [PLATFORM_TYPES.BOUNCY]: { colorTop: '#3A68C6', colorBottom: '#33559A', highlightColor: '#91A5CF' },
            [PLATFORM_TYPES.MOVING]: { colorTop: '#39C67D', colorBottom: '#20B06C', highlightColor: '#86E4B3' },
            [PLATFORM_TYPES.FRAGILE]: { colorTop: '#feb46b', colorBottom: '#ff9633', highlightColor: '#FFDBCA' },
            [PLATFORM_TYPES.BLINKING]: { colorTop: BLINKING_PLATFORM_MAIN_COLOR, colorBottom: '#A00020', highlightColor: '#F05070' }
        },
        { 
            [PLATFORM_TYPES.NORMAL]: { colorTop: '#8A2BE2', colorBottom: '#4B0082', highlightColor: '#C7A0E5' },
            [PLATFORM_TYPES.BOUNCY]: { colorTop: '#00CED1', colorBottom: '#20B2AA', highlightColor: '#A0E5E5' },
            [PLATFORM_TYPES.MOVING]: { colorTop: '#32CD32', colorBottom: '#228B22', highlightColor: '#98FB98' },
            [PLATFORM_TYPES.FRAGILE]: { colorTop: '#FF6347', colorBottom: '#DC143C', highlightColor: '#FFA07A' },
            [PLATFORM_TYPES.BLINKING]: { colorTop: BLINKING_PLATFORM_MAIN_COLOR, colorBottom: '#A00020', highlightColor: '#F05070' }
        }
    ];

    const currentPaletteIndex = Math.min(Math.floor(score / PLATFORM_PALETTE_SCORE_INTERVAL), platformColorPalettes.length - 1);
    const currentPalette = platformColorPalettes[currentPaletteIndex];
    const colors = currentPalette[platformType] || basePlatformColors[platformType]; 
    const borderRadius = Math.max(5, Math.min(7, platformWidth / 10)); 

    const newPlatform = {
        x, y, width: platformWidth, height: PLATFORM_HEIGHT,
        colorTop: colors.colorTop, colorBottom: colors.colorBottom, highlightColor: colors.highlightColor,
        type: platformType, level,
        moveDirection: (platformType === PLATFORM_TYPES.MOVING) ? (Math.random() > 0.5 ? 1 : -1) : 0, 
        moveSpeed: (platformType === PLATFORM_TYPES.MOVING) ? 
            Math.min(PLATFORM_BASE_MOVE_SPEED + Math.random() * Math.min(level, 8) * 20, PLATFORM_MAX_MOVE_SPEED) : 0,
        health: (platformType === PLATFORM_TYPES.FRAGILE) ? 1 : Infinity, 
        bounceVelocity: (platformType === PLATFORM_TYPES.BOUNCY) ? (JUMP_VELOCITY_INITIAL * 1.5) : JUMP_VELOCITY_INITIAL, 
        borderRadius: borderRadius,
        isVisible: (platformType === PLATFORM_TYPES.BLINKING) ? true : undefined,
        blinkTimer: (platformType === PLATFORM_TYPES.BLINKING) ? BLINKING_PLATFORM_VISIBLE_DURATION : undefined,
        initialBlinkOffset: (platformType === PLATFORM_TYPES.BLINKING) ? Math.random() * BLINKING_PLATFORM_INTERVAL : 0
    };
    platforms.push(newPlatform); 

    if (Math.random() < COLLECTIBLE_CHANCE && platformType !== PLATFORM_TYPES.FRAGILE && platformType !== PLATFORM_TYPES.BLINKING) {
        createCollectible(x + platformWidth / 2, y); 
    }
    return newPlatform;
}

// ===== GŁÓWNY CYKL ŻYCIA GRY (INIT, START, RESET, GAMEOVER) =====
function init() {
    resizeGame(); 
    initSounds(); 
    loadCharacterPreviews(); 
    resetPlayerState(); 
    loadPlayerModel(currentCharacter); 
    setupCharacterSelection(); 
    setupMenusAndNavigation();

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    
    loadPlayerName(); 

    newGameBtn.style.display = 'none'; 
    highScoreDisplayMenu.style.display = 'none'; 

    createInitialPlatforms(); 
    currentScreenPushSpeed = INITIAL_SCREEN_PUSH_SPEED; 

    requestAnimationFrame(drawStaticElements); 
}

function drawStaticElements() {
    if (canvas.style.display !== 'none') {
        drawBackground();
    }
}

function startGameLogic() {
    if (gameRunning) return; 
    
    gameRunning = true; 
    playSound('background'); 

    if (platforms.length > 0 && player.y + player.height >= platforms[0].y) {
        player.y = platforms[0].y - player.height;
        player.vy = 0; 
    }

    lastTime = 0; 
    gameTime = 0;
    gameAnimationLoop(); 
}

function resetGameLogic() {
    gameRunning = false; 
    score = 0; 
    scoreDisplay.innerText = `Punkty: ${score}`; 
    cameraOffset = 0; 
    collectibles = []; 
    keys = { ArrowLeft: false, ArrowRight: false }; 
    gameTime = 0;

    resetPlayerState(); 
    createInitialPlatforms(); 

    currentScreenPushSpeed = INITIAL_SCREEN_PUSH_SPEED; 

    sounds.background.pause();
    sounds.background.currentTime = 0;
    if (sounds.gameOver) {
        sounds.gameOver.pause();
        sounds.gameOver.currentTime = 0;
    }
}

function handleGameOver() { 
    if (player.hasShield) {
        player.hasShield = false;
        player.shieldTimer = 0; 
        player.y = Math.min(player.y, canvas.height - player.height - 50); 
        player.vy = JUMP_VELOCITY_INITIAL * 0.8; 
        playSound('shield_break'); 
        return; 
    }

    gameRunning = false; 
    playSound('gameOver'); 
    sounds.background.pause(); 

    const localHighScore = parseInt(localStorage.getItem('poliTechLocalHighScore') || '0');
    if (score > localHighScore) {
        localStorage.setItem('poliTechLocalHighScore', score.toString());
        highScore = score; 
    }
    updateLocalHighScoreDisplay(); 

    if (currentPlayerName) {
        submitScoreToLeaderboard(score);
    }

    showMainMenu(); 
    startBtn.style.display = 'none'; 
    newGameBtn.style.display = 'block'; 
    settingsBtn.style.display = 'block'; 
}

// ===== OBSŁUGA ZDARZEŃ (KLAWISZE) =====
function keyDownHandler(e) {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
    else if (e.key === 'ArrowRight') keys.ArrowRight = true;
}

function keyUpHandler(e) {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
    else if (e.key === 'ArrowRight') keys.ArrowRight = false;
}

// ===== LOGIKA AKTUALIZACJI GRY =====
function update(deltaTime) {
    if (!gameRunning) return; 
    gameTime += deltaTime * 1000;

    updatePlayerMovement(deltaTime); 
    updatePlayerPhysics(deltaTime); 
    if (player.isJumping) animateArms(); 
    if (player.isBarrelRolling) animateBarrelRoll(); 

    updatePlatforms(deltaTime); 
    checkPlatformCollisions(deltaTime); 
    checkCollectibleCollisions(); 
    
    updateCameraAndElements(deltaTime); 

    if (player.y > canvas.height + player.height * 0.5) { 
        handleGameOver(); 
    }
}

function updatePlayerMovement(deltaTime) {
    let targetVx = 0; 
    let moveLeftEffective = keys.ArrowLeft;
    let moveRightEffective = keys.ArrowRight;

    if (player.controlsReversed) {
        moveLeftEffective = keys.ArrowRight;
        moveRightEffective = keys.ArrowLeft;
    }

    if (moveLeftEffective) {
        targetVx = -PLAYER_MAX_HORIZ_SPEED; 
        player.lastDirection = 'left'; 
    } else if (moveRightEffective) {
        targetVx = PLAYER_MAX_HORIZ_SPEED; 
        player.lastDirection = 'right';
    }
    player.vx = targetVx; 
    player.x += player.vx * deltaTime; 

    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
}

function updatePlayerPhysics(deltaTime) {
    player.vy += GRAVITY_ACCELERATION * deltaTime; 
    player.y += player.vy * deltaTime; 

    if (player.powerUpActive) {
        player.powerUpTimer -= deltaTime;
        if (player.powerUpTimer <= 0) {
            player.powerUpActive = false;
            player.powerUpTimer = 0;
        }
    }

    if (player.hasShield) {
        player.shieldTimer -= deltaTime;
        if (player.shieldTimer <= 0) {
            player.hasShield = false;
            player.shieldTimer = 0;
        }
    }

    if (player.controlsReversed) {
        player.reverseControlsTimer -= deltaTime;
        if (player.reverseControlsTimer <= 0) {
            player.controlsReversed = false;
            player.reverseControlsTimer = 0;
        }
    }
}

function updatePlatforms(deltaTime) {
    platforms.forEach(p => {
        if (p.type === PLATFORM_TYPES.MOVING) { 
            p.x += p.moveDirection * p.moveSpeed * deltaTime; 
            if (p.x <= 0 || p.x + p.width >= canvas.width) {
                p.moveDirection *= -1;
                p.x = Math.max(0, Math.min(p.x, canvas.width - p.width)); 
            }
        }
        if (p.type === PLATFORM_TYPES.BLINKING) {
            const timeInCycle = (gameTime + p.initialBlinkOffset) % BLINKING_PLATFORM_INTERVAL;
            p.isVisible = timeInCycle < BLINKING_PLATFORM_VISIBLE_DURATION;
        }
    });
    platforms = platforms.filter(p => p.health > 0); 
}

function checkPlatformCollisions(deltaTime) {
    for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];

        if (p.type === PLATFORM_TYPES.BLINKING && !p.isVisible) {
            continue;
        }

        const playerFeetCurrent = player.y + player.height; 
        const playerFeetPrevious = (player.y - (player.vy * deltaTime)) + player.height; 

        if (player.vy >= 0 &&
            playerFeetCurrent >= p.y &&
            playerFeetPrevious <= p.y + PLATFORM_HEIGHT * 0.5 && 
            player.x + player.width * 0.8 > p.x && 
            player.x + player.width * 0.2 < p.x + p.width) {

            player.y = p.y - player.height; 
            let currentBounceVelocity = p.bounceVelocity; 

            if (p.type === PLATFORM_TYPES.FRAGILE) { 
                currentBounceVelocity = JUMP_VELOCITY_INITIAL * 0.7; 
                p.health--; 
            }

            player.vy = player.powerUpActive && p.type !== PLATFORM_TYPES.FRAGILE ? currentBounceVelocity * 1.2 : currentBounceVelocity;

            playSound('jump'); 
            startJumpAnimation(); 
            startBarrelRollAnimation(player.vy); 

            break; 
        }
    }
}

function checkCollectibleCollisions() {
    for (let i = collectibles.length - 1; i >= 0; i--) { 
        const collectible = collectibles[i];
        const dx = (player.x + player.width / 2) - collectible.x;
        const dy = (player.y + player.height / 2) - collectible.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.width / 2 + collectible.size / 2) {
            collectible.collected = true; 
            playSound(collectible.sound); 

            switch (collectible.type) {
                case COLLECTIBLE_TYPES.COIN:
                    score += 10; 
                    break;
                case COLLECTIBLE_TYPES.POWER_UP:
                    player.powerUpActive = true; 
                    player.powerUpTimer = POWER_UP_DURATION_SECONDS; 
                    break;
                case COLLECTIBLE_TYPES.SHIELD:
                    player.hasShield = true; 
                    player.shieldTimer = SHIELD_DURATION_SECONDS; 
                    break;
                case COLLECTIBLE_TYPES.REVERSE_CONTROLS:
                    player.controlsReversed = true; 
                    player.reverseControlsTimer = REVERSE_CONTROLS_DURATION_SECONDS; 
                    break;
            }
            collectibles.splice(i, 1); 
        }
    }
}

function updateCameraAndElements(deltaTime) {
    currentScreenPushSpeed = INITIAL_SCREEN_PUSH_SPEED + Math.floor(score / SCREEN_PUSH_SCORE_INTERVAL) * SCREEN_PUSH_ACCELERATION;
    const autoScrollAmount = currentScreenPushSpeed * deltaTime; 

    player.y += autoScrollAmount;
    platforms.forEach(p => p.y += autoScrollAmount);
    collectibles.forEach(c => c.y += autoScrollAmount);
    cameraOffset += autoScrollAmount; 

    if (player.y < canvas.height / 2) {
        const playerMovementOffsetY = (canvas.height / 2) - player.y;
        player.y += playerMovementOffsetY;
        platforms.forEach(p => p.y += playerMovementOffsetY);
        collectibles.forEach(c => c.y += playerMovementOffsetY);
        cameraOffset += playerMovementOffsetY; 
    }

    const heightScore = Math.floor(cameraOffset / 10); 
    score = Math.max(score, heightScore); 
    scoreDisplay.innerText = `Punkty: ${score}`; 

    const removalThreshold = canvas.height + PLATFORM_HEIGHT * 3; 
    platforms = platforms.filter(p => p.y < removalThreshold);
    collectibles = collectibles.filter(c => c.y < removalThreshold);

    let highestPlatformY = canvas.height; 
    if (platforms.length > 0) {
        highestPlatformY = platforms.reduce((minY, p) => Math.min(minY, p.y), canvas.height);
    }

    const generationTriggerY = -PLATFORM_HEIGHT * 2; 
    while (highestPlatformY > generationTriggerY && platforms.length < PLATFORM_COUNT + 5) { 
        const { minWidth, maxWidth } = getPlatformParameters(score); 
        const newY = highestPlatformY - (50 + Math.random() * 50); 
        const newPlatform = addNewPlatform(maxWidth, minWidth, newY); 
        highestPlatformY = newPlatform.y; 
    }
}

// ===== FUNKCJE RYSUJĄCE =====
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    drawBackground();
    drawPlatforms();
    drawCollectibles(); 
    drawPlayer();
    ctx.restore();
}

function drawBackground() {
    let theme1Index = Math.floor(score / BACKGROUND_THEME_SCORE_INTERVAL) % BACKGROUND_THEMES.length;
    let theme2Index = (theme1Index + 1) % BACKGROUND_THEMES.length;

    const currentThemeStartScore = theme1Index * BACKGROUND_THEME_SCORE_INTERVAL;
    const scoreIntoCurrentThemeInterval = score - currentThemeStartScore; 

    let transitionFactor = scoreIntoCurrentThemeInterval / BACKGROUND_THEME_TRANSITION_DURATION_SCORE;
    transitionFactor = Math.min(1, Math.max(0, transitionFactor)); 

    const theme1 = BACKGROUND_THEMES[theme1Index];
    const theme2 = BACKGROUND_THEMES[theme2Index];

    const skyLight = interpolateColor(theme1.skyLight, theme2.skyLight, transitionFactor);
    const skyDark = interpolateColor(theme1.skyDark, theme2.skyDark, transitionFactor);

    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, skyLight); 
    bgGradient.addColorStop(1, skyDark); 
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    drawStars(); 
}

function drawStars() {
    ctx.fillStyle = THEME_COLOR_WHITE; 
    const baseSeed = 12345; 

    for (let i = 0; i < 30; i++) {
        let x = (Math.sin(baseSeed + i * 0.3) * 0.5 + 0.5) * canvas.width; 
        let yBase = (Math.cos(baseSeed + i * 0.5) * 0.5 + 0.5) * canvas.height; 
        let y = (yBase - cameraOffset * 0.1) % canvas.height; 
        if (y < 0) y += canvas.height; 
        ctx.fillRect(x, y, 2, 2); 
    }
    for (let i = 0; i < 50; i++) {
        let x = (Math.sin(baseSeed + i * 0.2 + 10) * 0.5 + 0.5) * canvas.width;
        let yBase = (Math.cos(baseSeed + i * 0.3 + 5) * 0.5 + 0.5) * canvas.height;
        let y = (yBase - cameraOffset * 0.2) % canvas.height; 
        if (y < 0) y += canvas.height;
        ctx.fillRect(x, y, 1, 1); 
    }
}

function drawPlatforms() {
    platforms.forEach(p => {
        if (p.type === PLATFORM_TYPES.FRAGILE && p.health < 1) {
            return; 
        }
        if (p.type === PLATFORM_TYPES.BLINKING && !p.isVisible) {
            return;
        }

        const platformGradient = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        platformGradient.addColorStop(0, p.colorTop); 
        platformGradient.addColorStop(1, p.colorBottom); 
        ctx.fillStyle = platformGradient;
        
        if (p.type === PLATFORM_TYPES.BLINKING) {
            const timeInCycle = (gameTime + p.initialBlinkOffset) % BLINKING_PLATFORM_INTERVAL;
            const timeLeftVisible = BLINKING_PLATFORM_VISIBLE_DURATION - timeInCycle;
            if (timeInCycle < BLINKING_PLATFORM_VISIBLE_DURATION && timeLeftVisible < 300) {
                ctx.globalAlpha = Math.max(0.2, timeLeftVisible / 300);
            } else {
                 ctx.globalAlpha = 1;
            }
        } else {
            ctx.globalAlpha = 1;
        }

        drawRoundedRect(ctx, p.x, p.y, p.width, p.height, p.borderRadius || 0); 
        ctx.globalAlpha = 1;

        ctx.fillStyle = p.highlightColor;
        
        if (p.borderRadius > 0) { 
            ctx.beginPath();
            const highlightHeight = 3; 
            ctx.moveTo(p.x + p.borderRadius, p.y);
            ctx.lineTo(p.x + p.width - p.borderRadius, p.y);
            ctx.quadraticCurveTo(p.x + p.width, p.y, p.x + p.width, p.y + p.borderRadius);
            ctx.lineTo(p.x + p.width, p.y + highlightHeight);
            ctx.lineTo(p.x, p.y + highlightHeight);
            ctx.lineTo(p.x, p.y + p.borderRadius);
            ctx.quadraticCurveTo(p.x, p.y, p.x + p.borderRadius, p.y);
            ctx.closePath();
            ctx.fill();
        } else { 
            ctx.fillRect(p.x, p.y, p.width, 3);
        }
        
        drawSpecialPlatformEffects(p); 
    });
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (radius === 0) { 
        ctx.fillRect(x, y, width, height);
        return;
    }
    radius = Math.min(radius, width / 2, height / 2); 
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y); 
    ctx.arcTo(x + width, y, x + width, y + radius, radius); 
    ctx.lineTo(x + width, y + height - radius); 
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius); 
    ctx.lineTo(x + radius, y + height); 
    ctx.arcTo(x, y + height, x, y + height - radius, radius); 
    ctx.lineTo(x, y + radius); 
    ctx.arcTo(x, y, x + radius, y, radius); 
    ctx.closePath();
    ctx.fill(); 
}

function drawSpecialPlatformEffects(platform) {
    ctx.save(); 
    if (platform.type === PLATFORM_TYPES.BOUNCY) { 
        ctx.fillStyle = '#FFFFFF'; 
        for (let j = 0; j < 3; j++) { 
            const arrowX = platform.x + platform.width / 4 + j * platform.width / 4;
            const arrowY = platform.y + platform.height / 2;
            ctx.beginPath();
            ctx.moveTo(arrowX - 4, arrowY + 3); ctx.lineTo(arrowX, arrowY - 3);
            ctx.lineTo(arrowX + 4, arrowY + 3); ctx.closePath(); ctx.fill();
        }
    } else if (platform.type === PLATFORM_TYPES.MOVING) { 
        ctx.fillStyle = '#FFFFFF'; 
        const arrowSize = 5;
        const arrowY = platform.y + platform.height / 2;
        const arrowX = platform.x + platform.width / 2 + (platform.moveDirection * (platform.width / 3));
        ctx.beginPath();
        if (platform.moveDirection > 0) { 
            ctx.moveTo(arrowX - arrowSize, arrowY - arrowSize); ctx.lineTo(arrowX, arrowY);
            ctx.lineTo(arrowX - arrowSize, arrowY + arrowSize);
        } else { 
            ctx.moveTo(arrowX + arrowSize, arrowY - arrowSize); ctx.lineTo(arrowX, arrowY);
            ctx.lineTo(arrowX + arrowSize, arrowY + arrowSize);
        }
        ctx.closePath(); ctx.fill();
    }
    ctx.restore(); 
}

function drawCollectibles() {
    collectibles.forEach(collectible => {
        ctx.save(); 
        ctx.translate(collectible.x, collectible.y); 
        ctx.rotate(collectible.angle); 
        collectible.angle += 0.05; 

        switch (collectible.type) {
            case COLLECTIBLE_TYPES.COIN: 
                ctx.fillStyle = collectible.color; ctx.beginPath();
                ctx.arc(0, 0, collectible.size / 2, 0, Math.PI * 2); ctx.fill(); 
                ctx.strokeStyle = THEME_COLOR_WHITE; ctx.lineWidth = 2; ctx.stroke(); 
                break;
            case COLLECTIBLE_TYPES.POWER_UP: 
                ctx.fillStyle = collectible.color;
                drawStar(0, 0, 5, collectible.size / 2, collectible.size / 4); 
                break;
            case COLLECTIBLE_TYPES.SHIELD: 
                ctx.fillStyle = 'rgba(0, 229, 255, 0.3)'; ctx.beginPath(); 
                ctx.arc(0, 0, collectible.size / 1.5, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = collectible.color; ctx.lineWidth = 2; ctx.beginPath(); 
                ctx.arc(0, 0, collectible.size / 2, 0, Math.PI * 2); ctx.stroke();
                break;
            case COLLECTIBLE_TYPES.REVERSE_CONTROLS: 
                ctx.fillStyle = collectible.color; 
                ctx.font = "bold " + collectible.size * 0.8 + "px Arial"; 
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText("↔", 0, collectible.size * 0.1); 
                break;
        }
        ctx.restore(); 
    });
}

function drawPlayer() {
    ctx.save(); 
    if (player.modelLoaded && player.model) { 
        const centerX = player.x + player.width / 2; 
        const centerY = player.y + player.height / 2; 
        ctx.translate(centerX, centerY); 

        if (player.isBarrelRolling) { 
            const elapsed = Date.now() - player.barrelRollStartTime;
            const progress = Math.min(elapsed / BARREL_ROLL_DURATION, 1);
            const angle = progress * 360 * player.barrelRollDirection; 
            ctx.rotate(angle * Math.PI / 180); 
        }

        if (player.lastDirection === 'left') { 
            ctx.scale(-1, 1); 
        }
        ctx.drawImage(player.model, -player.width / 2, -player.height / 2, player.width, player.height);
    } else { 
        ctx.fillStyle = player.color;
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        if (player.lastDirection === 'left') {
            ctx.scale(-1, 1);
        }
        ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    }
    ctx.restore(); 
    drawPlayerEffects(); 
}

function drawPlayerEffects() {
    if (player.powerUpActive) {
        ctx.save();
        const auraSize = 5 + Math.sin(Date.now() / 100) * 3; 
        ctx.strokeStyle = '#FF4081'; ctx.lineWidth = 2; 
        ctx.setLineDash([5, 3]); 
        ctx.strokeRect(player.x - auraSize / 2, player.y - auraSize / 2, player.width + auraSize, player.height + auraSize);
        ctx.restore();
    }
    if (player.hasShield) {
        ctx.save();
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        const radius = Math.max(player.width, player.height) * 0.6; 
        ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.2)'; ctx.fill(); 
        ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 2; ctx.stroke(); 
        ctx.restore();
    }
    if (player.controlsReversed) {
        ctx.save();
        const blink = Math.floor(Date.now() / 200) % 2 === 0; 
        if (blink) {
            ctx.strokeStyle = 'rgba(0, 157, 76, 0.8)'; 
            ctx.lineWidth = 3;
            ctx.strokeRect(player.x - 4, player.y - 4, player.width + 8, player.height + 8);
        }
        ctx.restore();
    }
}

// ===== GŁÓWNA PĘTLA GRY =====
function gameAnimationLoop(currentTime) {
    if (!gameRunning) { 
        lastTime = 0; 
        return; 
    }

    if (!lastTime) { 
        lastTime = currentTime; 
        requestAnimationFrame(gameAnimationLoop); 
        return;
    }

    const deltaTime = (currentTime - lastTime) / 1000; 
    lastTime = currentTime; 

    const maxDeltaTime = 1 / 30; 
    const actualDeltaTime = Math.min(deltaTime, maxDeltaTime);

    update(actualDeltaTime); 
    draw(); 

    requestAnimationFrame(gameAnimationLoop); 
}

// ===== INICJALIZACJA GRY PO ZAŁADOWANIU STRONY =====
window.onload = init;