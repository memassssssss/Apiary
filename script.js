// --- БЛОК ОПЛАТЫ И СТАРЫХ МОДАЛОК ---
const modal = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModal');
const payForm = document.querySelector('.modal form');

function openModal() {
    modal.style.display = 'flex';
}

if (closeModalBtn) {
    closeModalBtn.onclick = () => modal.style.display = 'none';
}

document.querySelectorAll(".footer-link").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const targetModal = document.getElementById(link.dataset.modal);
        if (targetModal) targetModal.style.display = "flex";
    });
});

document.querySelectorAll(".close-button").forEach(btn => {
    btn.addEventListener("click", () => {
        const parentOverlay = btn.closest(".overlay");
        if (parentOverlay) parentOverlay.style.display = "none";
    });
});

if (payForm) {
    payForm.onsubmit = async (e) => {
        e.preventDefault();
        const nickname = payForm.querySelector('input[name="nickname"]').value;
        const promocode = payForm.querySelector('input[name="promocode"]').value;
        const itemType = document.getElementById('itemType').value;
        const payButton = payForm.querySelector('.modal-pay-button');
        
        payButton.innerText = "Создание платежа...";
        payButton.disabled = true;

        try {
            const response = await fetch('https://pay.apiarysmp.online/create', {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, type: itemType, promocode })
            });
            const result = await response.json();
            if (result.url) window.location.href = result.url;
            else alert("Ошибка: " + (result.error || "Не удалось создать платеж"));
        } catch (err) {
            alert("Ошибка соединения с сервером оплаты.");
        } finally {
            payButton.innerText = "Оплатить";
            payButton.disabled = false;
        }
    };
}

// --- БЛОК КОПИРОВАНИЯ IP ---
function copyIP() {
    const ipText = document.getElementById('ipText').innerText;
    const ipHint = document.getElementById('ipHint');
    navigator.clipboard.writeText(ipText).then(() => {
        ipHint.innerText = "Скопировано!";
        ipHint.style.color = "#FFC300";
        setTimeout(() => {
            ipHint.innerText = "Нажми, чтобы скопировать";
            ipHint.style.color = "rgba(255, 255, 255, 0.5)";
        }, 2000);
    });
}

// --- МИКРО-АНИМАЦИИ ПРИ СКРОЛЛЕ ---
document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll('.scroll-anim').forEach(el => observer.observe(el));
});

// --- БЛОК ИНТЕРАКТИВНОЙ КАРУСЕЛИ РЕЖИМОВ (С дополнительной инфой) ---
const modesData = [
    {
        title: "Apiary SMP",
        desc: "Ванила+ с масштабными ивентами, развитой экономикой и полностью без грифа. Администрация играет на равных с вами. Полноценное ПВЕ и суды для решения конфликтов.",
        render: "./img/main_render.png", 
        badges: ["1.21.11", "Платный", "Без грифа"],
        features: ["Масштабные ивенты", "Строгий анти-гриф", "Внутренние суды", "Живая экономика"],
        plugins: ["Simple Voice Chat", "CoreProtect", "Кастомная генерация", "1000 достижений"],
        rulesLink: "/rules-main.html",
        actionType: "pay",
        bgColor: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(30, 20, 0, 0.6) 50%, rgba(0,0,0,0) 100%)"
    },
    {
        title: "Apiary Mini",
        desc: "Сервер для всех желающих! Здесь разрешено ПВП, но классический гриф запрещен. Идеально для того, что бы впервые прочувствовать сервер :)",
        render: "./img/mini_render.png", 
        badges: ["1.21.11", "Бесплатный", "Вайт-лист"],
        features: ["Большой онлайн", "ПВП разрешено", "Донат через ТГ-бота", "Активная модерация"],
        plugins: ["Новые зачарования", "/tpa и /spawn", "Лучший анти-чит", "Simple Voice Chat"],
        rulesLink: "/rules-mini.html",
        actionType: "bot",
        bgColor: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0, 20, 40, 0.6) 50%, rgba(0,0,0,0) 100%)"
    },
    {
        title: "Apiary Hard",
        desc: "Настоящее испытание для хардкорных игроков. Режим Hardcore: жестокие убийства, тотальный гриф и полное отсутствие жалости. Выживет сильнейший.",
        render: "./img/hard_render.png",
        badges: ["1.21.11", "Хардкор", "Гриф разрешен"],
        features: ["Полный хаос", "Разрешен гриф", "Разрешено ПВП", "Нет ограничений"],
        plugins: ["Только ванильные механики", "Жесткий анти-чит", "Ограничения карты"],
        rulesLink: "/rules-hard.html",
        actionType: "bot",
        bgColor: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(40, 5, 5, 0.6) 50%, rgba(0,0,0,0) 100%)"
    }
];

let currentIndex = 0;
const updateCarousel = (index) => {
    const data = modesData[index];
    document.querySelectorAll('.animate-target').forEach(el => el.classList.add('fade-hidden'));
    
    setTimeout(() => {
        document.getElementById('renderImg').src = data.render;
        document.getElementById('modeTitle').innerText = data.title;
        document.getElementById('modeDesc').innerText = data.desc;
        document.getElementById('modes-carousel').style.background = data.bgColor;
        document.getElementById('modeRulesLink').href = data.rulesLink;
        
        const badgesContainer = document.getElementById('modeBadges');
        badgesContainer.innerHTML = "";
        data.badges.forEach((badge, idx) => {
            badgesContainer.innerHTML += `<span class="badge ${idx === 1 ? 'highlight-badge' : ''}">${badge}</span>`;
        });

        const featuresContainer = document.getElementById('modeFeatures');
        featuresContainer.innerHTML = data.features.map(f => `<li>${f}</li>`).join("");

        const pluginsContainer = document.getElementById('modePlugins');
        pluginsContainer.innerHTML = data.plugins.map(p => `<li>${p}</li>`).join("");
        
        const actionContainer = document.getElementById('modeActionContainer');
        if (data.actionType === "pay") {
            actionContainer.innerHTML = `<button class="mode-cta-btn" onclick="openModal()">Купить проходку</button>`;
        } else {
            actionContainer.innerHTML = `<a href="https://t.me/apiary_shop_bot" target="_blank" class="mode-cta-btn bot-btn">Подать заявку в боте</a>`;
        }
        
        document.querySelectorAll('.animate-target').forEach(el => el.classList.remove('fade-hidden'));
    }, 300); 
};

document.getElementById('prevBtn')?.addEventListener('click', () => {
    currentIndex = (currentIndex === 0) ? modesData.length - 1 : currentIndex - 1;
    updateCarousel(currentIndex);
});
document.getElementById('nextBtn')?.addEventListener('click', () => {
    currentIndex = (currentIndex === modesData.length - 1) ? 0 : currentIndex + 1;
    updateCarousel(currentIndex);
});
updateCarousel(currentIndex);

// --- ПЛАВНЫЙ FAQ (JS Аккордеон) ---
document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');
        
        // Закрываем все
        document.querySelectorAll('.faq-item').forEach(el => {
            el.classList.remove('active');
            el.querySelector('.faq-content-wrapper').style.maxHeight = null;
        });

        // Открываем кликнутый, если он был закрыт
        if (!isActive) {
            item.classList.add('active');
            const content = item.querySelector('.faq-content-wrapper');
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});

// --- СВАЙП-КАРУСЕЛЬ ОТЗЫВОВ (НА ЧИСТОМ TRANSFORM) ---
const sliderWindow = document.getElementById('reviewsSlider');
const sliderTrack = document.getElementById('reviewsTrack');

// Дублируем элементы для бесконечного цикла
const originalItems = [...sliderTrack.children];
originalItems.forEach(item => {
    const clone = item.cloneNode(true);
    sliderTrack.appendChild(clone);
});

let currentX = 0;          // Текущая позиция ленты в пикселях
let isDragging = false;    // Флаг зажатой мыши/пальца
let startX = 0;            // Точка старта при клике/касании
let dragX = 0;             // Расстояние, на которое протащили в текущий момент
// Автоматически снижаем скорость прокрутки, если экран меньше или равен 992px
const autoScrollSpeed = window.innerWidth <= 992 ? 0.25 : 0.6;

// Функция обновления позиции через CSS Transform (работает быстрее и плавнее)
function updateSliderPosition() {
    sliderTrack.style.transform = `translateX(${currentX}px)`;
}

// Главный цикл автопрокрутки
function animate() {
    if (!isDragging) {
        currentX -= autoScrollSpeed;
        
        // Вычисляем ширину половины трека (оригинальных карточек вместе с gap)
        // Так как все карточки одинаковые, ширина половины — это ровно половина scrollWidth
        const halfWidth = sliderTrack.scrollWidth / 2;
        
        // Если лента уехала влево больше чем на половину — сбрасываем в 0 для бесшовности
        if (Math.abs(currentX) >= halfWidth) {
            currentX = 0;
        }
        updateSliderPosition();
    }
    requestAnimationFrame(animate);
}

// Запуск анимации
animate();

// --- ОБРАБОТЧИКИ ДЛЯ МЫШИ (ДЕСКТОП) ---
sliderWindow.addEventListener('mousedown', (e) => {
    isDragging = true;
    sliderWindow.style.cursor = 'grabbing';
    startX = e.pageX - currentX;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    dragX = x - startX;
    
    // Ограничиваем свайп, чтобы не улетать в пустоту при резком рывке
    const halfWidth = sliderTrack.scrollWidth / 2;
    if (dragX > 0) dragX = -halfWidth; 
    if (Math.abs(dragX) >= halfWidth) dragX = 0;

    currentX = dragX;
    updateSliderPosition();
});

window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    sliderWindow.style.cursor = 'grab';
});

// --- ОБРАБОТЧИКИ ДЛЯ ТАЧА (МОБИЛКИ) ---
sliderWindow.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - currentX;
}, { passive: true });

sliderWindow.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX;
    dragX = x - startX;

    const halfWidth = sliderTrack.scrollWidth / 2;
    if (dragX > 0) dragX = -halfWidth;
    if (Math.abs(dragX) >= halfWidth) dragX = 0;

    currentX = dragX;
    updateSliderPosition();
}, { passive: true });

sliderWindow.addEventListener('touchend', () => {
    isDragging = false;
});