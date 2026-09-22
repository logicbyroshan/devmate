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

