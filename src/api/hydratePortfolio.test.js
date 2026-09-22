import { describe, expect, it } from 'vitest';
import { safeUrl, getCategoryIcon, getSkillIcon, resolveStatusDisplay } from './hydratePortfolio';

describe('safeUrl', () => {
  it('allows http and https urls', () => {
    expect(safeUrl('https://example.com/docs')).toBe('https://example.com/docs');
    expect(safeUrl('http://example.com')).toBe('http://example.com/');
  });

  it('blocks unsafe protocols', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('#');
    expect(safeUrl('data:text/html,hello')).toBe('#');
  });

  it('returns fallback for invalid input', () => {
    expect(safeUrl('http://[::1')).toBe('#');
    expect(safeUrl('', '/fallback')).toBe('/fallback');
    expect(safeUrl(null, 'default')).toBe('default');
  });
});

describe('Dynamic Category Icon Resolution', () => {
  it('maps standard software engineering category names correctly', () => {
    expect(getCategoryIcon('Software Engineering')).toBe('fas fa-puzzle-piece');
    expect(getCategoryIcon('Core Backend')).toBe('fas fa-puzzle-piece');
  });

  it('maps AI and Data categories correctly', () => {
    expect(getCategoryIcon('AI & Data')).toBe('fas fa-robot');
    expect(getCategoryIcon('Machine Learning')).toBe('fas fa-robot');
  });

  it('maps Application and Frontend development correctly', () => {
    expect(getCategoryIcon('Application Development')).toBe('fas fa-globe');
    expect(getCategoryIcon('Frontend Architecture')).toBe('fas fa-globe');
  });

  it('maps DevOps and Infrastructure correctly', () => {
    expect(getCategoryIcon('Infrastructure & Systems')).toBe('fas fa-cloud');
    expect(getCategoryIcon('Cloud DevOps')).toBe('fas fa-cloud');
  });

  it('preserves custom explicit icons from the database', () => {
    expect(getCategoryIcon('Custom Category', 'fas fa-rocket')).toBe('fas fa-rocket');
    expect(getCategoryIcon('Custom Category', 'fa-database')).toBe('fas fa-database');
  });
});

describe('Dynamic Skill Icon Resolution', () => {
  it('maps popular programming languages and frameworks to proper icons', () => {
    expect(getSkillIcon('Python')).toBe('fab fa-python');
    expect(getSkillIcon('Java')).toBe('fab fa-java');
    expect(getSkillIcon('React')).toBe('fab fa-react');
    expect(getSkillIcon('Docker')).toBe('fab fa-docker');
    expect(getSkillIcon('Django')).toBe('fas fa-cubes');
    expect(getSkillIcon('LLMs')).toBe('fas fa-brain');
    expect(getSkillIcon('FastAPI')).toBe('fas fa-bolt');
    expect(getSkillIcon('PostgreSQL')).toBe('fas fa-database');
  });

  it('preserves custom icons when provided', () => {
    expect(getSkillIcon('MySkill', 'fas fa-star')).toBe('fas fa-star');
    expect(getSkillIcon('MySkill', 'fa-fire')).toBe('fas fa-fire');
  });
});

describe('Dynamic Project Status Display', () => {
  it('resolves production status badges', () => {
    const prod = resolveStatusDisplay('active');
    expect(prod.text).toContain('Production');
    expect(prod.cls).toBe('status-prod');

    const completed = resolveStatusDisplay('completed');
    expect(completed.text).toContain('Production');
  });

  it('resolves pilot testing status badges', () => {
    const pilot = resolveStatusDisplay('pilot');
    expect(pilot.text).toContain('Pilot Testing');
    expect(pilot.cls).toBe('status-pilot');
  });

  it('resolves open source status badges', () => {
    const oss = resolveStatusDisplay('open source');
    expect(oss.text).toContain('Open Source');
    expect(oss.cls).toBe('status-oss');
  });
});

describe('Dynamic Empty State Rendering', () => {
  it('renders futuristic empty state card when skills array is empty', async () => {
    const mockContainer = { innerHTML: '' };
    globalThis.document = {
      querySelector: (sel) => (sel === '.tech-grid' ? mockContainer : null),
    };
    const { updateSkills } = await import('./hydratePortfolio');
    updateSkills([]);
    expect(mockContainer.innerHTML).toContain('empty-state-card');
    expect(mockContainer.innerHTML).toContain('Technical Proficiencies Updating');
  });

  it('renders futuristic empty state card when projects array is empty', async () => {
    const mockSlider = { innerHTML: '' };
    globalThis.document = {
      querySelector: (sel) => (sel === '.projects-slider' ? mockSlider : null),
    };
    const { updateProjects } = await import('./hydratePortfolio');
    updateProjects([]);
    expect(mockSlider.innerHTML).toContain('empty-state-card');
    expect(mockSlider.innerHTML).toContain('Projects Under Active Curation');
  });

  it('renders futuristic empty state card when experience array is empty', async () => {
    const mockTimeline = { innerHTML: '' };
    globalThis.document = {
      querySelector: (sel) => (sel === '.roadmap-timeline' ? mockTimeline : null),
    };
    const { updateExperience } = await import('./hydratePortfolio');
    updateExperience([]);
    expect(mockTimeline.innerHTML).toContain('empty-state-card');
  });
});

describe('Dynamic Hero Stats Hydration', () => {
  it('hydrates dynamic hero highlights with 1, 2, or 3 custom stats', async () => {
    const mockNftCard = {
      style: {},
      querySelector: () => ({ textContent: '' })
    };
    const mockStatsContainer = {
      innerHTML: '',
      appendChild: (el) => {
        mockStatsContainer.innerHTML += el.outerHTML || `<div class="stat-item">${el.innerHTML || ''}</div>`;
      }
    };
    const mockHeading = { innerHTML: '' };
    const mockHeroImage = { src: '' };

    globalThis.document = {
      querySelector: (sel) => {
        if (sel === '.nft-card') return mockNftCard;
        if (sel === '.hero-stats') return mockStatsContainer;
        if (sel === '.hero-heading') return mockHeading;
        if (sel === '.hero-image') return mockHeroImage;
        return { textContent: '', innerHTML: '', appendChild: () => {}, setAttribute: () => {} };
      },
      querySelectorAll: () => [],
      createElement: (tag) => {
        const el = {
          tagName: tag,
          className: '',
          textContent: '',
          children: [],
          appendChild: (child) => { el.children.push(child); }
        };
        return el;
      },
      head: { appendChild: () => {} }
    };

    const { updateProfile } = await import('./hydratePortfolio');

    // Test with 2 custom stats
    updateProfile({
      full_name: 'Roshan Damor',
      hero_highlights_title: 'Custom Highlights',
      hero_stats: [
        { value: '250K+', label: 'Active Readers', icon: 'fas fa-book-reader' },
        { value: '99.9%', label: 'Uptime SLA', icon: 'fas fa-shield-alt' }
      ]
    });

    expect(mockNftCard.style.display).not.toBe('none');
  });
});


