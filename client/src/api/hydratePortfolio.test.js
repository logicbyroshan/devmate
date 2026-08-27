import { describe, expect, it } from 'vitest';
import { safeUrl, STATIC_PROJECTS, STATIC_SKILL_CARDS, getCombinedProjects } from './hydratePortfolio';

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
  });
});

describe('Static Skills Configuration', () => {
  it('contains the 4 required categories', () => {
    expect(STATIC_SKILL_CARDS).toHaveLength(4);
    const titles = STATIC_SKILL_CARDS.map((c) => c.title);
    expect(titles).toContain('Software Engineering');
    expect(titles).toContain('AI & Data');
    expect(titles).toContain('Application Development');
    expect(titles).toContain('Infrastructure & Systems');
  });

  it('contains expected items in each category', () => {
    const se = STATIC_SKILL_CARDS.find((c) => c.title.includes('Software Engineering'));
    expect(se.skills).toContain('Python');
    expect(se.skills).toContain('Django');
    expect(se.skills).toContain('FastAPI');
    expect(se.skills).toContain('System Design');

    const ai = STATIC_SKILL_CARDS.find((c) => c.title.includes('AI & Data'));
    expect(ai.skills).toContain('LLMs');
    expect(ai.skills).toContain('RAG');
    expect(ai.skills).toContain('AI Agents');

    const app = STATIC_SKILL_CARDS.find((c) => c.title.includes('Application Development'));
    expect(app.skills).toContain('React');
    expect(app.skills).toContain('PostgreSQL');

    const infra = STATIC_SKILL_CARDS.find((c) => c.title.includes('Infrastructure & Systems'));
    expect(infra.skills).toContain('Docker');
    expect(infra.skills).toContain('Nginx');
    expect(infra.skills).toContain('CI/CD');
  });
});

describe('Hybrid Projects Replacement', () => {
  it('replaces static projects one-by-one when partial API projects are provided', () => {
    const liveApiProjects = [
      {
        title: 'Live API Project Alpha',
        project_name: 'AlphaLive',
        description: 'First project fetched live from Django API',
        category: { name: 'Live Software' },
        technologies_list: ['React', 'Python'],
        github_url: 'https://github.com/logicbyroshan',
      },
    ];

    const combined = getCombinedProjects(liveApiProjects);
    expect(combined).toHaveLength(STATIC_PROJECTS.length);
    expect(combined[0].title).toBe('Live API Project Alpha');
    expect(combined[1].title).toBe(STATIC_PROJECTS[1].title);
    expect(combined[2].title).toBe(STATIC_PROJECTS[2].title);
    expect(combined[3].title).toBe(STATIC_PROJECTS[3].title);
  });

  it('replaces first 2 projects when 2 live API projects are provided', () => {
    const liveApiProjects = [
      { title: 'Live Alpha', project_name: 'Alpha' },
      { title: 'Live Beta', project_name: 'Beta' },
    ];

    const combined = getCombinedProjects(liveApiProjects);
    expect(combined).toHaveLength(STATIC_PROJECTS.length);
    expect(combined[0].title).toBe('Live Alpha');
    expect(combined[1].title).toBe('Live Beta');
    expect(combined[2].title).toBe(STATIC_PROJECTS[2].title);
  });

  it('renders all static fallback projects if API returns empty list', () => {
    const combined = getCombinedProjects([]);
    expect(combined).toHaveLength(STATIC_PROJECTS.length);
    expect(combined[0].title).toBe(STATIC_PROJECTS[0].title);
  });
});
