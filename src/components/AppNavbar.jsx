import React, { useState, useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';

export default function AppNavbar({ currentRoute, onNavigate }) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useLenis((lenis) => {
    if (!lenis) return;
    const scroll = typeof lenis.scroll === 'number' ? lenis.scroll : window.scrollY;
    const direction = lenis.direction ?? 0;
    if (scroll > 60 && direction === 1) {
      setHidden(true);
    } else if (direction === -1 || scroll <= 20) {
      setHidden(false);
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 60 && currentScrollY > lastScrollY.current + 5) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current - 5 || currentScrollY <= 20) {
        setHidden(false);
      }
      lastScrollY.current = Math.max(0, currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (e, target, anchor) => {
    e.preventDefault();
    onNavigate(target, anchor);
  };

  const [activeSection, setActiveSection] = useState('home');

  const isAboutActive = currentRoute === 'about' || (typeof currentRoute === 'object' && currentRoute?.name === 'about');
  const isExperienceActive = currentRoute === 'experience' || (typeof currentRoute === 'object' && currentRoute?.name === 'experience');

  useEffect(() => {
    if (isAboutActive || isExperienceActive) return;

    const handleScrollSpy = () => {
      const scrollY = window.scrollY;
      const skillsEl = document.getElementById('skills');
      const projectsEl = document.getElementById('projects');
      const roadmapEl = document.getElementById('roadmap') || document.getElementById('experience');

      const skillsTop = skillsEl ? skillsEl.offsetTop - 240 : 99999;
      const projectsTop = projectsEl ? projectsEl.offsetTop - 240 : 99999;
      const roadmapTop = roadmapEl ? roadmapEl.offsetTop - 240 : 99999;

      if (scrollY >= roadmapTop && roadmapEl) {
        setActiveSection('experience');
      } else if (scrollY >= projectsTop && projectsEl) {
        setActiveSection('projects');
      } else if (scrollY >= skillsTop && skillsEl) {
        setActiveSection('skills');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [isAboutActive, isExperienceActive]);

  const isHomeActive = !isAboutActive && !isExperienceActive && activeSection === 'home';
  const isSkillsActive = !isAboutActive && !isExperienceActive && activeSection === 'skills';
  const isProjectsActive = !isAboutActive && !isExperienceActive && activeSection === 'projects';
  const isExperienceTabActive = isExperienceActive || (!isAboutActive && activeSection === 'experience');

  return (
    <>
      <div className={`navbar-dock-backdrop ${hidden ? 'navbar-hidden' : ''}`} id="navbarDockBackdrop" aria-hidden="true" />
      <header className={`navbar navbar-tabbar ${hidden ? 'navbar-hidden' : ''}`} id="mainNavbar">
        <nav className="nav-tabbar-menu" aria-label="Main Navigation">
        <a
          href="#home"
          className={`nav-tab-link ${isHomeActive ? 'active' : ''}`}
          onClick={(e) => handleNav(e, 'home', 'home')}
        >
          <span>Home</span>
        </a>
        <a
          href="#skills"
          className={`nav-tab-link ${isSkillsActive ? 'active' : ''}`}
          onClick={(e) => handleNav(e, 'home', 'skills')}
        >
          <span>Skills</span>
        </a>
        <a
          href="#projects"
          className={`nav-tab-link ${isProjectsActive ? 'active' : ''}`}
          onClick={(e) => handleNav(e, 'home', 'projects')}
        >
          <span>Projects</span>
        </a>
        <a
          href="#experience"
          className={`nav-tab-link ${isExperienceTabActive ? 'active' : ''}`}
          onClick={(e) => handleNav(e, 'home', 'experience')}
        >
          <span>Experience</span>
        </a>
        <a
          href="/about"
          className={`nav-tab-link ${isAboutActive ? 'active' : ''}`}
          onClick={(e) => handleNav(e, 'about')}
        >
          <span>About</span>
        </a>
      </nav>
    </header>
  </>
);
}
