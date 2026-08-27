// Projects Section Slider
(function () {
    let currentIndex = 0;
    let isAnimating = false;
    let eventsBound = false;

    function getCards() {
        return Array.from(document.querySelectorAll('.project-card'));
    }

    function showProject(index) {
        const cards = getCards();
        if (!cards.length) return;
        currentIndex = ((index % cards.length) + cards.length) % cards.length;
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === currentIndex);
        });
    }

    function nextProject() {
        const cards = getCards();
        if (!cards.length || isAnimating) return;
        isAnimating = true;

        const oldIndex = currentIndex;
        currentIndex = (currentIndex + 1) % cards.length;

        const oldCard = cards[oldIndex];
        const newCard = cards[currentIndex];

        if (oldCard) {
            oldCard.classList.remove('active');
            oldCard.classList.add('slide-out-left');
        }
        if (newCard) {
            newCard.classList.add('active', 'slide-in-right');
        }

        setTimeout(() => {
            if (oldCard) oldCard.classList.remove('slide-out-left');
            if (newCard) newCard.classList.remove('slide-in-right');
            isAnimating = false;
        }, 600);
    }

    function prevProject() {
        const cards = getCards();
        if (!cards.length || isAnimating) return;
        isAnimating = true;

        const oldIndex = currentIndex;
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;

        const oldCard = cards[oldIndex];
        const newCard = cards[currentIndex];

        if (oldCard) {
            oldCard.classList.remove('active');
            oldCard.classList.add('slide-out-right');
        }
        if (newCard) {
            newCard.classList.add('active', 'slide-in-left');
        }

        setTimeout(() => {
            if (oldCard) oldCard.classList.remove('slide-out-right');
            if (newCard) newCard.classList.remove('slide-in-left');
            isAnimating = false;
        }, 600);
    }

    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;

        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (nextBtn) {
            nextBtn.addEventListener('click', nextProject);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', prevProject);
        }

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            const target = e.target;
            const isTyping = target && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            );

            const isModalOpen = Boolean(document.querySelector('.modal-overlay.modal-visible'));
            if (isTyping || isModalOpen) {
                return;
            }

            if (e.key === 'ArrowLeft') {
                prevProject();
            } else if (e.key === 'ArrowRight') {
                nextProject();
            }
        });
    }

    function initProjectsSlider() {
        bindEvents();
        const cards = getCards();
        if (!cards.length) return;
        // Keep current active index if valid, or reset to 0
        const activeIdx = cards.findIndex(c => c.classList.contains('active'));
        showProject(activeIdx >= 0 ? activeIdx : 0);
    }

    window.initProjectsSlider = initProjectsSlider;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectsSlider, { once: true });
    } else {
        initProjectsSlider();
    }
})();
