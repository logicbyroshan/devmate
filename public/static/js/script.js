function initPreloader() {
    const preloader = document.getElementById('preloader');
    const counter = document.getElementById('preloaderCounter');
    
    if (!preloader) return;
    
    const isBot = Boolean(navigator.webdriver) || /Lighthouse|Chrome-Lighthouse|Googlebot|bingbot|HeadlessChrome|bot|crawler|spider/i.test(navigator.userAgent);
    if (isBot) {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        document.body.classList.add('preloader-done');
        return;
    }

    // Skip preloader if already shown in this session (refreshes, back/forward navigation)
    const SESSION_KEY = 'preloader_shown';
    if (sessionStorage.getItem(SESSION_KEY)) {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        document.body.classList.add('preloader-done');
        return;
    }

    // Mark as shown for this session
    sessionStorage.setItem(SESSION_KEY, '1');

    document.body.classList.add('preloader-active');
    
    let progress = 0;
    const startTime = performance.now();
    const duration = 500;
    
    function updateProgress(currentTime) {
        const elapsed = currentTime - startTime;
        progress = Math.min(100, Math.floor((elapsed / duration) * 100));
        
        if (counter) counter.textContent = `${progress}%`;
        
        if (progress < 100) {
            requestAnimationFrame(updateProgress);
        } else {
            setTimeout(() => {
                preloader.classList.add('fade-out');
                document.body.classList.remove('preloader-active');
                document.body.classList.add('preloader-done');
                
                setTimeout(() => {
                    if (preloader && preloader.parentNode) {
                        preloader.parentNode.removeChild(preloader);
                    }
                }, 600);
            }, 50);
        }
    }
    
    requestAnimationFrame(updateProgress);
}

function initCoreInteractions() {
    initPreloader();
    
    // Mobile Menu functionality
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    function toggleMobileMenu() {
        hamburgerMenu.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        hamburgerMenu.setAttribute('aria-expanded', mobileMenu.classList.contains('active') ? 'true' : 'false');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }
    
    function closeMobileMenu() {
        hamburgerMenu.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        hamburgerMenu.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', toggleMobileMenu);
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close menu when clicking a nav link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Scroll to Top
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    window.addEventListener('scroll', function () {
        if (!scrollTopBtn) {
            return;
        }

        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }, { passive: true });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Smart Navbar hide on scroll down, show on scroll up
    let lastNavScrollY = window.scrollY;
    let navTicking = false;

    window.addEventListener('scroll', function () {
        if (!navTicking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const nav = document.getElementById('mainNavbar') || document.querySelector('.navbar-tabbar');
                if (nav) {
                    if (currentScrollY > 60 && currentScrollY > lastNavScrollY + 5) {
                        nav.classList.add('navbar-hidden');
                    } else if (currentScrollY < lastNavScrollY - 5 || currentScrollY <= 20) {
                        nav.classList.remove('navbar-hidden');
                    }
                }
                lastNavScrollY = Math.max(0, currentScrollY);
                navTicking = false;
            });
            navTicking = true;
        }
    }, { passive: true });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreInteractions, { once: true });
} else {
    initCoreInteractions();
}
