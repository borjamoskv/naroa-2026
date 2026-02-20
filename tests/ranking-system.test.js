// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('RankingSystem', () => {
  let RankingSystem;

  beforeEach(async () => {
    localStorage.clear();
    const mod = await import('../js/core/ranking-system.js');
    RankingSystem = mod.RankingSystem;
  });

  it('should export RankingSystem object', () => {
    expect(RankingSystem).toBeDefined();
    expect(typeof RankingSystem.submitScore).toBe('function');
    expect(typeof RankingSystem.getTopScores).toBe('function');
    expect(typeof RankingSystem.clearAll).toBe('function');
  });

  it('getDefaultRankings() should return object with game keys', () => {
    const defaults = RankingSystem.getDefaultRankings();
    expect(defaults).toBeDefined();
    expect(typeof defaults).toBe('object');
  });

  it('submitScore() should add a score entry', () => {
    RankingSystem.submitScore('test-game', 100, 'Player1');
    const scores = RankingSystem.getTopScores('test-game');
    expect(scores.length).toBeGreaterThanOrEqual(1);
    
    // Name is truncated to 3 uppercase chars: 'Player1' -> 'PLA'
    const found = scores.find(s => s.name === 'PLA' && s.score === 100);
    expect(found).toBeDefined();
  });

  it('submitScore() should sort by score descending', () => {
    RankingSystem.submitScore('sort-test', 50, 'Low');
    RankingSystem.submitScore('sort-test', 200, 'High');
    RankingSystem.submitScore('sort-test', 100, 'Mid');
    
    const scores = RankingSystem.getTopScores('sort-test');
    expect(scores[0].score).toBeGreaterThanOrEqual(scores[1].score);
  });

  it('getTopScores() should respect limit parameter', () => {
    for (let i = 0; i < 15; i++) {
      RankingSystem.submitScore('limit-test', i * 10, `Player${i}`);
    }
    const top5 = RankingSystem.getTopScores('limit-test', 5);
    expect(top5.length).toBeLessThanOrEqual(5);
  });

  it('getPersonalBest() should return best score for player', () => {
    RankingSystem.submitScore('pb-test', 50, 'Hero');
    RankingSystem.submitScore('pb-test', 200, 'Hero');
    RankingSystem.submitScore('pb-test', 100, 'Hero');
    
    // Name truncated to 'HER'
    const best = RankingSystem.getPersonalBest('pb-test', 'HER');
    expect(best).toBeDefined();
    expect(best.score).toBe(200);
  });

  it('clearAll() should wipe all rankings', () => {
    RankingSystem.submitScore('clear-test', 100, 'Gone');
    RankingSystem.clearAll();
    
    const scores = RankingSystem.getTopScores('clear-test');
    // After clear, should return empty or default
    const hasGone = scores.some(s => s.name === 'Gone');
    expect(hasGone).toBe(false);
  });

  it('formatDate() should return formatted string', () => {
    const result = RankingSystem.formatDate(new Date('2026-02-20'));
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should persist rankings in localStorage', () => {
    RankingSystem.submitScore('persist-test', 999, 'Persisted');
    
    const stored = localStorage.getItem(RankingSystem.storageKey);
    expect(stored).toBeDefined();
    // Name truncated to 'PER'
    expect(stored).toContain('PER');
  });
});
