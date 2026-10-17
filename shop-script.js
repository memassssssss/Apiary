// --- КОНФИГУРАЦИЯ СЕРВЕРА ---
const SERVER_IP = "play.apiarysmp.online";
const MANAGER_TG = "Apiary_SMP";

let currentProductKey = "";
let currentSelectedProduct = "";
let currentSelectedPrice = 0;
let currentSelectedVariant = "";

let currentTgProductTitle = "";
let currentTgProductPrice = 0;

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

// --- ВЫБОР ВАРИАНТОВ В КАРТОЧКАХ ---
function initCardVariants() {
    document.querySelectorAll('.card-variant-selector').forEach(selector => {
        const chips = selector.querySelectorAll('.variant-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });
    });
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

// --- 1. ОНЛАЙН-ОПЛАТА ЧЕРЕЗ ЮKASSA (КАРТОЧКИ КАТАЛОГА) ---
function orderProduct(key, title, price) {
    currentProductKey = key;
    currentSelectedProduct = title;
    currentSelectedPrice = price;
    currentSelectedVariant = "";
    openOrderModal();
}

function orderProductWithVariant(btnElement, key, baseTitle, price) {
    const card = btnElement.closest('.product-card');
    const activeChip = card ? card.querySelector('.variant-chip.active') : null;
    const variantName = activeChip ? activeChip.dataset.val : "";

    currentProductKey = key;
    currentSelectedProduct = baseTitle;
    currentSelectedPrice = price;
    currentSelectedVariant = variantName;

    openOrderModal();
}

function openOrderModal() {
    const modal = document.getElementById('orderModal');
    const titleEl = document.getElementById('orderModalItemTitle');
    const priceEl = document.getElementById('orderModalItemPrice');
    const nickInput = document.getElementById('orderNickField');
    const promoInput = document.getElementById('orderPromoField');
    const keyField = document.getElementById('orderProductKey');
    const varField = document.getElementById('orderProductVariant');

    const fullTitle = currentSelectedVariant 
        ? `${currentSelectedProduct} (${currentSelectedVariant})` 
        : currentSelectedProduct;

    if (titleEl) titleEl.textContent = fullTitle;
    if (priceEl) priceEl.textContent = `${currentSelectedPrice}₽`;
    if (nickInput) nickInput.value = '';
    if (promoInput) promoInput.value = '';
    if (keyField) keyField.value = currentProductKey;
    if (varField) varField.value = currentSelectedVariant;

    if (modal) modal.style.display = 'flex';
}

// --- 2. ОФОРМЛЕНИЕ ЧЕРЕЗ TELEGRAM (СПОНСОР И ПРЕФИКС) ---
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

// --- ИНИЦИАЛИЗАЦИЯ ВСЕХ МОДАЛОК И СОБЫТИЙ ---
function initModals() {
    const orderModal = document.getElementById('orderModal');
    const closeOrderBtn = document.getElementById('closeOrderModal');
    const shopForm = document.getElementById('shopPaymentForm');

    const tgOrderModal = document.getElementById('tgOrderModal');
    const closeTgOrderBtn = document.getElementById('closeTgOrderModal');
    const tgNickInput = document.getElementById('tgNickField');

    if (closeOrderBtn && orderModal) {
        closeOrderBtn.onclick = () => { orderModal.style.display = 'none'; };
    }

    if (closeTgOrderBtn && tgOrderModal) {
        closeTgOrderBtn.onclick = () => { tgOrderModal.style.display = 'none'; };
    }

    if (tgNickInput) {
        tgNickInput.addEventListener('input', updateTgDirectLink);
    }

    // Отправка формы ЮKassa на бэкенд pay.apiarysmp.online
    if (shopForm) {
        shopForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nickname = document.getElementById('orderNickField').value.trim();
            const promocode = document.getElementById('orderPromoField').value.trim();
            const pType = document.getElementById('orderProductKey').value;
            const variant = document.getElementById('orderProductVariant').value;
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
                        promocode: promocode,
                        variant: variant
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

    // Модалки документов в футере
    document.querySelectorAll(".footer-link[data-modal]").forEach(link => {
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
}

// --- ЕДИНАЯ ТОЧКА СТАРТА ---
document.addEventListener('DOMContentLoaded', () => {
    initCatalogFilters();
    initCardVariants();
    initSandboxSimulator();
    initModals();
});