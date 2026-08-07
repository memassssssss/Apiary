// --- БЛОК ОПЛАТЫ И СТАРЫХ МОДАЛОК ---
const modal = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModal');
const payForm = document.getElementById('paymentForm');

function openModal() {
    if (modal) modal.style.display = 'flex';
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
    payForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nickname = payForm.querySelector('input[name="nickname"]').value;
        const promocode = payForm.querySelector('input[name="promocode"]').value;
        const itemType = document.getElementById('itemType') ? document.getElementById('itemType').value : 'pass';
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
            if (result.url) {
                window.location.href = result.url;
            } else {
                alert("Ошибка: " + (result.error || "Не удалось создать платеж"));
            }
        } catch (err) {
            alert("Ошибка соединения с сервером оплаты.");
        } finally {
            payButton.innerText = "Оплатить";
            payButton.disabled = false;
        }
    });
}

// --- БЛОК КОПИРОВАНИЯ IP / ПЕРЕХОДА ПО ССЫЛКЕ ---
function handleIpClick(event) {
    if (window.innerWidth <= 992) {
        event.preventDefault();
        copyIP();
    }
}

function copyIP() {
    const ipTextElem = document.getElementById('ipText');
    const ipHint = document.getElementById('ipHint');
    if (!ipTextElem) return;

    const ipText = ipTextElem.innerText;
    
    navigator.clipboard.writeText(ipText).then(() => {
        if (!ipHint) return;
        const originalHTML = ipHint.innerHTML; 
        
        ipHint.innerText = "Скопировано!";
        ipHint.style.color = "#FFC300";
        
        setTimeout(() => {
            ipHint.innerHTML = originalHTML;
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

// --- ЛОГИКА ПОРТАЛОВ (ИЗМЕНЕНИЕ ФОНА) ---
document.addEventListener('DOMContentLoaded', () => {
    const portalsSection = document.getElementById('servers-portals');
    const cards = document.querySelectorAll('.portal-card');

    if (portalsSection) {
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const bgColor = card.getAttribute('data-bg');
                if (bgColor) portalsSection.style.backgroundColor = bgColor;
            });

            card.addEventListener('mouseleave', () => {
                portalsSection.style.backgroundColor = '#0a0a0a'; 
            });
        });
    }
});

// --- НЕЗАВИСИМОЕ КОПИРОВАНИЕ IP ---
function copyHubIP(ipText, btnElement) {
    navigator.clipboard.writeText(ipText).then(() => {
        const originalText = btnElement.innerText;
        const originalWidth = btnElement.offsetWidth;
        
        btnElement.style.width = `${originalWidth}px`;
        btnElement.innerText = "IP Скопирован! Ищи NPC в Хабе";
        btnElement.style.background = "linear-gradient(135deg, #00c853, #009624)"; 
        btnElement.style.color = "#fff";
        
        setTimeout(() => {
            btnElement.innerText = originalText;
            btnElement.style.width = '100%'; 
            btnElement.style.background = ""; 
            btnElement.style.color = "";
        }, 3000);
    }).catch(err => {
        console.error('Ошибка копирования IP: ', err);
        alert('Не удалось скопировать IP. Введите вручную: ' + ipText);
    });
}

// --- ПЛАВНЫЙ FAQ (JS Аккордеон) ---
document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');
        
        document.querySelectorAll('.faq-item').forEach(el => {
            el.classList.remove('active');
            const wrapper = el.querySelector('.faq-content-wrapper');
            if (wrapper) wrapper.style.maxHeight = null;
        });

        if (!isActive) {
            item.classList.add('active');
            const content = item.querySelector('.faq-content-wrapper');
            if (content) content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});

// --- СВАЙП-КАРУСЕЛЬ ОТЗЫВОВ ---
const sliderWindow = document.getElementById('reviewsSlider');
const sliderTrack = document.getElementById('reviewsTrack');

if (sliderWindow && sliderTrack) {
    const originalItems = [...sliderTrack.children];
    originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        sliderTrack.appendChild(clone);
    });

    let currentX = 0;
    let isDragging = false;
    let startX = 0;
    let dragX = 0;
    const autoScrollSpeed = window.innerWidth <= 992 ? 0.25 : 0.6;

    function updateSliderPosition() {
        sliderTrack.style.transform = `translateX(${currentX}px)`;
    }

    function animate() {
        if (!isDragging) {
            currentX -= autoScrollSpeed;
            const halfWidth = sliderTrack.scrollWidth / 2;
            if (Math.abs(currentX) >= halfWidth) {
                currentX = 0;
            }
            updateSliderPosition();
        }
        requestAnimationFrame(animate);
    }

    animate();

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
}

// База данных с описаниями режимов
const serverModes = {
    smp: {
        title: "Apiary SMP",
        badges: '<span class="badge badge-gold">Платная проходка</span>',
        content: `
            <p>Наш основной ванильный сервер для тех, кто ценит адекватное комьюнити и масштабные проекты.</p>
            <h4>🔥 Особенности режима:</h4>
            <ul>
                <li><strong>Доверие:</strong> У нас нет приватов. За воровство и гриферство — моментальный бан.</li>
                <li><strong>Экономика:</strong> Живой рынок, где валютой выступают алмазы. Торгуй с другими игроками.</li>
                <li><strong>Ивенты:</strong> Регулярные события от администрации и самих игроков.</li>
            </ul>
            <p><em>* Вход на этот режим возможен только после покупки проходки на сайте.</em></p>
        `
    },
    sky: {
        title: "Apiary Sky",
        badges: '<span class="badge badge-dark">Бесплатно в Хабе</span>',
        content: `
            <p>Развивай свой остров, начиная всего с одного магического блока, который бесконечно регенерирует.</p>
            <h4>☁️ Что тебя ждет:</h4>
            <ul>
                <li><strong>Кастомные генераторы:</strong> Добывай редкие ресурсы прямо из своего блока.</li>
                <li><strong>Квесты:</strong> Выполняй задания для получения уникальных наград.</li>
                <li><strong>Экономика и топы:</strong> Соревнуйся с другими островами за звание лучшего.</li>
            </ul>
            <p><em>* Режим абсолютно бесплатен. Просто заходи в хаб и npc портал Скайблока.</em></p>
        `
    },
    hard: {
        title: "Apiary Hard",
        badges: '<span class="badge badge-red">Бесплатно (Скоро)</span>',
        content: `
            <p>Режим для тех, кому ванилла кажется слишком простой. Здесь нет правил.</p>
            <h4>💀 Условия выживания:</h4>
            <ul>
                <li><strong>Разрешен гриф:</strong> Защищай свои сундуки, ломай чужие.</li>
                <li><strong>Усложненные мобы:</strong> Обычные зомби покажутся тебе боссами.</li>
                <li><strong>PvP везде:</strong> Никаких безопасных зон за пределами спавна.</li>
            </ul>
            <p><em>* Открытие запланировано на 21 августа. Вход через общий хаб.</em></p>
        `
    }
};

function openModeModal(modeId, event) {
    if (event && event.target.closest('.portal-btn')) {
        return; 
    }

    const data = serverModes[modeId];
    const modeModal = document.getElementById('modeModal');
    if (!data || !modeModal) return;

    document.getElementById('modeTitle').innerText = data.title;
    document.getElementById('modeBadges').innerHTML = data.badges;
    document.getElementById('modeBody').innerHTML = data.content;
    
    modeModal.classList.add('active');
    modeModal.style.display = 'flex';
}

function closeModeModal(e) {
    const modeModal = document.getElementById('modeModal');
    if (!modeModal) return;
    if (e.target.classList.contains('mode-modal-overlay') || e.target.classList.contains('close-btn') || e.target.closest('.close-button')) {
        modeModal.classList.remove('active');
        modeModal.style.display = 'none';
    }
}