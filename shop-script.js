// --- КОНФИГУРАЦИЯ СЕРВЕРА ---
const SERVER_IP = "play.apiarysmp.online";
const MANAGER_TG = "Apiary_SMP";

let currentSelectedProduct = "";
let currentSelectedPrice = 0;

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

// --- ФИЛЬТРАЦИЯ ТОВАРОВ ---
function initCategoryFilters() {
    const tabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.product-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            cards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// --- МОДАЛКА ЗАКАЗА И ГЕНЕРАЦИЯ ССЫЛКИ В TELEGRAM ---
function orderProduct(title, price) {
    currentSelectedProduct = title;
    currentSelectedPrice = price;

    const modal = document.getElementById('orderModal');
    const titleEl = document.getElementById('orderModalItemTitle');
    const priceEl = document.getElementById('orderModalItemPrice');
    const nickInput = document.getElementById('orderNickField');

    if (titleEl) titleEl.textContent = title;
    if (priceEl) priceEl.textContent = `${price}₽`;
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
    const textMsg = `Привет! Хочу приобрести в лавке ApiarySMP:\n• Товар: ${currentSelectedProduct}\n• Стоимость: ${currentSelectedPrice}₽\n• Мой игровой ник: ${nickname}`;
    
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
    initCategoryFilters();
    initModals();
});