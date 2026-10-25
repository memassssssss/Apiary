document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initScrollSpy();
    initSearchAndFilters();
    initMobileNav();
    checkUrlHashTarget();
    initLegalModals();
});

// 1. ИНДИКАТОР ПРОГРЕССА ЧТЕНИЯ В САМОМ ВЕРХУ
function initProgressBar() {
    const bar = document.getElementById('readingProgress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
            const progress = (window.scrollY / totalHeight) * 100;
            bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    }, { passive: true });
}

// 2. УМНОЕ ОГЛАВЛЕНИЕ (SCROLLSPY)
function initScrollSpy() {
    const sections = document.querySelectorAll('.rules-section');
    const navLinks = document.querySelectorAll('.nav-link-item');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.dataset.section;
                navLinks.forEach(link => {
                    const match = link.getAttribute('href') === `#${id}`;
                    link.classList.toggle('active', match);
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -65% 0px',
        threshold: 0
    });

    sections.forEach(sec => observer.observe(sec));
}

// 3. ЖИВОЙ ПОИСК И БЫСТРЫЕ ТЕГИ
function initSearchAndFilters() {
    const searchInput = document.getElementById('rulesSearchInput');
    const clearBtn = document.getElementById('rulesClearSearch');
    const statsEl = document.getElementById('searchStats');
    const tagChips = document.querySelectorAll('.rule-tag-chip');
    const ruleItems = document.querySelectorAll('.rule-item');
    const sections = document.querySelectorAll('.rules-section');

    let currentQuery = '';

    function applyFilter() {
        const q = currentQuery.trim().toLowerCase();
        let matchedCount = 0;

        if (clearBtn) {
            clearBtn.style.display = q ? 'block' : 'none';
        }

        ruleItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const id = item.id.replace('rule-', '');
            const isMatch = !q || text.includes(q) || id === q;

            if (isMatch) {
                item.classList.remove('hidden');
                matchedCount++;
            } else {
                item.classList.add('hidden');
            }
        });

        // Скрываем пустые заголовки секций
        sections.forEach(sec => {
            const hasVisible = sec.querySelectorAll('.rule-item:not(.hidden)').length > 0;
            sec.classList.toggle('all-hidden', !hasVisible);
        });

        // Статистика поиска
        if (statsEl) {
            if (q) {
                statsEl.style.display = 'block';
                statsEl.textContent = `Найдено правил: ${matchedCount}`;
            } else {
                statsEl.style.display = 'none';
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentQuery = e.target.value;
            tagChips.forEach(c => c.classList.toggle('active', c.dataset.filter === 'all'));
            applyFilter();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentQuery = '';
            tagChips.forEach(c => c.classList.toggle('active', c.dataset.filter === 'all'));
            applyFilter();
            searchInput.focus();
        });
    }

    tagChips.forEach(chip => {
        chip.addEventListener('click', () => {
            tagChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const filterVal = chip.dataset.filter;
            if (filterVal === 'all') {
                currentQuery = '';
                if (searchInput) searchInput.value = '';
            } else {
                currentQuery = filterVal;
                if (searchInput) searchInput.value = filterVal;
            }
            applyFilter();
        });
    });
}

// 4. КОПИРОВАНИЕ ССЫЛКИ НА КОНКРЕТНОЕ ПРАВИЛО (#rule-X)
function copyRuleLink(ruleNumber) {
    const targetId = `rule-${ruleNumber}`;
    const url = `${window.location.origin}${window.location.pathname}#${targetId}`;

    navigator.clipboard.writeText(url).then(() => {
        triggerToast(`Ссылка на правило #${ruleNumber} скопирована!`);
        history.pushState(null, '', `#${targetId}`);
        highlightRuleElement(document.getElementById(targetId));
    }).catch(() => {
        triggerToast(`Правило #${ruleNumber}`);
    });
}

function highlightRuleElement(el) {
    if (!el) return;
    document.querySelectorAll('.rule-item.target-highlight').forEach(i => i.classList.remove('target-highlight'));
    el.classList.add('target-highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        el.classList.remove('target-highlight');
    }, 4000);
}

// 5. ПРОВЕРКА HASH ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
function checkUrlHashTarget() {
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target && target.classList.contains('rule-item')) {
            setTimeout(() => {
                highlightRuleElement(target);
            }, 300);
        }
    }
}

// 6. МОБИЛЬНОЕ МЕНЮ
function initMobileNav() {
    const nav = document.getElementById('sideNav');
    const toggleBtn = document.getElementById('navToggle');
    const backdrop = document.getElementById('navBackdrop');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (!nav || !toggleBtn) return;

    function toggleMenu(isOpen) {
        nav.classList.toggle('active', isOpen);
        toggleBtn.classList.toggle('active', isOpen);
        if (backdrop) backdrop.classList.toggle('active', isOpen);
        toggleBtn.textContent = isOpen ? '✕' : '❯';
    }

    toggleBtn.addEventListener('click', () => {
        const willOpen = !nav.classList.contains('active');
        toggleMenu(willOpen);
    });

    if (backdrop) {
        backdrop.addEventListener('click', () => toggleMenu(false));
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1540) {
                toggleMenu(false);
            }
        });
    });
}

// 7. ЮРИДИЧЕСКИЕ МОДАЛЬНЫЕ ОКНА ИЗ ПОДВАЛА
function initLegalModals() {
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

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.overlay').forEach(el => el.style.display = 'none');
        }
    });
}

// 8. ТОАСТ-УВЕДОМЛЕНИЯ
function triggerToast(text) {
    const toast = document.getElementById('toastMessage');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 2200);
}