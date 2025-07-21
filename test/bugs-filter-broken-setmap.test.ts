import { SetMap } from '../index';

describe('Bug: filter() Method Creates Broken SetMap Instance', () => {
  let originalMap: SetMap<string, number>;

  beforeEach(() => {
    originalMap = new SetMap<string, number>();
    // Note: These sets will work in originalMap only with exact references
    // due to the primary set() bug, but we're testing filter() behavior
    originalMap.set(new Set(['a', 'b']), 1);
    originalMap.set(new Set(['c', 'd']), 2);
    originalMap.set(new Set(['e', 'f']), 3);
    originalMap.set(new Set(['g', 'h']), 4);
  });

  describe('Basic filter functionality breaks', () => {
    test('filtered SetMap cannot find keys with get()', () => {
      // Filter to only keep values > 2
      const filtered = originalMap.filter((value) => value > 2);

      // Should contain 2 entries (values 3 and 4)
      expect(filtered.size).toBe(2);

      // But we cannot retrieve them with equivalent keys
      const key1 = new Set(['e', 'f']); // Should map to value 3
      const key2 = new Set(['f', 'e']); // Equivalent key, different order
      const key3 = new Set(['g', 'h']); // Should map to value 4
      const key4 = new Set(['h', 'g']); // Equivalent key, different order

      // These should work but fail due to missing subkeyToKeys index
      expect(filtered.get(key1)).toBe(3); // Currently returns undefined
      expect(filtered.get(key2)).toBe(3); // Currently returns undefined
      expect(filtered.get(key3)).toBe(4); // Currently returns undefined  
      expect(filtered.get(key4)).toBe(4); // Currently returns undefined
    });

    test('filtered SetMap cannot find keys with has()', () => {
      const filtered = originalMap.filter((value) => value <= 2);

      expect(filtered.size).toBe(2); // Should contain values 1 and 2

      // Test with equivalent keys
      const key1 = new Set(['a', 'b']);
      const key2 = new Set(['b', 'a']); // Equivalent
      const key3 = new Set(['c', 'd']);
      const key4 = new Set(['d', 'c']); // Equivalent

      // These should all return true but currently return false
      expect(filtered.has(key1)).toBe(true);
      expect(filtered.has(key2)).toBe(true);
      expect(filtered.has(key3)).toBe(true);
      expect(filtered.has(key4)).toBe(true);
    });

    test('filtered SetMap cannot delete keys', () => {
      const filtered = originalMap.filter((value) => value >= 1);

      expect(filtered.size).toBe(4); // All entries should be included

      // Try to delete with equivalent keys
      const keyToDelete = new Set(['a', 'b']);
      const equivalentKey = new Set(['b', 'a']);

      // These should return true but currently return false
      expect(filtered.delete(keyToDelete)).toBe(true);
      expect(filtered.size).toBe(3);

      // After deletion, equivalent key should also not be found
      expect(filtered.has(equivalentKey)).toBe(false);
    });
  });

  describe('Chaining operations fails', () => {
    test('filter() -> filter() creates doubly broken SetMaps', () => {
      const firstFilter = originalMap.filter((value) => value >= 2);
      const secondFilter = firstFilter.filter((value) => value <= 3);

      expect(secondFilter.size).toBe(2); // Should contain values 2 and 3

      // But cannot access the data
      const key1 = new Set(['c', 'd']);
      const key2 = new Set(['e', 'f']);

      expect(secondFilter.get(key1)).toBe(2);
      expect(secondFilter.get(key2)).toBe(3);
    });

    test('filter() -> iteration works but get() does not', () => {
      const filtered = originalMap.filter((value) => value % 2 === 0);

      expect(filtered.size).toBe(2); // Should contain values 2 and 4

      // Iteration should work (uses internal valueMap directly)
      const entriesFromIteration = Array.from(filtered.entries());
      expect(entriesFromIteration).toHaveLength(2);

      const valuesFromIteration = entriesFromIteration.map(([_, value]) => value).sort();
      expect(valuesFromIteration).toEqual([2, 4]);

      // But getting specific keys fails
      const key1 = new Set(['c', 'd']); // Should have value 2
      const key2 = new Set(['g', 'h']); // Should have value 4

      expect(filtered.get(key1)).toBe(2); // Currently undefined
      expect(filtered.get(key2)).toBe(4); // Currently undefined
    });
  });

  describe('Complex filtering scenarios', () => {
    test('filtering with complex predicates', () => {
      // Add more complex data
      originalMap.set(new Set(['x', 'y', 'z']), 10);
      originalMap.set(new Set(['p', 'q', 'r', 's']), 20);

      const filtered = originalMap.filter((value, key) => {
        return value > 5 && key.size >= 3;
      });

      expect(filtered.size).toBe(2); // Should contain the two new entries

      // Should be able to query with equivalent keys
      const key1 = new Set(['z', 'x', 'y']); // Equivalent to ['x', 'y', 'z']
      const key2 = new Set(['s', 'p', 'r', 'q']); // Equivalent to ['p', 'q', 'r', 's']

      expect(filtered.get(key1)).toBe(10);
      expect(filtered.get(key2)).toBe(20);
      expect(filtered.has(key1)).toBe(true);
      expect(filtered.has(key2)).toBe(true);
    });

    test('empty filter results still broken', () => {
      const filtered = originalMap.filter((value) => value > 100);

      expect(filtered.size).toBe(0);

      // Even empty SetMaps should work correctly for future additions
      filtered.set(new Set(['new', 'key']), 999);
      expect(filtered.size).toBe(1);

      // Should be able to retrieve with equivalent key
      const equivalentKey = new Set(['key', 'new']);
      expect(filtered.get(equivalentKey)).toBe(999);
      expect(filtered.has(equivalentKey)).toBe(true);
    });
  });

  describe('Filter preserves original map', () => {
    test('original map remains functional after filter', () => {
      const filtered = originalMap.filter((value) => value > 2);

      // Original map should still work (though with set() bug limitations)
      expect(originalMap.size).toBe(4);

      // The keys we used to populate should still work with exact references
      const originalEntries = Array.from(originalMap.entries());
      expect(originalEntries).toHaveLength(4);
    });
  });
});