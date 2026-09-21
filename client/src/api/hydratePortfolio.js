function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function safeUrl(url, fallback = '#') {
  if (!url) return fallback;

  try {
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const parsed = new URL(String(url), baseOrigin);
    const allowedProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);
    return allowedProtocols.has(parsed.protocol) ? parsed.href : fallback;
  } catch {
    return fallback;
  }
}

function setMetaByName(name, content) {
  if (!content) return;

  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setMetaByProperty(property, content) {
  if (!content) return;

  let tag = document.head.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLinkHref(rel, href) {
  if (!href) return;

  let link = document.head.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function setJsonLdById(id, payload) {
  const script = document.getElementById(id);
  if (!script || !payload) return;

  script.textContent = JSON.stringify(payload);
}

function toAbsoluteUrl(url, fallback) {
  const candidate = safeUrl(url, fallback);
  try {
    return new URL(candidate, window.location.origin).href;
  } catch {
    return fallback;
  }
}

function updateSeoMetadata(profile, projects) {
  const fullName = profile?.full_name || 'Roshan Damor';
  const canonicalUrl = profile?.website ? safeUrl(profile.website, 'https://logicbyroshan.in/') : 'https://logicbyroshan.in/';
  const title = profile?.meta_title || `${fullName} | Software Engineer Portfolio`;
  const description = profile?.meta_description || `${fullName} is Software Engineer focused on building production-grade web systems, SaaS platforms, and practical AI-powered applications.`;
  const keywords = profile?.meta_keywords || 'Roshan Damor, Software Engineer, Portfolio, Full Stack, AI Engineer, React, Django, Python';
  const ogImage = toAbsoluteUrl(
    projects?.[0]?.thumbnail || '/static/images/hero.webp',
    'https://logicbyroshan.in/static/images/hero.webp',
  );

  document.title = title;
  setMetaByName('description', description);
  setMetaByName('keywords', keywords);
  setMetaByName('author', fullName);
  setMetaByName('twitter:title', title);
  setMetaByName('twitter:description', description);
  setMetaByName('twitter:image', ogImage);

  setMetaByProperty('og:title', title);
  setMetaByProperty('og:description', description);
  setMetaByProperty('og:url', canonicalUrl);
  setMetaByProperty('og:image', ogImage);
  setMetaByProperty('og:image:alt', `${fullName} portfolio`);

  setLinkHref('canonical', canonicalUrl);

  const sameAs = [profile?.github, profile?.linkedin, profile?.twitter, profile?.youtube, profile?.website]
    .map((url) => safeUrl(url, ''))
    .filter((url) => Boolean(url));

  setJsonLdById('seo-schema-person', {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${canonicalUrl}#person`,
        name: fullName,
        url: canonicalUrl,
        image: ogImage,
        jobTitle: profile?.title || 'Software Engineer',
        description,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: `${fullName} Portfolio`,
        description,
        publisher: { '@id': `${canonicalUrl}#person` },
      },
    ],
  });
}

function formatDateRange(startDate, endDate, currentlyWorking) {
  if (!startDate) return 'Timeline not specified';

  const start = new Date(startDate);
  const startLabel = Number.isNaN(start.getTime())
    ? String(startDate)
    : start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  if (currentlyWorking) {
    return `${startLabel} - Present`;
  }

  if (!endDate) {
    return startLabel;
  }

  const end = new Date(endDate);
  const endLabel = Number.isNaN(end.getTime())
    ? String(endDate)
    : end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return `${startLabel} - ${endLabel}`;
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element && text) {
    element.textContent = text;
  }
}

function normalizeIconClass(rawIcon) {
  if (!rawIcon) return 'fas fa-code';
  const iconStr = String(rawIcon).trim();
  if (iconStr.startsWith('fa-')) {
    return `fas ${iconStr}`;
  }
  if (!iconStr.includes(' ')) {
    return `fas fa-${iconStr}`;
  }
  return iconStr;
}

function getCategoryIcon(categoryName, rawIcon) {
  if (rawIcon && rawIcon !== 'fas fa-folder') {
    return normalizeIconClass(rawIcon);
  }

  const lower = (categoryName || '').toLowerCase();
  if (lower.includes('software') || lower.includes('backend') || lower.includes('core')) {
    return 'fas fa-puzzle-piece';
  }
  if (lower.includes('ai') || lower.includes('data') || lower.includes('ml') || lower.includes('learning') || lower.includes('machine') || lower.includes('intelligence')) {
    return 'fas fa-robot';
  }
  if (lower.includes('app') || lower.includes('frontend') || lower.includes('web') || lower.includes('full')) {
    return 'fas fa-globe';
  }
  if (lower.includes('infra') || lower.includes('devops') || lower.includes('cloud') || lower.includes('system')) {
    return 'fas fa-cloud';
  }
  return 'fas fa-code';
}

function getSkillIcon(skillName = '', rawIcon = '') {
  if (rawIcon && rawIcon !== 'fas fa-code' && rawIcon !== 'fa-code') {
    return normalizeIconClass(rawIcon);
  }

  const s = String(skillName || '').trim().toLowerCase();

  const iconMap = {
    'python': 'fab fa-python',
    'java': 'fab fa-java',
    'c/c++': 'fas fa-code',
    'c++': 'fas fa-code',
    'c': 'fas fa-code',
    'javascript': 'fab fa-js',
    'js': 'fab fa-js',
    'typescript': 'fab fa-js',
    'ts': 'fab fa-js',
    'django': 'fas fa-cubes',
    'fastapi': 'fas fa-bolt',
    'flask': 'fas fa-flask',
    'node.js': 'fab fa-node-js',
    'nodejs': 'fab fa-node-js',
    'node': 'fab fa-node-js',
    'rest apis': 'fas fa-network-wired',
    'rest api': 'fas fa-network-wired',
    'rest': 'fas fa-network-wired',
    'graphql': 'fas fa-diagram-project',
    'system design': 'fas fa-sitemap',
    'git': 'fab fa-git-alt',
    'github': 'fab fa-github',

    // AI & Data
    'llms': 'fas fa-brain',
    'llm': 'fas fa-brain',
    'rag': 'fas fa-database',
    'ai agents': 'fas fa-robot',
    'ai agent': 'fas fa-robot',
    'ai workflows': 'fas fa-diagram-project',
    'ai': 'fas fa-robot',
    'pytorch': 'fas fa-fire',
    'tensorflow': 'fas fa-microchip',
    'scikit-learn': 'fas fa-chart-line',
    'numpy': 'fas fa-calculator',
    'pandas': 'fas fa-table',
    'ml': 'fas fa-network-wired',
    'machine learning': 'fas fa-brain',
    'deep learning': 'fas fa-brain',
    'nlp': 'fas fa-comments',
    'opencv': 'fas fa-eye',

    // Application Dev
    'react': 'fab fa-react',
    'react.js': 'fab fa-react',
    'reactjs': 'fab fa-react',
    'vue': 'fab fa-vuejs',
    'vue.js': 'fab fa-vuejs',
    'vuejs': 'fab fa-vuejs',
    'next.js': 'fab fa-react',
    'nextjs': 'fab fa-react',
    'html/css': 'fab fa-html5',
    'html': 'fab fa-html5',
    'css': 'fab fa-css3-alt',
    'tailwind': 'fas fa-wind',
    'tailwind css': 'fas fa-wind',
    'postgresql': 'fas fa-database',
    'postgres': 'fas fa-database',
    'mysql': 'fas fa-server',
    'mongodb': 'fas fa-leaf',
    'redis': 'fas fa-memory',
    'sqlite': 'fas fa-database',
    'react native': 'fab fa-react',
    'electron': 'fas fa-atom',

    // Infrastructure & Systems
    'docker': 'fab fa-docker',
    'nginx': 'fas fa-server',
    'gunicorn': 'fas fa-gears',
    'linux': 'fab fa-linux',
    'celery': 'fas fa-clock',
    'github actions': 'fab fa-github',
    'ci/cd': 'fas fa-arrows-rotate',
    'deployment': 'fas fa-cloud-arrow-up',
    'background jobs': 'fas fa-tasks',
    'aws': 'fab fa-aws',
    'kubernetes': 'fas fa-dharmachakra',
    'cloud': 'fas fa-cloud'
  };

  if (iconMap[s]) {
    return iconMap[s];
  }

  for (const [key, icon] of Object.entries(iconMap)) {
    if (s.includes(key)) {
      return icon;
    }
  }

  return 'fas fa-code';
}

function updateProfile(profile) {
  if (!profile) return;

  // Hero Section
  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge && profile.hero_badge) {
    heroBadge.textContent = profile.hero_badge;
  }

  const heroHeading = document.querySelector('.hero-heading');
  if (heroHeading) {
    const fullName = profile.full_name || 'Roshan Damor';
    const title = profile.title || 'Software Engineer';
    const titleHtml = escapeHtml(title).replaceAll('\n', '<br>');
    heroHeading.innerHTML = `${escapeHtml(fullName)}<br><span class="text-gradient">${titleHtml}</span>`;
  }

  const heroDescription = document.querySelector('.hero-description');
  if (heroDescription) {
    heroDescription.textContent = profile.hero_description || profile.bio || heroDescription.textContent;
  }

  const heroImage = document.querySelector('.hero-image');
  if (heroImage) {
    const targetHeroImg = profile.hero_image || profile.profile_image;
    if (targetHeroImg) {
      heroImage.src = safeUrl(targetHeroImg);
    }
  }

  // Hero Stats Cards
  const statItems = document.querySelectorAll('.hero-stats .stat-item');
  if (statItems.length >= 3) {
    const statsData = [
      {
        value: profile.hero_stat_1_value || '1,000+',
        label: profile.hero_stat_1_label || 'Production Users',
        icon: profile.hero_stat_1_icon || 'fas fa-users',
      },
      {
        value: profile.hero_stat_2_value || '136K+',
        label: profile.hero_stat_2_label || 'ID Cards Processed',
        icon: profile.hero_stat_2_icon || 'fas fa-id-card',
      },
      {
        value: profile.hero_stat_3_value || '86K+',
        label: profile.hero_stat_3_label || 'Cards Downloaded',
        icon: profile.hero_stat_3_icon || 'fas fa-cloud-download-alt',
      },
    ];

    statItems.forEach((item, idx) => {
      if (statsData[idx]) {
        const numSpan = item.querySelector('.stat-number span');
        const iconEl = item.querySelector('.stat-icon');
        const labelEl = item.querySelector('.stat-label');

        if (numSpan) numSpan.textContent = statsData[idx].value;
        if (iconEl && statsData[idx].icon) iconEl.className = `${statsData[idx].icon} stat-icon`;
        if (labelEl) labelEl.textContent = statsData[idx].label;
      }
    });
  }

  if (profile.bio) {
    setText('.about-description', profile.bio);
  }

  const contactValues = document.querySelectorAll('.contact-value');
  if (contactValues.length >= 3) {
    if (profile.email) contactValues[0].textContent = profile.email;
    if (profile.phone) contactValues[1].textContent = profile.phone;
    if (profile.location) contactValues[2].textContent = profile.location;
  }

  const footerContactValues = document.querySelectorAll('.footer-contact-list li span');
  if (footerContactValues.length >= 3) {
    if (profile.email) footerContactValues[0].textContent = profile.email;
    if (profile.phone) footerContactValues[1].textContent = profile.phone;
    if (profile.location) footerContactValues[2].textContent = profile.location;
  }

  const socials = {
    github: profile.github,
    linkedin: profile.linkedin,
    twitter: profile.twitter,
  };

  document.querySelectorAll('.footer-social-btn').forEach((link) => {
    const label = (link.getAttribute('aria-label') || '').toLowerCase();
    if (label.includes('github') && socials.github) {
      link.href = socials.github;
    }
    if (label.includes('linkedin') && socials.linkedin) {
      link.href = socials.linkedin;
    }
    if ((label.includes('twitter') || label.includes('x')) && socials.twitter) {
      link.href = socials.twitter;
    }
  });
}

function updateSkills(skills = []) {
  const container = document.querySelector('.tech-grid') || document.querySelector('.skills-grid');
  if (!container) return;

  const validSkills = Array.isArray(skills) ? skills.filter(Boolean) : [];
  if (!validSkills.length) {
    return;
  }

  const grouped = validSkills.reduce((acc, skill) => {
    const categoryName = skill.category?.name || 'Technical Skills';
    if (!acc[categoryName]) {
      acc[categoryName] = {
        icon: skill.category?.icon,
        items: [],
      };
    }
    acc[categoryName].items.push(skill);
    return acc;
  }, {});

  container.innerHTML = Object.entries(grouped)
    .map(([categoryName, group]) => {
      const iconClass = getCategoryIcon(categoryName, group.icon);
      const skillCards = group.items
        .map((s) => {
          const sIcon = getSkillIcon(s.name, s.icon);
          return `
            <div class="skill-mini-card">
              <i class="${sIcon} skill-icon"></i>
              <span class="skill-name">${escapeHtml(s.name)}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div class="tech-card">
          <div class="tech-icon-wrapper">
            <i class="${iconClass}"></i>
          </div>
          <h3 class="tech-card-title">${escapeHtml(categoryName)}</h3>
          <div class="skills-chips-grid">${skillCards}</div>
        </div>
      `;
    })
    .join('');
}

const UNIVERSAL_GRADIENTS = [
  'universal-gradient-1',
  'universal-gradient-2',
  'universal-gradient-3',
  'universal-gradient-4',
  'universal-gradient-5',
];

const UNIVERSAL_ICONS = [
  'fa-cogs',
  'fa-plane',
  'fa-tasks',
  'fa-graduation-cap',
  'fa-cubes',
  'fa-code',
];

function resolveStatusDisplay(statusValue) {
  if (!statusValue) {
    return { text: 'Active', cls: 'status-prod' };
  }

  const lower = String(statusValue).toLowerCase();
  if (lower.includes('prod') || lower.includes('active') || lower.includes('completed') || lower.includes('live')) {
    return { text: '🟢 Production', cls: 'status-prod' };
  }
  if (lower.includes('pilot') || lower.includes('testing') || lower.includes('beta')) {
    return { text: '🟡 Pilot Testing', cls: 'status-pilot' };
  }
  if (lower.includes('oss') || lower.includes('open source')) {
    return { text: '🔵 Open Source', cls: 'status-oss' };
  }
  return { text: String(statusValue), cls: 'status-prod' };
}

function updateProjects(projects = []) {
  const slider = document.querySelector('.projects-slider');
  if (!slider) return;

  const validProjects = Array.isArray(projects) ? projects.filter(Boolean) : [];
  if (!validProjects.length) {
    return;
  }

  slider.innerHTML = validProjects
    .map((project, index) => {
      const projectName = project.project_name || project.title;
      const categoryName = project.category?.name || 'Project';

      let techList = project.technologies_list || [];
      if (!techList.length && project.technologies) {
        techList = project.technologies.split(',').map((t) => t.trim()).filter(Boolean);
      }

      const statusInfo = resolveStatusDisplay(project.status);
      const projectSlug = project.slug || encodeURIComponent((projectName || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
      const githubLink = safeUrl(project.github_url);
      const hasGithub = Boolean(githubLink) && githubLink !== '#';

      let buttonsHtml = `<a href="/projects/${projectSlug}" class="btn btn-primary project-btn project-page-link" data-project-slug="${projectSlug}">Case Study</a>`;
      if (hasGithub) {
        buttonsHtml += `<a href="${escapeHtml(githubLink)}" class="github-btn" target="_blank" rel="noopener noreferrer" aria-label="Open project repository"><i class="fab fa-github"></i></a>`;
      } else if (project.live_url) {
        buttonsHtml += `<a href="${escapeHtml(safeUrl(project.live_url))}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">Live Preview</a>`;
      }

      const gradClass = UNIVERSAL_GRADIENTS[index % UNIVERSAL_GRADIENTS.length];
      const iconClass = UNIVERSAL_ICONS[index % UNIVERSAL_ICONS.length];
      const thumbTechPills = techList.slice(0, 5).map((t) => `<span class="universal-thumb-tech-pill">${escapeHtml(t)}</span>`).join('');
      const docHtml = project.documentation || '';

      return `
        <div class="project-card ${index === 0 ? 'active' : ''}" data-index="${index}" data-project-slug="${projectSlug}">
          <div class="project-doc-content" style="display:none;">${docHtml}</div>
          <div class="universal-project-thumb ${gradClass}">
            <div class="universal-thumb-bg-pattern"></div>
            <i class="fas ${iconClass} universal-thumb-watermark"></i>
            <div class="universal-thumb-content">
              <div class="project-meta-row" style="justify-content: center; margin-bottom: 4px;">
                <span class="universal-thumb-tag">${escapeHtml(categoryName)}</span>
                <span class="project-status-badge ${statusInfo.cls}">${escapeHtml(statusInfo.text)}</span>
              </div>
              <h3 class="universal-thumb-title">${escapeHtml(projectName)}</h3>
              <p class="universal-thumb-sub">${escapeHtml(project.description || '')}</p>
              <div class="universal-thumb-tech-row">${thumbTechPills}</div>
              <div class="universal-thumb-buttons">
                ${buttonsHtml}
              </div>
            </div>
            <span class="project-category">${escapeHtml(categoryName)}</span>
          </div>
        </div>
      `;
    })
    .join('');

  if (typeof window !== 'undefined' && typeof window.initProjectsSlider === 'function') {
    window.initProjectsSlider();
  }
}

function updateExperience(experience = []) {
  const timeline = document.querySelector('.roadmap-timeline');
  if (!timeline) return;

  const items = Array.isArray(experience) ? experience.filter(Boolean) : [];
  if (!items.length) return;

  const timelineLine = '<div class="timeline-line"></div>';

  const rows = items
    .map((item, index) => {
      const sideClass = index % 2 === 0 ? 'roadmap-left' : 'roadmap-right';
      const description = item.short_description || item.detailed_description || '';
      const companyHtml = item.company_name
        ? `<div class="roadmap-company"><i class="fas fa-building"></i> ${escapeHtml(item.company_name)}</div>`
        : '';

      return `
        <div class="roadmap-item ${sideClass} animate">
          <div class="roadmap-card">
            <span class="roadmap-date">${escapeHtml(formatDateRange(item.start_date, item.end_date, item.currently_working))}</span>
            <h3 class="roadmap-title">${escapeHtml(item.position)}</h3>
            ${companyHtml}
            <p class="roadmap-description">${escapeHtml(description)}</p>
          </div>
          <div class="roadmap-dot"></div>
        </div>
      `;
    })
    .join('');

  timeline.innerHTML = `${timelineLine}${rows}`;

  if (typeof window !== 'undefined' && typeof window.initRoadmapSection === 'function') {
    window.initRoadmapSection();
  }
}

export function hydratePortfolioDom(data) {
  if (!data) return;
  updateSeoMetadata(data.profile, data.projects || []);
  updateProfile(data.profile);
  updateSkills(data.skills || []);
  updateProjects(data.projects || []);
  updateExperience(data.experience || []);
}

export { updateProjects, updateSkills, updateExperience, updateProfile, getCategoryIcon, getSkillIcon, resolveStatusDisplay };
