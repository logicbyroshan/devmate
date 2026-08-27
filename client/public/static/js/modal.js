/* ══════════════════════════════════════════
   MODAL — Rexi AI Assistant Chat Modal
   ══════════════════════════════════════════ */

(function () {
    'use strict';

    let rexiInitialized = false;

    // ── Open / Close ──────────────────────────────────────────────────────────

    function openModal(id) {
        const overlay = document.getElementById(id);
        if (!overlay) return;
        
        overlay.setAttribute('data-lenis-prevent', 'true');
        const modalBox = overlay.querySelector('.modal-box-rexi, .modal-box');
        if (modalBox) {
            modalBox.setAttribute('data-lenis-prevent', 'true');
        }

        document.body.classList.add('modal-open');
        document.documentElement.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        overlay.classList.add('modal-visible');
        if (id === 'modal-rexi') {
            initRexi();
        }
        overlay.querySelector('.modal-close')?.focus();
    }

    function closeModal(overlay) {
        if (!overlay) return;
        overlay.classList.remove('modal-visible');
        const modalBox = overlay.querySelector('.modal-box-rexi, .modal-box');
        if (modalBox) {
            modalBox.classList.remove('modal-box-fullscreen');
            modalBox.scrollTop = 0;
            const expandBtn = modalBox.querySelector('.modal-expand-btn');
            if (expandBtn) {
                expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
                expandBtn.setAttribute('title', 'Full Page View');
            }
        }
        overlay.classList.remove('modal-overlay-fullscreen');

        if (!document.querySelector('.modal-overlay.modal-visible')) {
            document.body.classList.remove('modal-open');
            document.documentElement.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
    }

    // Expose openModal and closeModal globally
    window.openModal = openModal;
    window.closeModal = closeModal;

    // Prevent background wheel scrolling when modal is open
    document.addEventListener('wheel', function (e) {
        const open = document.querySelector('.modal-overlay.modal-visible');
        if (!open) return;
        const modalBox = e.target.closest('.modal-box-rexi, .modal-box');
        if (!modalBox) {
            e.preventDefault();
        }
    }, { passive: false });

    // Prevent background touchmove scrolling when modal is open
    document.addEventListener('touchmove', function (e) {
        const open = document.querySelector('.modal-overlay.modal-visible');
        if (!open) return;
        const modalBox = e.target.closest('.modal-box-rexi, .modal-box');
        if (!modalBox) {
            e.preventDefault();
        }
    }, { passive: false });

    // ── Wire trigger buttons & Window controls ───────────────────────────────

    document.addEventListener('click', function (e) {
        // Fullscreen Toggle button
        const expandBtn = e.target.closest('.modal-expand-btn, #rexi-fullscreen-btn');
        if (expandBtn) {
            e.preventDefault();
            e.stopPropagation();
            const modalBox = expandBtn.closest('.modal-box-rexi, .modal-box');
            if (modalBox) {
                modalBox.classList.toggle('modal-box-fullscreen');
                const isFull = modalBox.classList.contains('modal-box-fullscreen');
                const overlay = modalBox.closest('.modal-overlay');
                if (overlay) {
                    overlay.classList.toggle('modal-overlay-fullscreen', isFull);
                    if (!isFull) modalBox.scrollTop = 0;
                }
                expandBtn.innerHTML = isFull ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
                expandBtn.setAttribute('title', isFull ? 'Restore Normal Size' : 'Full Page View');
            }
            return;
        }

        // Close button inside modal
        const closeBtn = e.target.closest('.modal-close');
        if (closeBtn) {
            e.preventDefault();
            e.stopPropagation();
            const overlay = closeBtn.closest('.modal-overlay');
            if (overlay) closeModal(overlay);
            return;
        }

        // Generic data-modal trigger — works for modal-rexi, modal-resume, modal-video-resume, etc.
        const trigger = e.target.closest('[data-modal]');
        if (trigger) {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            if (modalId) openModal(modalId);
            return;
        }

        // Click on backdrop (outside card)
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target);
        }
    });

    // Escape key closes topmost visible modal
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        const open = document.querySelector('.modal-overlay.modal-visible');
        if (open) closeModal(open);
    });

    // ── Rexi Chat ─────────────────────────────────────────────────────────────

    const REXI_KNOWLEDGE = {
        name:       'Roshan Damor',
        role:       'Software Engineer & AI Full Stack Developer',
        location:   'India',
        tech:       'Python, Django, React, PostgreSQL, Redis, Celery, REST APIs, Electron, Docker, Nginx, Linux, Tailwind CSS',
        dsa:        '1300+ DSA problems solved across LeetCode, CodeForces and HackerRank',
        projects:   'CardFlow (Enterprise ID Card Management SaaS in production for 1000+ users), VidyaMaxx (AI-First School Management Platform in pilot), PrintNexx (Internal image processing tool), EazeTrip (Tour operations platform), TaskFlixx (AI task manager), PrepSarthi (AI exam prep)',
        experience: 'Software Engineer at Adarsh ID Cards (Dec 2025 - Present) building CardFlow SaaS; previously Graphic Designer Intern at Miracle Organisation (Apr - May 2025)',
        contact:    'mail@logicbyroshan.in | Available via LinkedIn or the contact form on this site',
        education:  'B.Tech Computer Science with specialization in AI & Machine Learning',
        hobbies:    'System design, open-source building, competitive programming, exploring LLM architectures',
    };

    const REXI_RESPONSES = [
        {
            pattern: /who are you|who r u|what are you|your name|who created you|who made you|about you|about yourself/i,
            reply:   `I'm **Rexi** 🐉 — the official dragon mascot & AI Assistant for Roshan Damor's portfolio, powered by **Qwen3-0.6B**!\n\nI can answer questions about Roshan's skills, projects, work experience, DSA statistics, or how to contact him. What would you like to know?`,
        },
        {
            pattern: /who is roshan|about roshan|who is he|roshan damor|who is roshan damor|tell me about roshan/i,
            reply:   `Roshan Damor is a **${REXI_KNOWLEDGE.role}** based in ${REXI_KNOWLEDGE.location}. A builder at heart with a love for clean code, scalable architecture, and hard problems! 🚀`,
        },
        {
            pattern: /role|job|work|does|what/i,
            reply:   `Roshan is a **${REXI_KNOWLEDGE.role}** — building AI-powered SaaS platforms, high-throughput web systems, and modern cloud applications. 💻`,
        },
        {
            pattern: /tech|stack|skill|language|framework/i,
            reply:   `Roshan's core stack: **${REXI_KNOWLEDGE.tech}**. He picks the right tool for every system requirement. 🛠️`,
        },
        {
            pattern: /dsa|algorithm|leetcode|problem|competitive/i,
            reply:   `${REXI_KNOWLEDGE.dsa}. Strong in dynamic programming, graphs, data structures, and system design. 🧠`,
        },
        {
            pattern: /project/i,
            reply:   `He has built: ${REXI_KNOWLEDGE.projects}. Check the dedicated project pages for full engineering breakdowns! 🔭`,
        },
        {
            pattern: /experience|intern|work history/i,
            reply:   `${REXI_KNOWLEDGE.experience}. Check the Experience page for detailed architectural contributions! ☁️`,
        },
        {
            pattern: /contact|reach|email|hire/i,
            reply:   `${REXI_KNOWLEDGE.contact}. He's open to exciting engineering opportunities! 📩`,
        },
        {
            pattern: /education|college|degree|study/i,
            reply:   `${REXI_KNOWLEDGE.education}. Always learning, always building. 🎓`,
        },
        {
            pattern: /hobby|interest|free time|passion/i,
            reply:   `${REXI_KNOWLEDGE.hobbies}. 🎮`,
        },
        {
            pattern: /location|where|city/i,
            reply:   `Based in ${REXI_KNOWLEDGE.location}. Open to remote and on-site opportunities worldwide. 🌍`,
        },
        {
            pattern: /hello|hi|hey|howdy|greet/i,
            reply:   `Hey there! 👋 I'm Rexi. Ask me anything about Roshan — his skills, projects, experience, or how to reach him!`,
        },
        {
            pattern: /thanks|thank you|thx/i,
            reply:   `You're welcome! 😊 Anything else you'd like to know?`,
        },
    ];

    function getRexiReply(text) {
        for (const entry of REXI_RESPONSES) {
            if (entry.pattern.test(text)) return entry.reply;
        }
        return `Hmm, I'm not sure about that one. Try asking about Roshan's skills, projects, experience, tech stack, or how to contact him! 🤔`;
    }

    function formatMarkdown(text) {
        if (!text) return '';
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        return html;
    }

    function appendMessage(container, text, isUser) {
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-msg ' + (isUser ? 'chat-msg-user' : 'chat-msg-bot');

        const avatarEl = document.createElement('div');
        avatarEl.className = 'chat-avatar';
        avatarEl.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-dragon"></i>';

        const bubbleEl = document.createElement('div');
        bubbleEl.className = 'chat-bubble';
        if (isUser) {
            bubbleEl.textContent = text;
        } else {
            bubbleEl.innerHTML = formatMarkdown(text);
        }

        if (isUser) {
            msgEl.appendChild(bubbleEl);
            msgEl.appendChild(avatarEl);
        } else {
            msgEl.appendChild(avatarEl);
            msgEl.appendChild(bubbleEl);
        }

        container.appendChild(msgEl);
        container.scrollTop = container.scrollHeight;
        return msgEl;
    }

    function showTyping(container) {
        const typingEl = document.createElement('div');
        typingEl.className = 'chat-msg chat-msg-bot chat-typing';

        const avatarEl = document.createElement('div');
        avatarEl.className = 'chat-avatar';
        avatarEl.innerHTML = '<i class="fas fa-dragon"></i>';

        const bubbleEl = document.createElement('div');
        bubbleEl.className = 'chat-bubble';
        bubbleEl.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

        typingEl.appendChild(avatarEl);
        typingEl.appendChild(bubbleEl);
        container.appendChild(typingEl);
        container.scrollTop = container.scrollHeight;
        return typingEl;
    }

    function initRexi() {
        if (rexiInitialized) return;

        const input      = document.getElementById('rexi-input');
        const sendBtn    = document.getElementById('rexi-send');
        const messages   = document.getElementById('rexi-messages');
        if (!input || !sendBtn || !messages) return;

        rexiInitialized = true;

        async function sendMessage() {
            const text = input.value.trim();
            if (!text) return;

            input.value = '';
            sendBtn.disabled = true;

            appendMessage(messages, text, true);

            const typingEl = showTyping(messages);
            const startTime = Date.now();

            try {
                const apiBase = window.PORTFOLIO_CONFIG?.API_BASE_URL || '/api';
                const response = await fetch(`${apiBase}/rexi/chat/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text }),
                });

                const elapsed = Date.now() - startTime;
                const minDelay = 1200 + Math.random() * 500;
                if (elapsed < minDelay) {
                    await new Promise(r => setTimeout(r, minDelay - elapsed));
                }

                if (response.ok) {
                    const data = await response.json();
                    typingEl.remove();
                    appendMessage(messages, data.reply || getRexiReply(text), false);
                } else {
                    typingEl.remove();
                    appendMessage(messages, getRexiReply(text), false);
                }
            } catch {
                typingEl.remove();
                appendMessage(messages, getRexiReply(text), false);
            } finally {
                sendBtn.disabled = false;
                input.focus();
            }
        }

        sendBtn.addEventListener('click', sendMessage);

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}());
