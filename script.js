// --- КОНФИГУРАЦИЯ СЕРВЕРА ---
const SERVER_IP = "play.apiarysmp.online";

// --- ЗВУКОВОЙ СИНТЕЗАТОР (ТОЛЬКО ДЛЯ КЛИКЕРА) ---
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
            audioCtx = new AudioCtxClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function triggerClickSound(baseFreq = 480) {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, ctx.currentTime + 0.09);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.09);
    } catch {}
}

// --- УВЕДОМЛЕНИЯ ---
function triggerToast(text) {
    const toast = document.getElementById('toastMessage');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 2200);
}

// --- КОПИРОВАНИЕ IP ---
function copyIP(container) {
    navigator.clipboard.writeText(SERVER_IP).then(() => {
        triggerToast("IP скопирован: " + SERVER_IP);
        const actionText = container ? container.querySelector('.ip-action-text') : null;
        if (actionText) {
            const original = actionText.textContent;
            actionText.textContent = "Скопировано!";
            setTimeout(() => {
                actionText.textContent = original;
            }, 2000);
        }
    }).catch(() => {
        triggerToast("Адрес: " + SERVER_IP);
    });
}

// --- СТАТУС СЕРВЕРА ---
async function checkOnlineStatus() {
    const label = document.getElementById('statusLabel');
    if (!label) return;

    try {
        const response = await fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`);
        const data = await response.json();

        if (data.online) {
            const count = data.players ? data.players.online : 0;
            label.textContent = `В игре сейчас: ${count} чел. • Версия 1.21.11`;
        } else {
            label.textContent = "Сервер онлайн • Версия 1.21.11";
        }
    } catch {
        label.textContent = "Сервер онлайн • Версия 1.21.11";
    }
}

// --- МИНИ-ИГРА ПАСЕКА ---
const gameState = {
    honey: 0,
    clickPower: 1,
    upgrades: {
        click: { level: 0, baseCost: 15, costMult: 1.45, power: 1 },
        bees:  { level: 0, baseCost: 50, costMult: 1.35, hps: 1 },
        hive:  { level: 0, baseCost: 220, costMult: 1.3, hps: 6 },
        field: { level: 0, baseCost: 850, costMult: 1.25, hps: 24 }
    }
};

const ranks = [
    { threshold: 0, title: "Ученик бортника" },
    { threshold: 50, title: "Сборщик пыльцы" },
    { threshold: 250, title: "Хозяин пасеки" },
    { threshold: 1000, title: "Старший пчеловод" },
    { threshold: 5000, title: "Архитектор сот" },
    { threshold: 20000, title: "Хранитель роя" }
];

function loadGameData() {
    const saved = localStorage.getItem('apiary_game_save_v2');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameState.honey = Number(parsed.honey) || 0;
            if (parsed.upgrades) {
                for (const key in parsed.upgrades) {
                    if (gameState.upgrades[key]) {
                        gameState.upgrades[key].level = Number(parsed.upgrades[key].level) || 0;
                    }
                }
            }
        } catch {}
    }
}

function saveGameData() {
    localStorage.setItem('apiary_game_save_v2', JSON.stringify(gameState));
}

function getUpgradeCost(key) {
    const item = gameState.upgrades[key];
    return Math.floor(item.baseCost * Math.pow(item.costMult, item.level));
}

function getCalculatedHPS() {
    let totalHps = 0;
    totalHps += gameState.upgrades.bees.level * gameState.upgrades.bees.hps;
    totalHps += gameState.upgrades.hive.level * gameState.upgrades.hive.hps;
    totalHps += gameState.upgrades.field.level * gameState.upgrades.field.hps;
    return totalHps;
}

function getCalculatedClick() {
    return 1 + (gameState.upgrades.click.level * gameState.upgrades.click.power);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateRankBar() {
    let currentRankIndex = 0;
    for (let i = 0; i < ranks.length; i++) {
        if (gameState.honey >= ranks[i].threshold) {
            currentRankIndex = i;
        }
    }

    const currentRank = ranks[currentRankIndex];
    const nextRank = ranks[currentRankIndex + 1];

    const rankNameEl = document.getElementById('rankName');
    const rankLevelEl = document.getElementById('rankLevel');
    const rankProgressEl = document.getElementById('rankProgress');

    if (rankNameEl) rankNameEl.textContent = currentRank.title;
    if (rankLevelEl) rankLevelEl.textContent = `${currentRankIndex + 1} уровень`;

    if (rankProgressEl) {
        if (nextRank) {
            const range = nextRank.threshold - currentRank.threshold;
            const progress = (gameState.honey - currentRank.threshold) / range;
            const pct = Math.min(100, Math.max(0, Math.floor(progress * 100)));
            rankProgressEl.style.width = pct + '%';
        } else {
            rankProgressEl.style.width = '100%';
        }
    }
}

function updateGameInterface() {
    const honeyValEl = document.getElementById('honeyCount');
    const hpsDisplayEl = document.getElementById('hpsDisplay');
    if (honeyValEl) honeyValEl.textContent = Math.floor(gameState.honey).toLocaleString('ru-RU');
    if (hpsDisplayEl) hpsDisplayEl.textContent = `+${getCalculatedHPS().toLocaleString('ru-RU')} в секунду`;

    for (const key in gameState.upgrades) {
        const item = gameState.upgrades[key];
        const cost = getUpgradeCost(key);
        
        const costEl = document.getElementById(`cost${capitalize(key)}`);
        const lvlEl = document.getElementById(`lvl${capitalize(key)}`);
        const btnEl = document.querySelector(`#upg${capitalize(key)} .btn-buy`);

        if (costEl) costEl.textContent = cost.toLocaleString('ru-RU');
        if (lvlEl) lvlEl.textContent = item.level;
        if (btnEl) btnEl.disabled = gameState.honey < cost;
    }

    updateRankBar();
}

function buyUpgrade(key) {
    const cost = getUpgradeCost(key);
    if (gameState.honey >= cost) {
        gameState.honey -= cost;
        gameState.upgrades[key].level += 1;
        triggerClickSound(550 + Math.random() * 150);
        updateGameInterface();
        saveGameData();
    }
}

function resetGameProgress() {
    if (confirm("Точно сбросить весь прогресс пасеки?")) {
        gameState.honey = 0;
        for (const key in gameState.upgrades) {
            gameState.upgrades[key].level = 0;
        }
        saveGameData();
        updateGameInterface();
        triggerToast("Пасека сброшена");
    }
}

function initGameEngine() {
    loadGameData();
    updateGameInterface();

    const clickerBtn = document.getElementById('hiveClicker');
    if (clickerBtn) {
        clickerBtn.addEventListener('click', (e) => {
            const gain = getCalculatedClick();
            gameState.honey += gain;
            triggerClickSound(420 + Math.random() * 160);
            updateGameInterface();

            const rect = clickerBtn.getBoundingClientRect();
            const tag = document.createElement('span');
            tag.className = 'float-click-num';
            tag.textContent = `+${gain}`;
            tag.style.setProperty('--x-shift', `${(Math.random() - 0.5) * 40}px`);
            tag.style.left = `${e.clientX - rect.left}px`;
            tag.style.top = `${e.clientY - rect.top}px`;

            clickerBtn.appendChild(tag);
            setTimeout(() => tag.remove(), 750);
        });
    }

    setInterval(() => {
        const hps = getCalculatedHPS();
        if (hps > 0) {
            gameState.honey += hps / 10;
            updateGameInterface();
        }
    }, 100);

    setInterval(saveGameData, 8000);
}

// --- КАРУСЕЛЬ ОТЗЫВОВ ---
function initDraggableCarousel() {
    const viewport = document.getElementById('reviewsViewport');
    const track = document.getElementById('reviewsTrack');
    if (!viewport || !track) return;

    const children = Array.from(track.children);
    children.forEach(el => track.appendChild(el.cloneNode(true)));

    let isPointerDown = false;
    let startX = 0;
    let currentX = 0;
    let previousX = 0;
    let velocity = 0;
    const autoSpeed = 0.45;

    function getTrackHalfWidth() {
        return track.scrollWidth / 2;
    }

    function handleLoop() {
        const half = getTrackHalfWidth();
        if (half <= 0) return;

        if (currentX <= -half) {
            currentX += half;
            startX -= half;
        } else if (currentX >= 0) {
            currentX -= half;
            startX += half;
        }
    }

    function render() {
        if (!isPointerDown) {
            currentX -= autoSpeed;
            currentX += velocity;
            velocity *= 0.94;
            handleLoop();
        }
        track.style.transform = `translate3d(${currentX}px, 0, 0)`;
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    viewport.addEventListener('pointerdown', (e) => {
        isPointerDown = true;
        startX = e.clientX - currentX;
        previousX = e.clientX;
        velocity = 0;
        viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener('pointermove', (e) => {
        if (!isPointerDown) return;
        velocity = e.clientX - previousX;
        previousX = e.clientX;
        currentX = e.clientX - startX;
        handleLoop();
    });

    const stopDragging = (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;
        try {
            viewport.releasePointerCapture(e.pointerId);
        } catch {}
    };

    viewport.addEventListener('pointerup', stopDragging);
    viewport.addEventListener('pointercancel', stopDragging);
}

// --- ПЛАВНЫЙ СКРОЛЛ ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                history.pushState(null, '', targetId);
            }
        });
    });
}

// --- ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ---
function initScrollReveal() {
    const elementsToAnimate = document.querySelectorAll(
        '.access-way-card, .hub-ip-box, .game-board, .narrative-header, .chapter-block, .shop-promo-card, .section-heading, .faq-unit'
    );

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    elementsToAnimate.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
}

// --- АККОРДЕОН FAQ ---
function initFAQ() {
    document.querySelectorAll('.faq-header-btn').forEach(button => {
        button.addEventListener('click', () => {
            const parent = button.closest('.faq-unit');
            const dropdown = parent.querySelector('.faq-dropdown');
            const isOpen = parent.classList.contains('open');

            document.querySelectorAll('.faq-unit').forEach(unit => {
                unit.classList.remove('open');
                const drop = unit.querySelector('.faq-dropdown');
                if (drop) drop.style.maxHeight = null;
            });

            if (!isOpen) {
                parent.classList.add('open');
                dropdown.style.maxHeight = dropdown.scrollHeight + 'px';
            }
        });
    });
}

// --- МОДАЛКИ И ОПЛАТА ---
const paymentModal = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const payForm = document.getElementById('paymentForm');

function openModal() {
    if (paymentModal) {
        paymentModal.style.display = 'flex';
    }
}

function initModals() {
    if (closeModal && paymentModal) {
        closeModal.onclick = () => {
            paymentModal.style.display = 'none';
        };
    }

// Открытие любых юридических окон по атрибуту data-modal
    document.querySelectorAll("[data-modal]").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const targetModal = document.getElementById(link.dataset.modal);
            if (targetModal) targetModal.style.display = "flex";
        });
    });

    document.querySelectorAll(".close-button").forEach(btn => {
        btn.addEventListener("click", () => {
            const overlay = btn.closest(".overlay");
            if (overlay) overlay.style.display = "none";
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('overlay')) {
            e.target.style.display = 'none';
        }
    });

    if (payForm) {
        payForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nickname = payForm.querySelector('input[name="nickname"]').value.trim();
            const promocode = payForm.querySelector('input[name="promocode"]').value.trim();
            const itemType = document.getElementById('itemType') ? document.getElementById('itemType').value : 'pass';
            const submitBtn = payForm.querySelector('.modal-submit-btn');

            submitBtn.innerText = "Создание платежа...";
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://pay.apiarysmp.online/create', {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nickname, type: itemType, promocode })
                });
                
                const result = await response.json();
                if (result.url) {
                    window.location.href = result.url;
                } else {
                    alert("Ошибка: " + (result.error || "Не удалось создать платеж"));
                }
            } catch {
                alert("Ошибка соединения с сервером оплаты.");
            } finally {
                submitBtn.innerText = "Оплатить и скипнуть анкету";
                submitBtn.disabled = false;
            }
        });
    }
}

// --- ЕДИНАЯ ТОЧКА СТАРТА ---
document.addEventListener('DOMContentLoaded', () => {
    checkOnlineStatus();
    initGameEngine();
    initDraggableCarousel();
    initSmoothScroll();
    initScrollReveal();
    initFAQ();
    initModals();
});


// Быстрый запуск покупки прямо с первого экрана
function startPassPurchase() {
    const heroInput = document.getElementById('heroNick');
    const nickVal = heroInput ? heroInput.value.trim() : '';

    openModal();

    if (nickVal) {
        const modalNickField = document.getElementById('nickField');
        if (modalNickField) {
            modalNickField.value = nickVal;
        }
    }
}

// Запуск по нажатию Enter в инпуте первого экрана
document.addEventListener('DOMContentLoaded', () => {
    const heroInput = document.getElementById('heroNick');
    if (heroInput) {
        heroInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                startPassPurchase();
            }
        });
    }
});