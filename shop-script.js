// --- КОНФИГУРАЦИЯ СЕРВЕРА ---
const SERVER_IP = "play.apiarysmp.online";
const MANAGER_TG = "Apiary_SMP";

let currentSelectedProduct = "";
let currentSelectedPrice = 0;
let currentSelectedVariant = "";

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

// --- ЗАКРЫТИЕ ПЛАШКИ С ПОДТВЕРЖДЕНИЕМ ---
function initNoticeBarDismiss() {
    const noticeBar = document.querySelector('.shop-notice-bar');
    const noticeFlex = document.querySelector('.shop-notice-bar .notice-flex');
    if (!noticeBar || !noticeFlex) return;

    if (localStorage.getItem('apiary_notice_dismissed') === 'true') {
        noticeBar.style.display = 'none';
        return;
    }

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'notice-close-btn';
    closeBtn.setAttribute('aria-label', 'Закрыть уведомление');
    closeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
    noticeFlex.appendChild(closeBtn);

    const confirmModalHtml = `
    <div id="noticeConfirmModal" class="overlay">
        <div class="sheet-modal notice-confirm-sheet">
            <div class="modal-pretitle">Внимание</div>
            <h2 class="modal-title">Скрыть плашку?</h2>
            <p class="modal-text">
                Вы действительно хотите скрыть информационную плашку? Напоминаем: автоматическая выдача сейчас находится в разработке, все позиции оформляются вручную через Telegram менеджера @Apiary_SMP.
            </p>
            <div class="confirm-actions-row">
                <button type="button" id="confirmDismissNoticeBtn" class="modal-submit-btn">
                    Да, я всё прочитал, мне всё ясно, скрыть
                </button>
                <button type="button" id="cancelDismissNoticeBtn" class="btn-cancel-modal">
                    Отмена
                </button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', confirmModalHtml);

    const confirmModal = document.getElementById('noticeConfirmModal');
    const confirmBtn = document.getElementById('confirmDismissNoticeBtn');
    const cancelBtn = document.getElementById('cancelDismissNoticeBtn');

    closeBtn.addEventListener('click', () => {
        if (confirmModal) confirmModal.style.display = 'flex';
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirmModal) confirmModal.style.display = 'none';
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (confirmModal) confirmModal.style.display = 'none';
            noticeBar.style.display = 'none';
            localStorage.setItem('apiary_notice_dismissed', 'true');
            triggerToast("Информационная плашка скрыта");
        });
    }

    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                confirmModal.style.display = 'none';
            }
        });
    }
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

// --- ИНТЕРАКТИВНЫЕ ВАРИАНТЫ В КАРТОЧКАХ ---
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

// --- ЗАКАЗ ТОВАРА И ГЕНЕРАЦИЯ ССЫЛКИ В TELEGRAM ---
function orderProduct(title, price) {
    currentSelectedProduct = title;
    currentSelectedPrice = price;
    currentSelectedVariant = "";
    openOrderModal();
}

function orderProductWithVariant(btnElement, baseTitle, price) {
    const card = btnElement.closest('.product-card');
    const activeChip = card ? card.querySelector('.variant-chip.active') : null;
    const variantName = activeChip ? activeChip.dataset.val : "";

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

    const fullTitle = currentSelectedVariant 
        ? `${currentSelectedProduct} (${currentSelectedVariant})` 
        : currentSelectedProduct;

    if (titleEl) titleEl.textContent = fullTitle;
    if (priceEl) priceEl.textContent = `${currentSelectedPrice}₽`;
    if (nickInput) nickInput.value = '';

    updateTelegramOrderLink();

    if (modal) {
        modal.style.display = 'flex';
    }
}

function updateTelegramOrderLink() {
    const nickInput = document.getElementById('orderNickField');
    const tgBtn = document.getElementById('tgOrderRedirectBtn');
    if (!tgBtn) return;

    const nickname = nickInput && nickInput.value.trim() ? nickInput.value.trim() : "Не указан";
    const itemWithVariant = currentSelectedVariant 
        ? `${currentSelectedProduct} [Вариант: ${currentSelectedVariant}]` 
        : currentSelectedProduct;

    const textMsg = `Привет! Хочу оформить в лавке ApiarySMP:\n• Позиция: ${itemWithVariant}\n• Стоимость: ${currentSelectedPrice}₽\n• Мой никнейм в игре: ${nickname}`;
    
    tgBtn.href = `https://t.me/${MANAGER_TG}?text=${encodeURIComponent(textMsg)}`;
}

// --- МОДАЛКИ И ДОКУМЕНТЫ ---
function initModals() {
    const orderModal = document.getElementById('orderModal');
    const closeOrderBtn = document.getElementById('closeOrderModal');
    const nickInput = document.getElementById('orderNickField');

    if (closeOrderBtn && orderModal) {
        closeOrderBtn.onclick = () => {
            orderModal.style.display = 'none';
        };
    }

    if (nickInput) {
        nickInput.addEventListener('input', updateTelegramOrderLink);
    }

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
    initNoticeBarDismiss();
    initCatalogFilters();
    initCardVariants();
    initSandboxSimulator();
    initModals();
});