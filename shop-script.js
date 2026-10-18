// --- КОНФИГУРАЦИЯ СЕРВЕРА ---
const SERVER_IP = "play.apiarysmp.online";
const MANAGER_TG = "Apiary_SMP";

let currentProductKey = "";
let currentSelectedProduct = "";
let currentSelectedPrice = 0;

let currentTgProductTitle = "";
let currentTgProductPrice = 0;

// --- СОСТОЯНИЕ ЛАЙТБОКСА / ГАЛЕРЕИ ---
let galleryImages = [];
let galleryIndex = 0;
let galleryTitle = "";

let touchStartX = 0;
let touchEndX = 0;

// --- УПРАВЛЕНИЕ ВЕРХНЕЙ ПЛАШКОЙ СТАТУСА ---
function dismissNoticeBar() {
    const bar = document.getElementById('shopNoticeBar');
    if (bar) {
        bar.style.opacity = '0';
        bar.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            bar.style.display = 'none';
        }, 250);
        try {
            localStorage.setItem('apiary_notice_dismissed', 'true');
        } catch {}
    }
}

function checkNoticeBarState() {
    try {
        if (localStorage.getItem('apiary_notice_dismissed') === 'true') {
            const bar = document.getElementById('shopNoticeBar');
            if (bar) bar.style.display = 'none';
        }
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
function copyIP() {
    navigator.clipboard.writeText(SERVER_IP).then(() => {
        triggerToast("IP скопирован: " + SERVER_IP);
    }).catch(() => {
        triggerToast("Адрес: " + SERVER_IP);
    });
}

// --- ОБРАБОТКА СКРИНШОТОВ (ФОЛБЭК + МУЛЬТИ-ГАЛЕРЕЯ) ---
function handleImgError(imgElement) {
    imgElement.style.display = 'none';
    const parent = imgElement.parentElement;
    if (!parent) return;

    const fallback = parent.querySelector('.media-fallback');
    if (fallback) fallback.style.display = 'flex';

    const badge = parent.querySelector('.media-badge-count');
    if (badge) badge.style.display = 'none';

    const overlay = parent.querySelector('.media-overlay');
    if (overlay) overlay.style.display = 'none';
}

function openLightbox(mediaEl) {
    const rawImages = mediaEl.dataset.images || "";
    galleryImages = rawImages.split(',').map(s => s.trim()).filter(Boolean);
    galleryTitle = mediaEl.dataset.title || 'Скриншот позиции';
    galleryIndex = 0;

    const imgEl = mediaEl.querySelector('img');
    if (imgEl && imgEl.style.display === 'none') {
        triggerToast("Скриншоты для этой позиции скоро будут загружены!");
        return;
    }

    if (galleryImages.length === 0) return;

    updateLightboxView();

    const modal = document.getElementById('imageLightboxModal');
    if (modal) modal.style.display = 'flex';
}

function updateLightboxView() {
    const lbImg = document.getElementById('lightboxImage');
    const lbCap = document.getElementById('lightboxCaption');
    const lbCounter = document.getElementById('lightboxCounter');
    const prevBtn = document.getElementById('lightboxPrevBtn');
    const nextBtn = document.getElementById('lightboxNextBtn');

    if (lbImg) lbImg.src = galleryImages[galleryIndex];
    if (lbCap) lbCap.textContent = galleryTitle;
    
    if (galleryImages.length > 1) {
        if (lbCounter) {
            lbCounter.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
            lbCounter.style.display = 'inline-block';
        }
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
    } else {
        if (lbCounter) lbCounter.style.display = 'none';
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    }
}

function prevLightboxImage(e) {
    if (e) e.stopPropagation();
    if (galleryImages.length <= 1) return;
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxView();
}

function nextLightboxImage(e) {
    if (e) e.stopPropagation();
    if (galleryImages.length <= 1) return;
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    updateLightboxView();
}

function closeLightbox(e) {
    const modal = document.getElementById('imageLightboxModal');
    if (e.target.id === 'imageLightboxModal') {
        if (modal) modal.style.display = 'none';
    }
}

function forceCloseLightbox() {
    const modal = document.getElementById('imageLightboxModal');
    if (modal) modal.style.display = 'none';
}

// --- ФИЛЬТРАЦИЯ И ПОИСК ТОВАРОВ ---
function initCatalogFilters() {
    const tabs = document.querySelectorAll('.filter-tab');
    const searchInput = document.getElementById('shopSearchInput');
    const cards = document.querySelectorAll('.product-card');

    let activeCategory = 'all';
    let searchQuery = '';

    function applyFilters() {
        cards.forEach(card => {
            const categories = (card.dataset.category || '').split(' ');
            const title = (card.querySelector('.product-title')?.textContent || '').toLowerCase();
            const desc = (card.querySelector('.product-desc')?.textContent || '').toLowerCase();

            const matchesCategory = activeCategory === 'all' || categories.includes(activeCategory);
            const matchesSearch = !searchQuery || title.includes(searchQuery) || desc.includes(searchQuery);

            if (matchesCategory && matchesSearch) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = tab.dataset.category;
            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            applyFilters();
        });
    }
}

// --- ИНТЕРАКТИВНЫЙ СИМУЛЯТОР ЧАТА И TAB ---
function initSandboxSimulator() {
    const nickInput = document.getElementById('previewNick');
    const prefixInput = document.getElementById('previewPrefix');
    const colorBtns = document.querySelectorAll('.color-btn');

    const tabPrefix = document.getElementById('tabPrefixDisplay');
    const tabNick = document.getElementById('tabNickDisplay');
    const chatPrefix = document.getElementById('chatPrefixDisplay');
    const chatNick = document.getElementById('chatNickDisplay');

    let activeColor = '#f2a829';

    function updatePreview() {
        const nickVal = nickInput && nickInput.value.trim() ? nickInput.value.trim() : 'Notch';
        const prefixVal = prefixInput && prefixInput.value.trim() ? prefixInput.value.trim() : 'Игрок';

        if (tabNick) tabNick.textContent = nickVal;
        if (chatNick) chatNick.textContent = nickVal;

        if (tabPrefix) {
            tabPrefix.textContent = `[${prefixVal}]`;
            tabPrefix.style.color = activeColor;
        }
        if (chatPrefix) {
            chatPrefix.textContent = `[${prefixVal}]`;
            chatPrefix.style.color = activeColor;
        }
    }

    if (nickInput) nickInput.addEventListener('input', updatePreview);
    if (prefixInput) prefixInput.addEventListener('input', updatePreview);

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeColor = btn.dataset.color;
            updatePreview();
        });
    });

    updatePreview();
}

// --- 1. ПРЯМАЯ ОНЛАЙН-ОПЛАТА ЧЕРЕЗ ЮKASSA ---
function orderProduct(key, title, price) {
    currentProductKey = key;
    currentSelectedProduct = title;
    currentSelectedPrice = price;

    const modal = document.getElementById('orderModal');
    const titleEl = document.getElementById('orderModalItemTitle');
    const priceEl = document.getElementById('orderModalItemPrice');
    const nickInput = document.getElementById('orderNickField');
    const promoInput = document.getElementById('orderPromoField');
    const keyField = document.getElementById('orderProductKey');

    if (titleEl) titleEl.textContent = currentSelectedProduct;
    if (priceEl) priceEl.textContent = `${currentSelectedPrice}₽`;
    if (nickInput) nickInput.value = '';
    if (promoInput) promoInput.value = '';
    if (keyField) keyField.value = currentProductKey;

    if (modal) modal.style.display = 'flex';
}

// --- 2. ОФОРМЛЕНИЕ ЧЕРЕЗ TELEGRAM ---
function orderViaTelegram(title, price) {
    currentTgProductTitle = title;
    currentTgProductPrice = price;

    const modal = document.getElementById('tgOrderModal');
    const titleEl = document.getElementById('tgOrderModalTitle');
    const priceEl = document.getElementById('tgOrderModalPrice');
    const nickInput = document.getElementById('tgNickField');

    if (titleEl) titleEl.textContent = title;
    if (priceEl) priceEl.textContent = `${price}₽`;
    if (nickInput) nickInput.value = '';

    updateTgDirectLink();

    if (modal) modal.style.display = 'flex';
}

function updateTgDirectLink() {
    const nickInput = document.getElementById('tgNickField');
    const tgBtn = document.getElementById('tgDirectRedirectBtn');
    if (!tgBtn) return;

    const nickname = nickInput && nickInput.value.trim() ? nickInput.value.trim() : "Не указан";
    const textMsg = `Привет! Хочу оформить в лавке ApiarySMP:\n• Позиция: ${currentTgProductTitle}\n• Стоимость: ${currentTgProductPrice}₽\n• Мой игровой ник: ${nickname}`;
    
    tgBtn.href = `https://t.me/${MANAGER_TG}?text=${encodeURIComponent(textMsg)}`;
}

// --- ПЛАВНЫЙ СКРОЛЛ К ПЕСОЧНИЦЕ С АВТОФОКУСОМ ---
function scrollToSandbox() {
    const sandbox = document.querySelector('.sandbox-section');
    if (sandbox) {
        sandbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        triggerToast("Примерьте свой префикс и цвет в симуляторе!");
        setTimeout(() => {
            const pInput = document.getElementById('previewPrefix');
            if (pInput) pInput.focus();
        }, 400);
    }
}

// --- ИНИЦИАЛИЗАЦИЯ ВСЕХ МОДАЛОК И СОБЫТИЙ ---
function initModals() {
    const orderModal = document.getElementById('orderModal');
    const closeOrderBtn = document.getElementById('closeOrderModal');
    const shopForm = document.getElementById('shopPaymentForm');

    const tgOrderModal = document.getElementById('tgOrderModal');
    const closeTgOrderBtn = document.getElementById('closeTgOrderModal');
    const tgNickInput = document.getElementById('tgNickField');
    const lbContainer = document.querySelector('.lightbox-container');

    if (closeOrderBtn && orderModal) {
        closeOrderBtn.onclick = () => { orderModal.style.display = 'none'; };
    }

    if (closeTgOrderBtn && tgOrderModal) {
        closeTgOrderBtn.onclick = () => { tgOrderModal.style.display = 'none'; };
    }

    if (tgNickInput) {
        tgNickInput.addEventListener('input', updateTgDirectLink);
    }

    window.addEventListener('keydown', (e) => {
        const lb = document.getElementById('imageLightboxModal');
        if (!lb || lb.style.display !== 'flex') return;

        if (e.key === 'Escape') forceCloseLightbox();
        if (e.key === 'ArrowLeft') prevLightboxImage();
        if (e.key === 'ArrowRight') nextLightboxImage();
    });

    if (lbContainer) {
        lbContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lbContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 40) {
                if (diff < 0) nextLightboxImage();
                else prevLightboxImage();
            }
        }, { passive: true });
    }

    if (shopForm) {
        shopForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nickname = document.getElementById('orderNickField').value.trim();
            const promocode = document.getElementById('orderPromoField').value.trim();
            const pType = document.getElementById('orderProductKey').value;
            const submitBtn = document.getElementById('shopSubmitPayBtn');

            if (!nickname) {
                alert("Пожалуйста, введите ваш никнейм Minecraft!");
                return;
            }

            submitBtn.innerText = "Создание платежа...";
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://pay.apiarysmp.online/create', {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nickname: nickname,
                        type: pType,
                        promocode: promocode
                    })
                });

                const result = await response.json();
                if (result.url) {
                    window.location.href = result.url;
                } else {
                    alert("Ошибка оплаты: " + (result.error || "Не удалось создать счет"));
                }
            } catch (err) {
                alert("Ошибка связи с платежным сервером.");
            } finally {
                submitBtn.innerText = "Оплатить через ЮKassa";
                submitBtn.disabled = false;
            }
        });
    }

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
        if (e.target.classList.contains('overlay') && e.target.id !== 'imageLightboxModal') {
            e.target.style.display = 'none';
        }
    });
}

// --- ЕДИНАЯ ТОЧКА СТАРТА ---
document.addEventListener('DOMContentLoaded', () => {
    checkNoticeBarState();
    initCatalogFilters();
    initSandboxSimulator();
    initModals();
});