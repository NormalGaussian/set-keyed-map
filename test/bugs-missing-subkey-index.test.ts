import { SetMap } from '../index';

describe('Bug: Missing subkeyToKeys Index Population in set() Method', () => {
  let map: SetMap<string, number>;

  beforeEach(() => {
    map = new SetMap<string, number>();
  });

  describe('Core functionality breaks after set()', () => {
    test('get() returns undefined for equivalent keys', () => {
      const key1 = new Set(['a', 'b']);
      const key2 = new Set(['b', 'a']); // Same elements, different order

      map.set(key1, 42);

      // Should work: equivalent keys should return the same value
      expect(map.get(key2)).toBe(42);
      
      // Currently fails: returns undefined instead of 42
      // This demonstrates the subkeyToKeys index is not populated
    });

    test('has() returns false for equivalent keys', () => {
      const key1 = new Set(['x', 'y', 'z']);
      const key2 = new Set(['z', 'y', 'x']); // Same elements, different order

      map.set(key1, 100);

      // Should work: equivalent keys should be found
      expect(map.has(key2)).toBe(true);
      expect(map.has(key1)).toBe(true);
      
      // Currently fails: returns false for key2
    });

    test('delete() returns false for equivalent keys', () => {
      const key1 = new Set(['foo', 'bar']);
      const key2 = new Set(['bar', 'foo']); // Same elements, different order

      map.set(key1, 999);

      // Should work: equivalent keys should be deletable
      expect(map.delete(key2)).toBe(true);
      expect(map.has(key1)).toBe(false);
      
      // Currently fails: delete returns false, item remains
    });

    test('only works with exact same Set reference', () => {
      const key1 = new Set(['a', 'b']);
      map.set(key1, 42);

      // This works (same object reference)
      expect(map.get(key1)).toBe(42);
      expect(map.has(key1)).toBe(true);
      expect(map.delete(key1)).toBe(true);

      // But equivalent keys don't work
      const key2 = new Set(['a', 'b']);
      map.set(key1, 42); // Reset for testing
      expect(map.get(key2)).toBeUndefined();
      expect(map.has(key2)).toBe(false);
      expect(map.delete(key2)).toBe(false);
    });
  });

  describe('Multiple equivalent keys should share same canonical key', () => {
    test('different insertion orders should be equivalent', () => {
      const keys = [
        new Set(['1', '2', '3']),
        new Set(['3', '1', '2']),
        new Set(['2', '3', '1']),
      ];

      // All should map to the same canonical key
      map.set(keys[0], 'first');
      expect(map.get(keys[1])).toBe('first');
      expect(map.get(keys[2])).toBe('first');

      // Updating with any equivalent key should update all
      map.set(keys[1], 'updated');
      expect(map.get(keys[0])).toBe('updated');
      expect(map.get(keys[2])).toBe('updated');
    });

    test('complex sets with multiple elements', () => {
      const key1 = new Set(['alpha', 'beta', 'gamma', 'delta']);
      const key2 = new Set(['delta', 'alpha', 'gamma', 'beta']);
      const key3 = new Set(['gamma', 'delta', 'alpha', 'beta']);

      map.set(key1, 'complex-value');

      // All equivalent keys should work
      expect(map.get(key2)).toBe('complex-value');
      expect(map.get(key3)).toBe('complex-value');
      expect(map.has(key2)).toBe(true);
      expect(map.has(key3)).toBe(true);
    });
  });

  describe('Edge cases that should work', () => {
    test('single element sets', () => {
      const key1 = new Set(['solo']);
      const key2 = new Set(['solo']); // Equivalent

      map.set(key1, 'alone');
      expect(map.get(key2)).toBe('alone');
      expect(map.has(key2)).toBe(true);
    });

    test('sets with duplicate elements (Sets normalize duplicates)', () => {
      const key1 = new Set(['a', 'a', 'b']); // Becomes Set(['a', 'b'])
      const key2 = new Set(['b', 'a']); // Equivalent to key1

      map.set(key1, 'normalized');
      expect(map.get(key2)).toBe('normalized');
    });
  });

  describe('Size and iteration should work correctly', () => {
    test('size reflects actual number of canonical keys', () => {
      const key1 = new Set(['x', 'y']);
      const key2 = new Set(['y', 'x']); // Equivalent to key1
      const key3 = new Set(['a', 'b']); // Different

      map.set(key1, 1);
      map.set(key2, 2); // Should overwrite key1's value
      map.set(key3, 3);

      expect(map.size).toBe(2); // Only 2 unique canonical keys
    });

    test('iteration should include all canonical keys', () => {
      const key1 = new Set(['p', 'q']);
      const key2 = new Set(['q', 'p']); // Equivalent
      const key3 = new Set(['r', 's']); // Different

      map.set(key1, 'first');
      map.set(key2, 'overwritten'); // Should overwrite first
      map.set(key3, 'second');

      const entries = Array.from(map.entries());
      expect(entries).toHaveLength(2);

      const values = entries.map(([_, value]) => value).sort();
      expect(values).toEqual(['overwritten', 'second']);
    });
  });
});