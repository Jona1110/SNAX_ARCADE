// ============================================================================
// S.N.A.X. ARCADE: WINGS & BONELESS RUSH
// Motor de Juego 8-Bit, IA de Dificultad Adaptativa y Conexión a Google Sheets
// ============================================================================

// --- CONFIGURACIÓN DE GOOGLE SHEETS ---
const DEFAULT_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwnTwYn1Y-3CfKmfsUM-o01wmkJSBfiSHRcrdGRXAWkPZIGxAwr6fc1TyfKiM43JyXj/exec";

function getSheetsWebAppUrl() {
    return localStorage.getItem('snax_sheets_url') || DEFAULT_SHEETS_WEBAPP_URL;
}

// --- Web Audio API Retro Sound & Chiptune BGM Synthesizer ---
let soundEnabled = true;
let audioCtx = null;
let bgmInterval = null;
let bgmStep = 0;

const BGM_LEAD = [
    523.25, 0, 659.25, 783.99,
    659.25, 0, 523.25, 587.33,
    659.25, 783.99, 880.00, 783.99,
    659.25, 587.33, 523.25, 0
];
const BGM_BASS = [
    130.81, 130.81, 196.00, 196.00,
    174.61, 174.61, 130.81, 130.81,
    146.83, 146.83, 196.00, 196.00,
    130.81, 196.00, 130.81, 0
];

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function startBGM() {
    stopBGM();
    if (!soundEnabled) return;
    initAudio();
    bgmStep = 0;
    bgmInterval = setInterval(() => {
        if (!soundEnabled || gameState !== 'PLAYING' || !audioCtx) return;
        const now = audioCtx.currentTime;
        const leadFreq = BGM_LEAD[bgmStep % BGM_LEAD.length];
        const bassFreq = BGM_BASS[bgmStep % BGM_BASS.length];

        if (leadFreq > 0) {
            const oscLead = audioCtx.createOscillator();
            const gainLead = audioCtx.createGain();
            oscLead.type = 'square';
            oscLead.frequency.setValueAtTime(leadFreq, now);
            gainLead.gain.setValueAtTime(0.032, now);
            gainLead.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            oscLead.connect(gainLead);
            gainLead.connect(audioCtx.destination);
            oscLead.start(now);
            oscLead.stop(now + 0.14);
        }

        if (bassFreq > 0) {
            const oscBass = audioCtx.createOscillator();
            const gainBass = audioCtx.createGain();
            oscBass.type = 'triangle';
            oscBass.frequency.setValueAtTime(bassFreq, now);
            gainBass.gain.setValueAtTime(0.05, now);
            gainBass.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            oscBass.connect(gainBass);
            gainBass.connect(audioCtx.destination);
            oscBass.start(now);
            oscBass.stop(now + 0.15);
        }

        bgmStep++;
    }, 175);
}

function stopBGM() {
    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'wing_buffalo') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.09);
        gain.gain.setValueAtTime(0.13, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
    } else if (type === 'veggie_sticks') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.setValueAtTime(840, now + 0.04);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
    } else if (type === 'boneless_bbq') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(659.25, now + 0.06);
        gain.gain.setValueAtTime(0.13, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
    } else if (type === 'fries') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(783.99, now + 0.05);
        osc.frequency.setValueAtTime(1046.50, now + 0.10);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
    } else if (type === 'ranch_cup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.15);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
    } else if (type === 'combo') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.05);
        osc.frequency.setValueAtTime(783.99, now + 0.10);
        osc.frequency.setValueAtTime(1046.50, now + 0.15);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.24);
    } else if (type === 'bonus') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.07);
        osc.frequency.setValueAtTime(783.99, now + 0.14);
        osc.frequency.setValueAtTime(1046.50, now + 0.21);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
        osc.start(now);
        osc.stop(now + 0.32);
    } else if (type === 'hurt') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(38, now + 0.28);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
    } else if (type === 'pause') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(220, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
    } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.setValueAtTime(190, now + 0.18);
        osc.frequency.setValueAtTime(140, now + 0.36);
        osc.frequency.linearRampToValueAtTime(65, now + 0.65);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.65);
    } else if (type === 'levelup') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.09);
        osc.frequency.setValueAtTime(659.25, now + 0.18);
        osc.frequency.setValueAtTime(880, now + 0.27);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
        osc.start(now);
        osc.stop(now + 0.42);
    } else if (type === 'reward') {
        osc.type = 'square';
        const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
        const times = [0, 0.08, 0.16, 0.24, 0.34, 0.42];
        notes.forEach((freq, idx) => {
            osc.frequency.setValueAtTime(freq, now + times[idx]);
        });
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.62);
        osc.start(now);
        osc.stop(now + 0.62);
    }
}

// --- Matrices Pixel Art de 16x16 ---
const PALETTE = {
    '.': null,
    'K': '#09090b',
    'W': '#ffffff',
    'B': '#d97706',
    'L': '#fbbf24',
    'O': '#ea580c',
    'R': '#dc2626',
    'D': '#7f1d1d',
    'M': '#9a3412',
    'G': '#22c55e',
    'V': '#86efac',
    'C': '#f97316',
    'Y': '#facc15',
    'I': '#38bdf8',
    'A': '#bae6fd',
    'E': '#15803d',
    'F': '#f97316',
    'U': '#fef08a',
    'S': '#cbd5e1',
    'P': '#f8fafc'
};

const SPRITES = {
    wing_buffalo: [
        "....KKK.........",
        "...KWWWK........",
        "...KWBBWK.......",
        "....KBBWKK......",
        ".....KOOOOOK....",
        "....KOOLLOOOK...",
        "...KOOLLLLOOOK..",
        "..KOOLLOOOOOOOK.",
        "..KOOOOOOOOORRK.",
        "..KOOOOOOORRRRK.",
        "...KOOOOORRRRK..",
        "....KOOORRRRK...",
        ".....KRRRRKK....",
        "......KKKK......",
        "................",
        "................"
    ],
    boneless_bbq: [
        ".....KKKKKK.....",
        "...KKMMMMMMKK...",
        "..KMMLLMMMMMMK..",
        ".KMMLLMMMMMMMMK.",
        ".KMMMMDDDDMMMMK.",
        "KMMMMDDDDDDMMMMK",
        "KMMDDDDLLDDDDMMK",
        "KMMMDDDDDDDDMMMK",
        ".KMMMDDDDDDMMMK.",
        ".KMMMMDDDDMMMMK.",
        "..KMMMMMMMMMMK..",
        "...KKMMMMMMKK...",
        ".....KKKKKK.....",
        "................",
        "................",
        "................"
    ],
    ranch_cup: [
        "...KKKKKKKKKK...",
        "..KWWWWWWWWWWK..",
        ".KSSSSSSSSSSSSK.",
        ".KWWWWWWWWWWWWK.",
        "..KKKKKKKKKKKK..",
        "..KPPPPPPPPPPK..",
        "..KPPWWWWPPPPK..",
        "...KPPPPPPPPK...",
        "...KPPWWWWPPK...",
        "...KPPPPPPPPK...",
        "....KPPPPPPK....",
        "....KPPPPPPK....",
        ".....KKKKKK.....",
        "................",
        "................",
        "................"
    ],
    veggie_sticks: [
        "......KK...KK...",
        ".....KCCK.KGGK..",
        "....KCCCKKGGVK..",
        "...KCCCKKGGVVK..",
        "..KCCCKKGGVVK...",
        ".KCCCKKGGVVK....",
        ".KCCKKGGVVK.....",
        "..KK.KGGVK......",
        ".....KGGK.......",
        "......KK........",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................"
    ],
    fries: [
        "....KK..KK......",
        "...KYYKKYYK.KK..",
        "..KKYYKKYYKKYYK.",
        ".KYYKYYKYYKKYYK.",
        ".KYYKYYKYYGKYYK.",
        ".KYYGYYGYYGKYYK.",
        ".KRRRRRRRRRRRRK.",
        ".KRRYYYYYYYYRRK.",
        "..KRYYYYYYYYRK..",
        "..KRRYYYYYYRRK..",
        "..KRRRRRRRRRRK..",
        "...KRRRRRRRRK...",
        "....KKKKKKKK....",
        "................",
        "................",
        "................"
    ],
    chili: [
        "............KK..",
        "...........KVVK.",
        "..........KVVVK.",
        ".........KEEEEK.",
        "........KRRRRRK.",
        "..KK...KRRWWRRK.",
        ".KFUK.KRRWRRRDK.",
        "..KK.KRRWRRRDDK.",
        "....KRRRRRRDDK..",
        "...KRRRRRRDDK...",
        "..KRRRRRRDDK....",
        ".KRRRRRRDDK.....",
        "KRRRRRRDK.......",
        "KRRRRDK.........",
        ".KKKK...........",
        "................"
    ],
    ice: [
        "..KKKKKKKKKKKK..",
        ".KIIIIIIIIIIIIK.",
        "KIIAAIIIIIIAAIIK",
        "KIIAAIIIIIIAAIIK",
        "KIIIIIIIIIIIIIIK",
        "KIIIIIIWWIIIIIIK",
        "KIIIIIWWWWIIIIIK",
        "KIIIIIIWWIIIIIIK",
        "KIIIIIIIIIIIIIIK",
        "KIIAAIIIIIIAAIIK",
        "KIIAAIIIIIIAAIIK",
        ".KIIIIIIIIIIIIK.",
        "..KKKKKKKKKKKK..",
        "................",
        "................",
        "................"
    ],
    heart: [
        ".KKK...KKK..",
        "KRRRK.KRRRK.",
        "KRWWRKRRRRRK",
        "KRWRRRRRRRRK",
        "KRRRRRRRRRRK",
        ".KRRRRRRRRK.",
        "..KRRRRRRK..",
        "...KRRRRK...",
        "....KRRK....",
        ".....KK....."
    ]
};

function drawPixelMatrix(targetCtx, matrix, x, y, pixelSize) {
    for (let row = 0; row < matrix.length; row++) {
        const line = matrix[row];
        for (let col = 0; col < line.length; col++) {
            const ch = line[col];
            const color = PALETTE[ch];
            if (color) {
                targetCtx.fillStyle = color;
                targetCtx.fillRect(
                    Math.floor(x + col * pixelSize),
                    Math.floor(y + row * pixelSize),
                    Math.ceil(pixelSize),
                    Math.ceil(pixelSize)
                );
            }
        }
    }
}

// --- Referencias al DOM ---
const gameHud = document.getElementById('game-hud');
const gamePlayZone = document.getElementById('game-play-zone');
const mobileTouchBar = document.getElementById('mobile-touch-bar');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValEl = document.getElementById('score-val');
const levelValEl = document.getElementById('level-val');
const livesContainerEl = document.getElementById('lives-container');
const comboBadgeEl = document.getElementById('combo-badge');
const hudPlayerTagEl = document.getElementById('hud-player-tag');
const aiSkillBadgeEl = document.getElementById('ai-skill-badge');

const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('gameover-screen');

const loginBox = document.getElementById('login-box');
const lockedPlayerBanner = document.getElementById('locked-player-banner');
const lockedPlayerDisplay = document.getElementById('locked-player-display');
const playerNameInput = document.getElementById('player-name-input');
const loginErrorMsg = document.getElementById('login-error-msg');
const sheetsStatusPill = document.getElementById('sheets-status-pill');
const openSheetsBtn = document.getElementById('open-sheets-btn');
const closeSheetsBtn = document.getElementById('close-sheets-btn');
const saveSheetsBtn = document.getElementById('save-sheets-btn');
const sheetsModal = document.getElementById('sheets-modal');
const sheetsUrlInput = document.getElementById('sheets-url-input');
const sheetsTestFeedback = document.getElementById('sheets-test-feedback');

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const pauseSoundBtn = document.getElementById('pause-sound-btn');
const exitMenuBtn = document.getElementById('exit-menu-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverMenuBtn = document.getElementById('gameover-menu-btn');
const soundToggleBtn = document.getElementById('sound-toggle');

const startHighscoreEl = document.getElementById('start-highscore');
const finalPlayerNameEl = document.getElementById('final-player-name');
const finalScoreEl = document.getElementById('final-score');
const highscoreValEl = document.getElementById('highscore-val');
const finalSkillProfileEl = document.getElementById('final-skill-profile');
const finalCommentEl = document.getElementById('final-comment');
const pauseAiSummaryEl = document.getElementById('pause-ai-summary');
const popupContainer = document.getElementById('popup-container');

const rewardToast = document.getElementById('reward-toast');
const rewardToastTitle = document.getElementById('reward-toast-title');
const rewardToastCode = document.getElementById('reward-toast-code');
const openRewardsBtn = document.getElementById('open-rewards-btn');
const closeRewardsBtn = document.getElementById('close-rewards-btn');
const rewardsModal = document.getElementById('rewards-modal');
const rewardsCatalogList = document.getElementById('rewards-catalog-list');
const unlockedCouponBox = document.getElementById('unlocked-coupon-box');
const noCouponHint = document.getElementById('no-coupon-hint');
const couponTitleEl = document.getElementById('coupon-title');
const couponDescEl = document.getElementById('coupon-desc');
const couponCodeTextEl = document.getElementById('coupon-code-text');
const copyCouponBtn = document.getElementById('copy-coupon-btn');
const allUnlockedBadgesEl = document.getElementById('all-unlocked-badges');

// --- Estado Principal del Juego y Métricas de IA ---
let gameState = 'START';
let animationFrameId = null;
let score = 0;
let lives = 3;
let level = 1;
let comboCount = 0;
let comboTimer = 0;
let currentPlayerName = (localStorage.getItem('snax_player_name') || '').trim();
let highscore = parseInt(localStorage.getItem('snax_highscore') || '0', 10);

function showLoginScreen() {
    if (startScreen) startScreen.classList.remove('hidden');
    if (gameHud) gameHud.classList.add('hidden');
    if (gamePlayZone) gamePlayZone.classList.add('hidden');
    if (mobileTouchBar) mobileTouchBar.classList.add('hidden');
}

function showGameScreen() {
    if (startScreen) startScreen.classList.add('hidden');
    if (gameHud) gameHud.classList.remove('hidden');
    if (gamePlayZone) gamePlayZone.classList.remove('hidden');
    if (mobileTouchBar) mobileTouchBar.classList.remove('hidden');
}

function syncPlayerLoginUI() {
    if (currentPlayerName) {
        if (loginBox) loginBox.classList.add('hidden');
        if (playerNameInput) {
            playerNameInput.value = currentPlayerName;
            playerNameInput.disabled = true;
        }
        if (lockedPlayerDisplay) lockedPlayerDisplay.textContent = currentPlayerName.toUpperCase();
        if (lockedPlayerBanner) lockedPlayerBanner.classList.remove('hidden');
    } else {
        if (loginBox) loginBox.classList.remove('hidden');
        if (playerNameInput) playerNameInput.disabled = false;
        if (lockedPlayerBanner) lockedPlayerBanner.classList.add('hidden');
    }
}
syncPlayerLoginUI();
showLoginScreen();
startHighscoreEl.textContent = highscore;

let playerMetrics = {
    goodSpawned: 0,
    goodCaught: 0,
    hazardsSpawned: 0,
    hazardsDodged: 0,
    maxCombo: 0,
    skillRating: 1.0,
    tierLabel: 'ESTÁNDAR',
    previousTierLabel: 'ESTÁNDAR'
};

function resetPlayerMetrics() {
    playerMetrics = {
        goodSpawned: 0,
        goodCaught: 0,
        hazardsSpawned: 0,
        hazardsDodged: 0,
        maxCombo: 0,
        skillRating: 1.0,
        tierLabel: 'ESTÁNDAR',
        previousTierLabel: 'ESTÁNDAR'
    };
    aiSkillBadgeEl.classList.add('hidden');
}

function updateAdaptiveDifficulty() {
    const catchRate = playerMetrics.goodSpawned > 0
        ? playerMetrics.goodCaught / playerMetrics.goodSpawned
        : 0.5;
    const dodgeRate = playerMetrics.hazardsSpawned > 0
        ? playerMetrics.hazardsDodged / playerMetrics.hazardsSpawned
        : 1.0;

    const totalEvents = playerMetrics.goodSpawned + playerMetrics.hazardsSpawned;
    if (totalEvents < 8) return;

    const comboFactor = Math.min(1, playerMetrics.maxCombo / 12);
    const rawStrength = (catchRate * 0.55) + (dodgeRate * 0.25) + (comboFactor * 0.20);

    const targetSkill = 1.0 + Math.max(0, (rawStrength - 0.58) * 1.55);
    playerMetrics.skillRating = Math.min(1.65, Math.max(1.0, (playerMetrics.skillRating * 0.85) + (targetSkill * 0.15)));

    if (playerMetrics.skillRating >= 1.42) {
        playerMetrics.tierLabel = 'MODO PRO+';
        aiSkillBadgeEl.textContent = 'IA: PRO+';
        aiSkillBadgeEl.className = 'pixel-font text-[7px] sm:text-[8px] bg-red-600 text-white px-1 py-0.5 rounded border border-yellow-300 shrink-0';
        aiSkillBadgeEl.classList.remove('hidden');
    } else if (playerMetrics.skillRating >= 1.20) {
        playerMetrics.tierLabel = 'RETO ALTO';
        aiSkillBadgeEl.textContent = 'IA: ALTO';
        aiSkillBadgeEl.className = 'pixel-font text-[7px] sm:text-[8px] bg-amber-500 text-black px-1 py-0.5 rounded border border-white shrink-0';
        aiSkillBadgeEl.classList.remove('hidden');
    } else {
        playerMetrics.tierLabel = 'ESTÁNDAR';
        aiSkillBadgeEl.classList.add('hidden');
    }

    if (playerMetrics.tierLabel !== playerMetrics.previousTierLabel && playerMetrics.tierLabel !== 'ESTÁNDAR') {
        createPopup(`⚡ IA: ${playerMetrics.tierLabel}`, canvas.width * 0.18, canvas.height * 0.35, '#fbbf24');
    }
    playerMetrics.previousTierLabel = playerMetrics.tierLabel;
}

// --- Sincronización con Google Sheets (Apps Script Web App) ---
function syncSheetsStatusUI() {
    if (!sheetsStatusPill) return;
    const url = getSheetsWebAppUrl();
    if (url && url.startsWith('http')) {
        sheetsStatusPill.textContent = 'CONECTADO';
        sheetsStatusPill.className = 'px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[8px] sm:text-[9px]';
    } else {
        sheetsStatusPill.textContent = 'SHEETS: LOCAL';
        sheetsStatusPill.className = 'px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-gray-400 text-[8px] sm:text-[9px]';
    }
}
syncSheetsStatusUI();

async function sendToGoogleSheets(payload) {
    const url = getSheetsWebAppUrl();
    if (!url || !url.startsWith('http')) return;

    try {
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.warn('No se pudo enviar el registro a Google Sheets:', err);
    }
}

// --- Premios Desbloqueables ---
const REWARD_TIERS = [
    {
        id: 'disc10',
        points: 800,
        title: '10% DE DESCUENTO',
        shortLabel: '10% OFF',
        code: 'SNAX10',
        desc: 'En tu próximo pedido de alitas o boneless'
    },
    {
        id: 'freefries',
        points: 1800,
        title: 'PAPAS FRANCESAS GRATIS',
        shortLabel: 'PAPAS GRATIS',
        code: 'PAPAS8BIT',
        desc: 'Orden de papas doradas gratis al comprar tu combo'
    },
    {
        id: 'extrapcs',
        points: 3000,
        title: '+3 PIEZAS EXTRA GRATIS',
        shortLabel: '+3 PIEZAS',
        code: '3EXTRAS',
        desc: '3 alitas o boneless extra gratis en tu orden'
    },
    {
        id: 'kingcombo',
        points: 4500,
        title: '20% OFF + PAPAS GRATIS',
        shortLabel: 'REY ARCADE',
        code: 'REYARCADE',
        desc: 'Premio máximo para maestros de la charola S.N.A.X.'
    }
];

let unlockedRewardsThisRun = [];
let rewardToastTimeout = null;

function buildRewardsCatalog() {
    rewardsCatalogList.innerHTML = '';
    REWARD_TIERS.forEach(tier => {
        const card = document.createElement('div');
        card.className = 'bg-gray-900 border border-amber-500/50 rounded-lg p-2.5 flex items-center justify-between gap-2';
        card.innerHTML = `
            <div>
                <div class="pixel-font text-[9px] text-amber-400">${tier.points} PTS</div>
                <div class="pixel-font text-[10px] sm:text-xs text-white mt-0.5">${tier.title}</div>
                <div class="text-xs text-gray-400 leading-tight mt-0.5">${tier.desc}</div>
            </div>
            <span class="pixel-font text-[9px] bg-black border border-yellow-400 text-yellow-400 px-2 py-1 rounded shrink-0">${tier.code}</span>
        `;
        rewardsCatalogList.appendChild(card);
    });
}
buildRewardsCatalog();

function showRewardToast(tier) {
    if (rewardToastTimeout) clearTimeout(rewardToastTimeout);
    rewardToastTitle.textContent = tier.title;
    rewardToastCode.textContent = tier.code;
    rewardToast.classList.remove('hidden');
    rewardToastTimeout = setTimeout(() => {
        rewardToast.classList.add('hidden');
    }, 3400);
}

function checkMilestoneRewards() {
    for (const tier of REWARD_TIERS) {
        if (score >= tier.points && !unlockedRewardsThisRun.some(r => r.id === tier.id)) {
            unlockedRewardsThisRun.push(tier);
            playSound('reward');
            showRewardToast(tier);
            spawnParticles(player.x + player.width / 2, player.y - 10, ['#facc15', '#34d399', '#ef4444', '#ffffff'], 24);
        }
    }
}

// --- Definición de Objetos ---
const itemTypes = [
    { type: 'wing_buffalo', label: 'Alita ATOMIC', pts: 5, prob: 0.32, badge: '+5 pts' },
    { type: 'veggie_sticks', label: 'Zanahoria/Pepino', pts: 5, prob: 0.21, badge: '+5 pts' },
    { type: 'boneless_bbq', label: 'Boneless BBQ', pts: 10, prob: 0.11, badge: '+10 pts' },
    { type: 'fries', label: 'Papas francesas', pts: 10, prob: 0.09, badge: '+10 pts' },
    { type: 'ranch_cup', label: 'Vasito Ranch', pts: 10, prob: 0.07, badge: '+10 pts' },
    { type: 'chili', label: 'Chile Picante', pts: -1, prob: 0.12, badge: '¡EVITA!', hazard: true },
    { type: 'ice', label: 'Cubo de Hielo', pts: -1, prob: 0.08, badge: '¡EVITA!', hazard: true }
];

function buildStartGuide() {
    const grid = document.getElementById('item-guide-grid');
    grid.innerHTML = '';
    itemTypes.forEach(item => {
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-2 bg-black/60 p-1 rounded border border-gray-800';
        
        const miniCanvas = document.createElement('canvas');
        miniCanvas.width = 32;
        miniCanvas.height = 32;
        miniCanvas.className = 'w-6 h-6 shrink-0';
        const mCtx = miniCanvas.getContext('2d');
        drawPixelMatrix(mCtx, SPRITES[item.type], 0, 0, 2);

        const info = document.createElement('div');
        info.className = 'leading-tight overflow-hidden';
        info.innerHTML = `
            <div class="text-[11px] font-bold truncate ${item.hazard ? 'text-red-400' : 'text-white'}">${item.label}</div>
            <div class="pixel-font text-[8px] ${item.hazard ? 'text-red-500' : 'text-yellow-400'}">${item.badge}</div>
        `;
        row.appendChild(miniCanvas);
        row.appendChild(info);
        grid.appendChild(row);
    });
}
buildStartGuide();

// Renderiza los corazones con tamaño fijo blindado para que nunca colapsen en celular
function renderLivesHUD() {
    livesContainerEl.innerHTML = '';
    for (let i = 0; i < Math.max(0, lives); i++) {
        const hCanvas = document.createElement('canvas');
        hCanvas.width = 24;
        hCanvas.height = 20;
        hCanvas.style.width = '16px';
        hCanvas.style.height = '14px';
        hCanvas.style.flexShrink = '0';
        hCanvas.style.display = 'block';
        const hCtx = hCanvas.getContext('2d');
        drawPixelMatrix(hCtx, SPRITES.heart, 0, 0, 2);
        livesContainerEl.appendChild(hCanvas);
    }
}

// --- Canvas y Jugador (Escalado proporcional para móvil y escritorio) ---
let player = {
    width: 104,
    height: 52,
    x: 150,
    y: 300,
    speed: 9.8,
    tilt: 0,
    catchBounce: 0
};

function getResponsiveScale() {
    if (!canvas || !canvas.width) return 1;
    // Escala suavemente entre 0.72 (en pantallas de ~320px) y 1.0 (en >= 520px)
    return Math.min(1, Math.max(0.72, canvas.width / 520));
}

function resizeCanvas() {
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const prevWidth = canvas.width || rect.width;
    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);

    const scale = getResponsiveScale();
    if (player) {
        const relativeX = prevWidth > 0 ? player.x / prevWidth : 0.5;
        player.width = Math.round(104 * scale);
        player.height = Math.round(52 * scale);
        player.speed = 9.8 * (0.85 + scale * 0.15);
        // Margen inferior seguro para que la charola y sus patitas nunca queden cortadas
        player.y = canvas.height - player.height - Math.round(14 * scale);
        player.x = Math.max(0, Math.min(canvas.width - player.width, relativeX * canvas.width));
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
player.x = canvas.width / 2 - player.width / 2;

// --- Controles ---
let keys = { ArrowLeft: false, ArrowRight: false, KeyA: false, KeyD: false };

window.addEventListener('keydown', (e) => {
    if (document.activeElement === playerNameInput || document.activeElement === sheetsUrlInput) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.ArrowLeft = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.ArrowRight = true;
    if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'PLAYING') pauseGame();
        else if (gameState === 'PAUSED') resumeGame();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.ArrowLeft = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.ArrowRight = false;
});

const touchLeftBtn = document.getElementById('touch-left');
const touchRightBtn = document.getElementById('touch-right');
touchLeftBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); keys.ArrowLeft = true; });
touchLeftBtn.addEventListener('pointerup', () => { keys.ArrowLeft = false; });
touchLeftBtn.addEventListener('pointerleave', () => { keys.ArrowLeft = false; });
touchRightBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); keys.ArrowRight = true; });
touchRightBtn.addEventListener('pointerup', () => { keys.ArrowRight = false; });
touchRightBtn.addEventListener('pointerleave', () => { keys.ArrowRight = false; });

let isDragging = false;
canvas.addEventListener('pointerdown', (e) => {
    if (gameState !== 'PLAYING') return;
    isDragging = true;
    updatePlayerX(e.clientX);
});
canvas.addEventListener('pointermove', (e) => {
    if (isDragging && gameState === 'PLAYING') updatePlayerX(e.clientX);
});
window.addEventListener('pointerup', () => { isDragging = false; });

function updatePlayerX(clientX) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;
    const targetX = canvasX - player.width / 2;
    player.tilt = Math.max(-0.08, Math.min(0.08, (targetX - player.x) * 0.01));
    player.x = Math.max(0, Math.min(canvas.width - player.width, targetX));
}

// --- Generación Balanceada de Objetos ---
let items = [];
let particles = [];
let spawnTimer = 0;
let spawnInterval = 54;
let lastHazardX = -999;
let consecutiveHazards = 0;

function spawnParticles(x, y, colors, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 7,
            vy: (Math.random() - 0.8) * 6,
            size: Math.floor(Math.random() * 4) + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 24 + Math.random() * 12
        });
    }
}

function spawnItem() {
    const extraHazardBoost = (playerMetrics.skillRating - 1.0) * 0.14;
    let rand = Math.random();
    let chosen = itemTypes[0];

    if (consecutiveHazards >= 2) {
        const foods = itemTypes.filter(i => !i.hazard);
        chosen = foods[Math.floor(Math.random() * foods.length)];
    } else {
        let cumulative = 0;
        for (let it of itemTypes) {
            let weight = it.prob;
            if (it.hazard) {
                weight += extraHazardBoost * 0.5;
            } else {
                weight -= extraHazardBoost * 0.2;
            }
            cumulative += Math.max(0.03, weight);
            if (rand <= cumulative) {
                chosen = it;
                break;
            }
        }
    }

    const scale = getResponsiveScale();
    const size = Math.round(44 * scale);
    const wobbleAmp = (chosen.hazard && playerMetrics.skillRating >= 1.25 ? 4.2 : 2.0) * scale;
    // Margen seguro lateral que incluye la oscilación horizontal para que nunca se corte en bordes
    const safePadding = Math.ceil(wobbleAmp + 8);
    const maxSpawnX = Math.max(safePadding, canvas.width - size - safePadding);
    let x = Math.random() * (maxSpawnX - safePadding) + safePadding;

    if (chosen.hazard) {
        consecutiveHazards++;
        playerMetrics.hazardsSpawned++;
        let attempts = 0;
        while (Math.abs(x - lastHazardX) < player.width * 1.1 && attempts < 6) {
            x = Math.random() * (maxSpawnX - safePadding) + safePadding;
            attempts++;
        }
        lastHazardX = x;
    } else {
        consecutiveHazards = 0;
        playerMetrics.goodSpawned++;
    }

    const baseSpeed = (2.4 + Math.random() * 1.2) + (level * 0.32);
    const adaptiveSpeed = baseSpeed * (0.92 + (playerMetrics.skillRating - 1.0) * 0.45) * (0.88 + scale * 0.12);

    items.push({
        ...chosen,
        x: x,
        y: -size,
        size: size,
        speed: adaptiveSpeed,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: wobbleAmp
    });
}

function createPopup(text, x, y, color = '#facc15') {
    const popup = document.createElement('div');
    popup.className = 'absolute pixel-font text-[9px] sm:text-xs font-bold pointer-events-none transition-all duration-700 ease-out whitespace-nowrap';
    popup.style.left = `${Math.max(4, Math.min(68, (x / canvas.width) * 100))}%`;
    popup.style.top = `${Math.max(8, Math.min(82, (y / canvas.height) * 100))}%`;
    popup.style.color = color;
    popup.style.textShadow = '2px 2px 0px #000';
    popup.textContent = text;
    popupContainer.appendChild(popup);
    
    requestAnimationFrame(() => {
        popup.style.transform = 'translateY(-30px)';
        popup.style.opacity = '0';
    });
    setTimeout(() => popup.remove(), 700);
}

// --- Dibujar Charola Negra S.N.A.X. (Escalado proporcionalmente) ---
function drawTakeoutTray(x, y, w, h) {
    ctx.save();
    const scale = w / 104;
    const bounceOffset = player.catchBounce > 0 ? Math.sin(player.catchBounce * 0.5) * 4 * scale : 0;
    ctx.translate(x + w / 2, y + h / 2 + bounceOffset);
    ctx.rotate(player.tilt);

    const hw = w / 2;
    const hh = h / 2;

    const topOffset = Math.round(14 * scale);
    const topHeight = Math.round(16 * scale);
    const sidePad = Math.round(6 * scale);

    ctx.fillStyle = '#18181b';
    ctx.fillRect(-hw + sidePad, -hh - topOffset, w - sidePad * 2, topHeight);
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 2;
    ctx.strokeRect(-hw + sidePad, -hh - topOffset, w - sidePad * 2, topHeight);

    const checkSize = Math.max(4, Math.round(6 * scale));
    const innerX = -hw + Math.round(8 * scale);
    const innerY = -hh - Math.round(6 * scale);
    const innerW = w - Math.round(16 * scale);
    const innerH = Math.round(14 * scale);
    for (let py = 0; py < innerH; py += checkSize) {
        for (let px = 0; px < innerW; px += checkSize) {
            const isRed = ((px / checkSize) + (py / checkSize)) % 2 === 0;
            ctx.fillStyle = isRed ? '#dc2626' : '#f8fafc';
            ctx.fillRect(
                innerX + px,
                innerY + py,
                Math.min(checkSize, innerW - px),
                Math.min(checkSize, innerH - py)
            );
        }
    }

    const bodyTop = -hh + Math.round(4 * scale);
    const bodyH = h - Math.round(4 * scale);

    ctx.fillStyle = '#09090b';
    ctx.fillRect(-hw, bodyTop, w, bodyH);

    ctx.fillStyle = '#27272a';
    ctx.fillRect(-hw - 2, -hh + Math.round(2 * scale), w + 4, Math.round(7 * scale));
    ctx.fillRect(-hw + Math.round(16 * scale), hh - 2, Math.round(16 * scale), Math.round(6 * scale));
    ctx.fillRect(hw - Math.round(32 * scale), hh - 2, Math.round(16 * scale), Math.round(6 * scale));

    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 2;
    ctx.strokeRect(-hw, bodyTop, w, bodyH);

    const badgeW = Math.round(56 * scale);
    const badgeH = Math.round(18 * scale);
    const badgeY = -hh + Math.round(15 * scale);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-badgeW / 2, badgeY, badgeW, badgeH);
    ctx.fillStyle = '#facc15';
    ctx.font = `bold ${Math.max(7, Math.round(9 * scale))}px "Press Start 2P"`;
    ctx.textAlign = 'center';
    ctx.fillText('S.N.A.X.', 0, badgeY + Math.round(13 * scale));

    ctx.restore();
}

// --- Actualización de Cuadro ---
function updateGame() {
    if (gameState !== 'PLAYING') return;

    if (keys.ArrowLeft || keys.KeyA) {
        player.x -= player.speed;
        player.tilt = -0.05;
    } else if (keys.ArrowRight || keys.KeyD) {
        player.x += player.speed;
        player.tilt = 0.05;
    } else {
        player.tilt *= 0.8;
    }

    if (player.catchBounce > 0) player.catchBounce--;

    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

    if (comboCount > 1) {
        comboTimer--;
        if (comboTimer <= 0) {
            comboCount = 0;
            comboBadgeEl.classList.add('hidden');
        }
    }

    spawnTimer++;
    const aiRateReduction = (playerMetrics.skillRating - 1.0) * 14;
    const currentSpawnRate = Math.max(22, Math.floor(spawnInterval - (level * 3.5) - aiRateReduction));
    if (spawnTimer >= currentSpawnRate) {
        spawnItem();
        spawnTimer = 0;
    }

    const scale = getResponsiveScale();
    for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.speed;
        it.wobblePhase += 0.075;

        const currentWobbleX = Math.sin(it.wobblePhase) * (it.wobbleAmp || 2.0);
        const itemRenderX = Math.max(2, Math.min(canvas.width - it.size - 2, it.x + currentWobbleX));

        const hitMargin = Math.round((it.hazard ? 10 : 6) * scale);
        if (
            itemRenderX + it.size - hitMargin > player.x &&
            itemRenderX + hitMargin < player.x + player.width &&
            it.y + it.size - hitMargin > player.y - Math.round(6 * scale) &&
            it.y + hitMargin < player.y + player.height
        ) {
            player.catchBounce = 10;

            if (it.hazard) {
                lives--;
                comboCount = 0;
                comboBadgeEl.classList.add('hidden');
                playerMetrics.skillRating = Math.max(1.0, playerMetrics.skillRating - 0.12);
                updateAdaptiveDifficulty();

                playSound('hurt');
                spawnParticles(itemRenderX + it.size / 2, it.y + it.size / 2, ['#ef4444', '#facc15', '#38bdf8'], 14);
                createPopup('-1 VIDA', itemRenderX, it.y - 10, '#ef4444');
                if (lives <= 0) {
                    updateHUD();
                    triggerGameOver();
                    return;
                }
            } else {
                playerMetrics.goodCaught++;
                comboCount++;
                if (comboCount > playerMetrics.maxCombo) {
                    playerMetrics.maxCombo = comboCount;
                }
                comboTimer = 110;
                const multiplier = comboCount >= 5 ? 2 : 1;
                const earned = it.pts * multiplier;
                score += earned;

                playSound(it.type);

                if (multiplier > 1) {
                    comboBadgeEl.textContent = `COMBO x2`;
                    comboBadgeEl.classList.remove('hidden');
                    playSound('combo');
                    createPopup(`+${earned} x2!`, itemRenderX, it.y - 10, '#facc15');
                } else if (it.pts >= 10) {
                    createPopup(`+${earned}`, itemRenderX, it.y - 10, '#34d399');
                } else {
                    createPopup(`+${earned}`, itemRenderX, it.y - 10, '#fde047');
                }

                spawnParticles(itemRenderX + it.size / 2, it.y + it.size / 2, ['#f97316', '#facc15', '#ffffff'], 10);
                updateAdaptiveDifficulty();
                checkMilestoneRewards();

                const newLevel = Math.floor(score / 200) + 1;
                if (newLevel > level) {
                    level = newLevel;
                    playSound('levelup');
                    createPopup(`¡NIVEL ${level}!`, canvas.width / 2 - 45, canvas.height / 2, '#38bdf8');
                }
            }

            items.splice(i, 1);
            updateHUD();
            continue;
        }

        if (it.y > canvas.height + it.size) {
            if (it.hazard) {
                playerMetrics.hazardsDodged++;
                updateAdaptiveDifficulty();
            } else if (comboCount > 0) {
                comboCount = 0;
                comboBadgeEl.classList.add('hidden');
            }
            items.splice(i, 1);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function renderGame() {
    if (canvas.width === 0 || canvas.height === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    for (const it of items) {
        const wobbleX = Math.sin(it.wobblePhase) * (it.wobbleAmp || 2.0);
        const clampedX = Math.max(2, Math.min(canvas.width - it.size - 2, it.x + wobbleX));
        const pixelScale = it.size / 16;
        drawPixelMatrix(ctx, SPRITES[it.type], clampedX, it.y, pixelScale);
    }

    for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }

    drawTakeoutTray(player.x, player.y, player.width, player.height);
}

function gameLoop() {
    if (gameState !== 'PLAYING') return;
    updateGame();
    renderGame();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function updateHUD() {
    scoreValEl.textContent = String(score).padStart(6, '0');
    levelValEl.textContent = level;
    renderLivesHUD();
}

function syncSoundButtons() {
    const label = soundEnabled ? '🔊 AUDIO: ON' : '🔇 AUDIO: OFF';
    const pauseLabel = soundEnabled ? '🔊 SONIDO: ON' : '🔇 SONIDO: OFF';
    soundToggleBtn.textContent = label;
    pauseSoundBtn.textContent = pauseLabel;
}

// --- Transiciones de Estado ---
function startGame() {
    if (!currentPlayerName) {
        const typedName = playerNameInput.value.trim();
        if (!typedName) {
            loginErrorMsg.classList.remove('hidden');
            playerNameInput.focus();
            return;
        }
        currentPlayerName = typedName;
        localStorage.setItem('snax_player_name', currentPlayerName);
    }

    syncPlayerLoginUI();
    loginErrorMsg.classList.add('hidden');

    hudPlayerTagEl.textContent = currentPlayerName.toUpperCase();
    hudPlayerTagEl.classList.remove('hidden');

    initAudio();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    score = 0;
    lives = 3;
    level = 1;
    comboCount = 0;
    comboTimer = 0;
    items = [];
    particles = [];
    spawnTimer = 0;
    lastHazardX = -999;
    consecutiveHazards = 0;
    unlockedRewardsThisRun = [];
    resetPlayerMetrics();

    if (rewardToastTimeout) clearTimeout(rewardToastTimeout);
    rewardToast.classList.add('hidden');
    comboBadgeEl.classList.add('hidden');

    showGameScreen();

    rewardsModal.classList.add('hidden');
    rewardsModal.classList.remove('flex');
    if (sheetsModal) {
        sheetsModal.classList.add('hidden');
        sheetsModal.classList.remove('flex');
    }
    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('flex');
    gameOverScreen.classList.add('hidden');
    gameOverScreen.classList.remove('flex');
    pauseBtn.classList.remove('hidden');

    resizeCanvas();
    player.x = canvas.width / 2 - player.width / 2;
    updateHUD();

    gameState = 'PLAYING';
    startBGM();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function pauseGame() {
    if (gameState !== 'PLAYING') return;
    gameState = 'PAUSED';
    stopBGM();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    playSound('pause');

    const catchPct = playerMetrics.goodSpawned > 0
        ? Math.round((playerMetrics.goodCaught / playerMetrics.goodSpawned) * 100)
        : 0;
    pauseAiSummaryEl.textContent = `Jugador: ${currentPlayerName} | IA: ${playerMetrics.tierLabel} (${catchPct}%)`;

    pauseScreen.classList.remove('hidden');
    pauseScreen.classList.add('flex');
}

function resumeGame() {
    if (gameState !== 'PAUSED') return;
    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('flex');
    gameState = 'PLAYING';
    startBGM();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function exitToMainMenu() {
    stopBGM();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    gameState = 'START';
    items = [];
    particles = [];
    comboBadgeEl.classList.add('hidden');
    aiSkillBadgeEl.classList.add('hidden');
    hudPlayerTagEl.classList.add('hidden');
    pauseBtn.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('flex');
    gameOverScreen.classList.add('hidden');
    gameOverScreen.classList.remove('flex');
    syncPlayerLoginUI();
    showLoginScreen();
    startHighscoreEl.textContent = highscore;
}

function triggerGameOver() {
    gameState = 'GAMEOVER';
    stopBGM();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    pauseBtn.classList.add('hidden');
    rewardToast.classList.add('hidden');
    playSound('gameover');

    if (score > highscore) {
        highscore = score;
        localStorage.setItem('snax_highscore', String(highscore));
        startHighscoreEl.textContent = highscore;
        finalCommentEl.textContent = `¡NUEVO RÉCORD, ${currentPlayerName.toUpperCase()}!`;
    } else {
        finalCommentEl.textContent = '¡Se acabaron las alitas!';
    }

    const catchPct = playerMetrics.goodSpawned > 0
        ? Math.round((playerMetrics.goodCaught / playerMetrics.goodSpawned) * 100)
        : 0;

    finalPlayerNameEl.textContent = currentPlayerName.toUpperCase();
    finalScoreEl.textContent = score;
    highscoreValEl.textContent = highscore;
    finalSkillProfileEl.textContent = `${playerMetrics.tierLabel} (${catchPct}%)`;

    let topCouponCode = 'NINGUNO';
    let allUnlockedCodes = 'NINGUNO';

    if (unlockedRewardsThisRun.length > 0) {
        const topReward = unlockedRewardsThisRun[unlockedRewardsThisRun.length - 1];
        topCouponCode = topReward.code;
        allUnlockedCodes = unlockedRewardsThisRun.map(r => r.code).join(', ');

        couponTitleEl.textContent = topReward.title;
        couponDescEl.textContent = topReward.desc;
        couponCodeTextEl.textContent = topReward.code;
        copyCouponBtn.textContent = 'COPIAR';

        allUnlockedBadgesEl.innerHTML = '';
        unlockedRewardsThisRun.forEach(r => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'pixel-font text-[8px] px-1.5 py-0.5 rounded border ' +
                (r.id === topReward.id ? 'bg-yellow-400 text-black border-white' : 'bg-gray-800 text-yellow-300 border-yellow-500/40');
            chip.textContent = r.shortLabel;
            chip.title = 'Seleccionar cupón ' + r.code;
            chip.addEventListener('click', () => {
                couponTitleEl.textContent = r.title;
                couponDescEl.textContent = r.desc;
                couponCodeTextEl.textContent = r.code;
                copyCouponBtn.textContent = 'COPIAR';
            });
            allUnlockedBadgesEl.appendChild(chip);
        });

        unlockedCouponBox.classList.remove('hidden');
        noCouponHint.classList.add('hidden');
    } else {
        unlockedCouponBox.classList.add('hidden');
        noCouponHint.classList.remove('hidden');
    }

    sendToGoogleSheets({
        jugador: currentPlayerName,
        puntuacion: score,
        recordLocal: highscore,
        nivel: level,
        precision: `${catchPct}%`,
        atrapados: `${playerMetrics.goodCaught}/${playerMetrics.goodSpawned}`,
        evadidos: `${playerMetrics.hazardsDodged}/${playerMetrics.hazardsSpawned}`,
        comboMax: playerMetrics.maxCombo,
        perfilIA: playerMetrics.tierLabel,
        cupon: topCouponCode,
        cuponesPartida: allUnlockedCodes
    });

    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('flex');
}

// --- Copiar Cupón ---
copyCouponBtn.addEventListener('click', () => {
    const code = couponCodeTextEl.textContent;
    const tempInput = document.createElement('input');
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
        document.execCommand('copy');
        copyCouponBtn.textContent = '¡COPIADO!';
        playSound('bonus');
        setTimeout(() => {
            copyCouponBtn.textContent = 'COPIAR';
        }, 2000);
    } catch (err) {
        copyCouponBtn.textContent = code;
    }
    document.body.removeChild(tempInput);
});

// --- Modales de Premios y Google Sheets ---
if (openRewardsBtn && rewardsModal) {
    openRewardsBtn.addEventListener('click', () => {
        rewardsModal.classList.remove('hidden');
        rewardsModal.classList.add('flex');
    });
}
if (closeRewardsBtn && rewardsModal) {
    closeRewardsBtn.addEventListener('click', () => {
        rewardsModal.classList.add('hidden');
        rewardsModal.classList.remove('flex');
    });
}

if (openSheetsBtn && sheetsModal) {
    openSheetsBtn.addEventListener('click', () => {
        if (sheetsUrlInput) sheetsUrlInput.value = getSheetsWebAppUrl();
        if (sheetsTestFeedback) sheetsTestFeedback.textContent = '';
        sheetsModal.classList.remove('hidden');
        sheetsModal.classList.add('flex');
    });
}

if (closeSheetsBtn && sheetsModal) {
    closeSheetsBtn.addEventListener('click', () => {
        sheetsModal.classList.add('hidden');
        sheetsModal.classList.remove('flex');
    });
}

if (saveSheetsBtn && sheetsUrlInput) {
    saveSheetsBtn.addEventListener('click', () => {
        const url = sheetsUrlInput.value.trim();
        localStorage.setItem('snax_sheets_url', url);
        syncSheetsStatusUI();
        if (sheetsTestFeedback) {
            if (url && url.startsWith('http')) {
                sheetsTestFeedback.textContent = '✅ URL guardada. Los jugadores se registrarán automáticamente.';
                sheetsTestFeedback.className = 'text-xs text-emerald-400 mb-3 min-h-[18px]';
            } else {
                sheetsTestFeedback.textContent = 'ℹ️ Modo local activado (sin URL de Sheets).';
                sheetsTestFeedback.className = 'text-xs text-amber-300 mb-3 min-h-[18px]';
            }
        }
    });
}

playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        startGame();
    }
});

// --- Listeners Principales ---
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
pauseRestartBtn.addEventListener('click', startGame);
exitMenuBtn.addEventListener('click', exitToMainMenu);
restartBtn.addEventListener('click', startGame);
gameOverMenuBtn.addEventListener('click', exitToMainMenu);

function toggleAudio() {
    soundEnabled = !soundEnabled;
    syncSoundButtons();
    if (soundEnabled && gameState === 'PLAYING') {
        startBGM();
    } else {
        stopBGM();
    }
}
soundToggleBtn.addEventListener('click', toggleAudio);
pauseSoundBtn.addEventListener('click', toggleAudio);

// Render inicial
renderLivesHUD();
