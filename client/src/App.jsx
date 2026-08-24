import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLenis } from 'lenis/react';
import { fetchPortfolioData } from './api/portfolioApi';
import { hydratePortfolioDom } from './api/hydratePortfolio';
import defaultPortfolioHtml from './portfolio-body.html?raw';

import ProjectDetailPage from './pages/ProjectDetailPage';
import AboutPage from './pages/AboutPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ExperiencePage from './pages/ExperiencePage';
import RexiModal from './components/RexiModal';
import AppNavbar from './components/AppNavbar';
import SiteFooter from './components/SiteFooter';

const CORE_LEGACY_SCRIPTS = [
  '/static/js/script.js',
  '/static/js/modal.js',
];

const DEFERRED_LEGACY_SCRIPTS = [
  '/static/js/sounds.js',
  '/static/js/faq.js',
  '/static/js/projects.js',
  '/static/js/contact.js',
  '/static/js/technology.js',
  '/static/js/blog.js',
  '/static/js/about.js',
  '/static/js/roadmap.js',
];

const DEFERRED_SCRIPT_GAP_MS = 50;
const DEFERRED_FALLBACK_DELAY_MS = 10000;

function parseCurrentRoute() {
  const pathname = window.location.pathname || '/';
  const hash = window.location.hash || '';

  // Clean /home, /home/, /index.html, #home, #/ to clean root '/'
  if (pathname === '/home' || pathname === '/home/' || pathname === '/index.html') {
    window.history.replaceState(null, '', '/');
    return { name: 'home' };
  }
  if (hash === '#home' || hash === '#/' || hash === '#' || hash === '#home/' || hash.startsWith('#home')) {
    window.history.replaceState(null, '', '/');
    return { name: 'home' };
  }

  // Clean up legacy #/ hash URLs by migrating to clean pathname
  if (hash.startsWith('#/projects/')) {
    const slug = hash.replace('#/projects/', '').split('?')[0].split('/')[0];
    const cleanSlug = decodeURIComponent(slug);
    window.history.replaceState(null, '', `/projects/${cleanSlug}`);
    return { name: 'project-detail', slug: cleanSlug };
  }
  if (hash.startsWith('#/blog/')) {
    const slug = hash.replace('#/blog/', '').split('?')[0].split('/')[0];
    const cleanSlug = decodeURIComponent(slug);
    window.history.replaceState(null, '', `/blog/${cleanSlug}`);
    return { name: 'blog-detail', slug: cleanSlug };
  }
  if (hash === '#/about' || hash.startsWith('#/about?')) {
    window.history.replaceState(null, '', '/about');
    return { name: 'about' };
  }
  if (hash === '#/experience' || hash.startsWith('#/experience?')) {
    window.history.replaceState(null, '', '/experience');
    return { name: 'experience' };
  }

  // Parse clean pathnames
  if (pathname.startsWith('/projects/')) {
    const slug = pathname.replace('/projects/', '').split('?')[0].split('/')[0];
    if (slug) {
      return { name: 'project-detail', slug: decodeURIComponent(slug) };
    }
    window.history.replaceState(null, '', '/');
    return { name: 'home' };
  }
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '').split('?')[0].split('/')[0];
    if (slug) {
      return { name: 'blog-detail', slug: decodeURIComponent(slug) };
    }
    window.history.replaceState(null, '', '/');
    return { name: 'home' };
  }
  if (pathname === '/about' || pathname.startsWith('/about/')) {
    return { name: 'about' };
  }
  if (pathname === '/experience' || pathname.startsWith('/experience/')) {
    return { name: 'experience' };
  }

  return { name: 'home' };
}

function App() {
  const [route, setRoute] = useState(parseCurrentRoute);
  const markup = defaultPortfolioHtml || '';
  const lenis = useLenis();

  // Synchronize route changes on popstate or hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(parseCurrentRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Ensure scroll is immediately reset to 0,0 on EVERY route change
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [route.name, route.slug, lenis]);

  const navigate = useCallback((targetRoute, param) => {
    if (targetRoute === 'home') {
      window.history.pushState(null, '', '/');
      setRoute({ name: 'home' });

      if (param && param !== 'home') {
        setTimeout(() => {
          const el = document.getElementById(param);
          if (el) {
            if (lenis) {
              lenis.scrollTo(el, { duration: 1.2 });
            } else {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }, 80);
      } else {
        if (lenis) lenis.scrollTo(0, { immediate: true });
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    } else if (targetRoute === 'about') {
      window.history.pushState(null, '', '/about');
      setRoute({ name: 'about' });
    } else if (targetRoute === 'experience') {
      window.history.pushState(null, '', '/experience');
      setRoute({ name: 'experience' });
    } else if (targetRoute === 'project-detail') {
      const slug = encodeURIComponent((param || 'cardflow').toLowerCase().replace(/[^a-z0-9]/g, ''));
      window.history.pushState(null, '', `/projects/${slug}`);
      setRoute({ name: 'project-detail', slug });
    } else if (targetRoute === 'blog-detail') {
      const slug = param || 'understanding-microservices-architecture';
      window.history.pushState(null, '', `/blog/${slug}`);
      setRoute({ name: 'blog-detail', slug });
    }
  }, [lenis]);

  // Intercept click on links requesting dedicated routes
  useEffect(() => {
    const handleClick = (e) => {
      // 1. Home / Brand links
      const homeLink = e.target.closest('a[href="/"], .brand, a[href="#home"], a[href="#/"]');
      if (homeLink) {
        e.preventDefault();
        navigate('home');
        return;
      }

      // 2. Project detail links
      const projectLink = e.target.closest('.project-page-link, [data-project-slug], a[href^="/projects/"], a[href^="#/projects/"]');
      if (projectLink) {
        e.preventDefault();
        const rawHref = projectLink.getAttribute('href') || '';
        const slug = projectLink.dataset.projectSlug || rawHref.replace('/projects/', '').replace('#/projects/', '').split('?')[0].split('#')[0];
        if (slug) navigate('project-detail', slug);
        return;
      }

      // 3. Blog detail links
      const blogCard = e.target.closest('.blog-card, [data-blog-slug], a[href^="/blog/"], a[href^="#/blog/"]');
      if (blogCard) {
        e.preventDefault();
        const rawHref = blogCard.getAttribute('href') || '';
        const slug = blogCard.dataset.blogSlug || rawHref.replace('/blog/', '').replace('#/blog/', '').split('?')[0].split('#')[0];
        if (slug) navigate('blog-detail', slug);
        return;
      }

      // 4. About page links
      const aboutLink = e.target.closest('[data-route="about"], a[href="/about"], a[href="#/about"]');
      if (aboutLink) {
        e.preventDefault();
        navigate('about');
        return;
      }

      // 5. Experience links
      const expLink = e.target.closest('[data-route="experience"], a[href="/experience"], a[href="#/experience"]');
      if (expLink) {
        e.preventDefault();
        navigate('experience');
        return;
      }

      // 6. In-page section anchor links (#skills, #projects, #contact, etc.)
      const anchorLink = e.target.closest('a[href^="#"]');
      if (anchorLink) {
        const hashTarget = anchorLink.getAttribute('href').replace('#', '');
        if (hashTarget && hashTarget !== '/' && !hashTarget.startsWith('/')) {
          e.preventDefault();
          if (route.name !== 'home') {
            navigate('home', hashTarget);
          } else {
            const el = document.getElementById(hashTarget);
            if (el) {
              if (lenis) {
                lenis.scrollTo(el, { duration: 1.2 });
              } else {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }
          return;
        }
      }

      // 7. Wire SFX click for React-page buttons (sounds.js only loads on home)
      const sfxTarget = e.target.closest('.btn, .nav-link, .mobile-nav-link, .doc-ctrl-btn, .blog-sb-link, .blog-sb-share-btn');
      if (sfxTarget && window._SoundEngine) {
        window._SoundEngine.initAudio();
        window._SoundEngine.playClick();
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [navigate, route.name, lenis]);

  // Load and hydrate legacy scripts on Home view
  useEffect(() => {
    if (route.name !== 'home' || !markup) return undefined;

    const appendedScripts = [];
    let cancelled = false;
    let cancelDeferredLoad = null;
    let removeDeferredTriggers = null;
    let deferredLoaded = false;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-legacy-src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.setAttribute('data-legacy-src', src);
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
        appendedScripts.push(script);
      });

    const loadScriptsSequentially = async (scripts) => {
      for (const src of scripts) {
        await loadScript(src);
      }
    };

    const pause = (ms) =>
      new Promise((resolve) => {
        window.setTimeout(resolve, ms);
      });

    const scheduleDeferred = (callback) => {
      let cancelIdleOrTimeout = null;
      let onLoad = null;

      const run = () => {
        if (cancelled || deferredLoaded) {
          return;
        }

        if ('requestIdleCallback' in window) {
          const id = window.requestIdleCallback(() => {
            void callback();
          }, { timeout: 3500 });
          cancelIdleOrTimeout = () => window.cancelIdleCallback(id);
          return;
        }

        const id = window.setTimeout(() => {
          void callback();
        }, 1200);
        cancelIdleOrTimeout = () => window.clearTimeout(id);
      };

      if (document.readyState === 'complete') {
        run();
      } else {
        onLoad = () => {
          run();
        };
        window.addEventListener('load', onLoad, { once: true });
      }

      const fallbackId = window.setTimeout(() => {
        void callback();
      }, DEFERRED_FALLBACK_DELAY_MS);

      return () => {
        if (onLoad) {
          window.removeEventListener('load', onLoad);
        }
        window.clearTimeout(fallbackId);
        if (cancelIdleOrTimeout) {
          cancelIdleOrTimeout();
        }
      };
    };

    const loadDeferredScripts = async () => {
      if (cancelled || deferredLoaded) {
        return;
      }

      deferredLoaded = true;
      if (removeDeferredTriggers) {
        removeDeferredTriggers();
        removeDeferredTriggers = null;
      }

      for (const src of DEFERRED_LEGACY_SCRIPTS) {
        if (cancelled) {
          return;
        }

        try {
          await loadScript(src);
        } catch {
          // Keep rendering the page even if a deferred script fails to load.
        }

        await pause(DEFERRED_SCRIPT_GAP_MS);
      }
    };

    const bindDeferredTriggers = () => {
      const triggerConfigs = [
        { target: window, type: 'pointerdown', options: { once: true, passive: true } },
        { target: window, type: 'touchstart', options: { once: true, passive: true } },
        { target: window, type: 'scroll', options: { once: true, passive: true } },
        { target: window, type: 'keydown', options: { once: true } },
      ];

      const onTrigger = () => {
        void loadDeferredScripts();
      };

      triggerConfigs.forEach(({ target, type, options }) => {
        target.addEventListener(type, onTrigger, options);
      });

      return () => {
        triggerConfigs.forEach(({ target, type, options }) => {
          target.removeEventListener(type, onTrigger, options);
        });
      };
    };

    const initializeLegacyScripts = async () => {
      try {
        const apiData = await fetchPortfolioData();
        if (!cancelled) {
          hydratePortfolioDom(apiData);
        }
      } catch {
        // Keep static fallback content if API is not reachable.
      }

      await loadScriptsSequentially(CORE_LEGACY_SCRIPTS);

      if (cancelled) {
        return;
      }

      removeDeferredTriggers = bindDeferredTriggers();
      cancelDeferredLoad = scheduleDeferred(loadDeferredScripts);
    };

    initializeLegacyScripts().catch(() => {
      // Keep rendering the page even if a non-critical legacy script fails.
    });

    return () => {
      cancelled = true;
      if (cancelDeferredLoad) {
        cancelDeferredLoad();
      }
      if (removeDeferredTriggers) {
        removeDeferredTriggers();
      }
      appendedScripts.forEach((script) => script.remove());
    };
  }, [route.name, markup]);

  const content = useMemo(() => ({ __html: markup }), [markup]);

  return (
    <>
      <RexiModal />
      {route.name === 'project-detail' && (
        <>
          <AppNavbar currentRoute={route} onNavigate={navigate} />
          <ProjectDetailPage slug={route.slug} onNavigate={navigate} />
          <SiteFooter onNavigate={navigate} />
        </>
      )}
      {route.name === 'blog-detail' && (
        <>
          <AppNavbar currentRoute={route} onNavigate={navigate} />
          <BlogDetailPage slug={route.slug} onNavigate={navigate} />
          <SiteFooter onNavigate={navigate} />
        </>
      )}
      {route.name === 'experience' && (
        <>
          <AppNavbar currentRoute={route} onNavigate={navigate} />
          <ExperiencePage onNavigate={navigate} />
          <SiteFooter onNavigate={navigate} />
        </>
      )}
      {route.name === 'about' && (
        <>
          <AppNavbar currentRoute={route} onNavigate={navigate} />
          <AboutPage onNavigate={navigate} />
          <SiteFooter onNavigate={navigate} />
        </>
      )}
      {route.name === 'home' && <div dangerouslySetInnerHTML={content} />}
    </>
  );
}

export default App;
