import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { SetMap } from '../index.ts';

describe('SetMap - Edge cases', () => {
  test('should handle single element sets', () => {
    const map = new SetMap<string, number>();
    const key = new Set(['a']);
    
    map.set(key, 42);
    assert.equal(map.get(key), 42);
  });

  test('should handle large sets', () => {
    const map = new SetMap<number, string>();
    const key = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    
    map.set(key, 'test');
    assert.equal(map.get(key), 'test');
  });

  test('should handle different Set implementations with same content', () => {
    const map = new SetMap<string, number>();
    const key1 = new Set(['a', 'b', 'c']);
    const key2 = new Set(['c', 'a', 'b']);
    const key3 = new Set(['b', 'c', 'a']);
    
    map.set(key1, 42);
    assert.equal(map.get(key2), 42);
    assert.equal(map.get(key3), 42);
    assert.equal(map.size, 1);
  });

  test('should handle overlapping but different sets', () => {
    const map = new SetMap<string, number>();
    map.set(new Set(['a', 'b']), 42);
    map.set(new Set(['a', 'c']), 100);
    map.set(new Set(['b', 'c']), 200);
    
    assert.equal(map.size, 3);
    assert.equal(map.get(new Set(['a', 'b'])), 42);
    assert.equal(map.get(new Set(['a', 'c'])), 100);
    assert.equal(map.get(new Set(['b', 'c'])), 200);
  });
});

describe('SetMap - Complex scenarios', () => {
  test('should handle mixed operations', () => {
    const map = new SetMap<string, number>();
    
    map.set(new Set(['a', 'b']), 1);
    map.set(new Set(['c', 'd']), 2);
    map.set(new Set(['e', 'f']), 3);
    
    assert.equal(map.size, 3);
    
    map.delete(new Set(['c', 'd']));
    assert.equal(map.size, 2);
    assert.equal(map.has(new Set(['c', 'd'])), false);
    
    map.set(new Set(['b', 'a']), 10);
    assert.equal(map.size, 2);
    assert.equal(map.get(new Set(['a', 'b'])), 10);
  });

  test('should maintain canonical keys correctly', () => {
    const map = new SetMap<string, number>();
    
    const key1 = new Set(['x', 'y', 'z']);
    const key2 = new Set(['z', 'x', 'y']);
    const key3 = new Set(['y', 'z', 'x']);
    
    map.set(key1, 100);
    assert.equal(map.get(key2), 100);
    assert.equal(map.get(key3), 100);
    
    map.set(key2, 200);
    assert.equal(map.get(key1), 200);
    assert.equal(map.get(key3), 200);
    assert.equal(map.size, 1);
  });

  test('should handle sets with different sizes correctly', () => {
    const map = new SetMap<number, string>();
    
    map.set(new Set([1]), 'one');
    map.set(new Set([1, 2]), 'one-two');
    map.set(new Set([1, 2, 3]), 'one-two-three');
    
    assert.equal(map.size, 3);
    assert.equal(map.get(new Set([1])), 'one');
    assert.equal(map.get(new Set([2, 1])), 'one-two');
    assert.equal(map.get(new Set([3, 1, 2])), 'one-two-three');
  });
});