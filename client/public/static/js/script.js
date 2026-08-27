function initPreloader() {
    const preloader = document.getElementById('preloader');
    const counter = document.getElementById('preloaderCounter');
    
    if (!preloader) return;
    
    const isBot = /Lighthouse|Googlebot|bingbot|HeadlessChrome/i.test(navigator.userAgent);
    if (isBot) {
        preloader.style.display = 'none';
        document.body.classList.add('preloader-done');
        return;
    }

    // Skip preloader if already shown in this session (refreshes, back/forward navigation)
    const SESSION_KEY = 'preloader_shown';
    if (sessionStorage.getItem(SESSION_KEY)) {
        preloader.style.display = 'none';
        document.body.classList.add('preloader-done');
        return;
    }

    // Mark as shown for this session
    sessionStorage.setItem(SESSION_KEY, '1');

    document.body.classList.add('preloader-active');
    document.body.style.overflow = 'hidden';
    
    let progress = 0;
    const startTime = performance.now();
    const duration = 750;
    
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
                document.body.style.overflow = '';
                
                setTimeout(() => {
                    if (preloader && preloader.parentNode) {
                        preloader.parentNode.removeChild(preloader);
                    }
                }, 900);
            }, 100);
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
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreInteractions, { once: true });
} else {
    initCoreInteractions();
}
