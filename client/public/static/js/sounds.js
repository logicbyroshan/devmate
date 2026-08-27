/* =====================================================
   Sound Engine — Background Music & Audio SFX
   Background Music: /portfolio-bgm.mp3 (Looped)
   ===================================================== */
(function () {
    'use strict';

    let ctx = null;
    let bgAudio = null;
    let audioReady = false;
    const BG_VOLUME = 0.08;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isMuted = localStorage.getItem('portfolioMuted') === 'true' || prefersReducedMotion;
    let soundBindingsReady = false;

    /* ── Create / resume AudioContext for SFX ── */
    function getCtx() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    /* ── Init (starts audio engine on first gesture) ── */
    function initAudio() {
        if (!audioReady) {
            audioReady = true;
            getCtx();
        }
        startBgMusic();
    }

    /* ════════════════════════════════════════════════
       BACKGROUND MUSIC — /portfolio-bgm.mp3 (Looped)
       ════════════════════════════════════════════════ */
    function startBgMusic() {
        if (!bgAudio) {
            bgAudio = new Audio('/portfolio-bgm.mp3');
            bgAudio.loop = true;
            bgAudio.volume = BG_VOLUME;
        }
        // Only set volume if not already at the correct level (prevents accumulation)
        if (Math.abs(bgAudio.volume - BG_VOLUME) > 0.001) {
            bgAudio.volume = BG_VOLUME;
        }
        if (!isMuted && bgAudio.paused) {
            bgAudio.play().catch(function (err) {
                console.log('Background music waiting for user interaction', err);
            });
        } else if (isMuted) {
            bgAudio.pause();
        }
        // Guard: ensure volume never drifts above BG_VOLUME
        bgAudio.addEventListener('volumechange', function () {
            if (bgAudio.volume > BG_VOLUME + 0.001) {
                bgAudio.volume = BG_VOLUME;
            }
        }, { once: false });
    }


    /* ════════════════════════════════════════════════
       SFX — CLICK  (soft high-freq tick)
       ════════════════════════════════════════════════ */
    function playClick() {
        if (isMuted) return;
        const c = getCtx();
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, c.currentTime + 0.05);
        g.gain.setValueAtTime(0.07, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.07);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.08);
    }

    /* ════════════════════════════════════════════════
       SFX — SLIDE  (filtered noise whoosh)
       direction: 1 = next (high→low), -1 = prev (low→high)
       ════════════════════════════════════════════════ */
    function playSlide(direction) {
        if (isMuted) return;
        const c = getCtx();
        const dur = 0.2;
        const bufLen = Math.floor(c.sampleRate * dur);
        const buf = c.createBuffer(1, bufLen, c.sampleRate);
        const data = buf.getChannelData(0);

        // White noise with natural amplitude envelope
        for (let i = 0; i < bufLen; i++) {
            const env = Math.pow(1 - i / bufLen, 1.8);
            data[i] = (Math.random() * 2 - 1) * env;
        }

        const src = c.createBufferSource();
        src.buffer = buf;

        const filter = c.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 2.5;

        if (direction >= 0) {
            filter.frequency.setValueAtTime(1400, c.currentTime);
            filter.frequency.exponentialRampToValueAtTime(180, c.currentTime + dur);
        } else {
            filter.frequency.setValueAtTime(180, c.currentTime);
            filter.frequency.exponentialRampToValueAtTime(1400, c.currentTime + dur);
        }

        const g = c.createGain();
        g.gain.setValueAtTime(0.14, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);

        src.connect(filter);
        filter.connect(g);
        g.connect(c.destination);
        src.start();
    }

    /* ════════════════════════════════════════════════
       SFX — POP  (FAQ accordion open / close)
       opening = true  → ascending  chirp
       opening = false → descending chirp
       ════════════════════════════════════════════════ */
    function playPop(opening) {
        if (isMuted) return;
        const c = getCtx();
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sine';

        if (opening) {
            osc.frequency.setValueAtTime(320, c.currentTime);
            osc.frequency.exponentialRampToValueAtTime(680, c.currentTime + 0.09);
        } else {
            osc.frequency.setValueAtTime(680, c.currentTime);
            osc.frequency.exponentialRampToValueAtTime(280, c.currentTime + 0.09);
        }

        g.gain.setValueAtTime(0.06, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.1);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.12);
    }

    /* ════════════════════════════════════════════════
       SFX — HOVER TICK  (very faint, optional)
       ════════════════════════════════════════════════ */
    function playHover() {
        if (isMuted) return;
        const c = getCtx();
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = 1400;
        g.gain.setValueAtTime(0.025, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.04);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.045);
    }

    /* ════════════════════════════════════════════════
       WIRE UP ALL INTERACTIONS
       ════════════════════════════════════════════════ */
    function wireSoundInteractions() {
        if (soundBindingsReady) return;
        soundBindingsReady = true;

        const soundToggleBtn = document.getElementById('soundToggleBtn');

        function updateSoundToggleUI() {
            if (!soundToggleBtn) return;
            soundToggleBtn.classList.toggle('is-muted', isMuted);
            soundToggleBtn.setAttribute('aria-pressed', (!isMuted).toString());
            soundToggleBtn.innerHTML = isMuted
                ? '<i class="fas fa-volume-mute"></i>'
                : '<i class="fas fa-volume-up"></i>';
        }

        function applyMuteState() {
            if (bgAudio) {
                if (isMuted) {
                    bgAudio.pause();
                } else {
                    bgAudio.volume = BG_VOLUME;
                    bgAudio.play().catch(function (err) {
                        console.log('Play on unmute deferred', err);
                    });
                }
            } else if (!isMuted) {
                startBgMusic();
            }
            localStorage.setItem('portfolioMuted', String(isMuted));
            updateSoundToggleUI();
        }

        if (soundToggleBtn) {
            soundToggleBtn.addEventListener('click', () => {
                isMuted = !isMuted;

                if (!isMuted && !audioReady) {
                    initAudio();
                }

                applyMuteState();
            });
        }

        // Global first-gesture listener to auto-start music on any user action
        const startOnGesture = function () {
            if (!isMuted) {
                initAudio();
            }
        };
        ['click', 'pointerdown', 'keydown', 'touchstart'].forEach(evt => {
            window.addEventListener(evt, startOnGesture, { capture: true, once: true });
        });

        updateSoundToggleUI();

        // ── Event delegation for clicks (supports dynamically hydrated elements) ──
        const clickSelector = '.btn, .nav-link, .mobile-nav-link, .faq-tab, .scroll-top-btn, .hamburger-menu, .github-btn, .mobile-nav-actions .btn, .modal-close, .modal-expand-btn, .chat-send-btn, .project-btn, .cs-link-pill, .download-option-card';
        
        document.addEventListener('click', (e) => {
            const faqQ = e.target.closest('.faq-question');
            if (faqQ) {
                initAudio();
                const opening = !faqQ.closest('.faq-item')?.classList.contains('active');
                playPop(opening);
                return;
            }

            const prevBtn = e.target.closest('.prev-btn');
            if (prevBtn) {
                initAudio();
                playSlide(-1);
                return;
            }

            const nextBtn = e.target.closest('.next-btn');
            if (nextBtn) {
                initAudio();
                playSlide(1);
                return;
            }

            const btn = e.target.closest(clickSelector);
            if (btn) {
                initAudio();
                playClick();
            }
        }, true);

        // ── Hover tick on nav links (very subtle) ──
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('.nav-link, .mobile-nav-link');
            if (link && audioReady) {
                playHover();
            }
        });

        if (isMuted) {
            applyMuteState();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireSoundInteractions, { once: true });
    } else {
        wireSoundInteractions();
    }

    // Expose for debugging
    window._SoundEngine = { initAudio, playClick, playSlide, playPop };

})();
