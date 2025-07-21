import { SetMap } from '../index';

describe('Bug: mapOver() Method Creates Broken SetMap Instance', () => {
  let originalMap: SetMap<string, number>;

  beforeEach(() => {
    originalMap = new SetMap<string, number>();
    // Note: These sets will work in originalMap only with exact references
    // due to the primary set() bug, but we're testing mapOver() behavior
    originalMap.set(new Set(['a', 'b']), 10);
    originalMap.set(new Set(['c', 'd']), 20);
    originalMap.set(new Set(['e', 'f']), 30);
    originalMap.set(new Set(['g', 'h']), 40);
  });

  describe('Basic mapOver functionality breaks', () => {
    test('mapped SetMap cannot find keys with get()', () => {
      // Map all values by doubling them
      const doubled = originalMap.mapOver((value) => value * 2);

      // Should contain 4 entries with doubled values
      expect(doubled.size).toBe(4);

      // But we cannot retrieve them with equivalent keys
      const key1 = new Set(['a', 'b']); // Should map to value 20 (10 * 2)
      const key2 = new Set(['b', 'a']); // Equivalent key, different order
      const key3 = new Set(['c', 'd']); // Should map to value 40 (20 * 2)
      const key4 = new Set(['d', 'c']); // Equivalent key, different order

      // These should work but fail due to missing subkeyToKeys index
      expect(doubled.get(key1)).toBe(20); // Currently returns undefined
      expect(doubled.get(key2)).toBe(20); // Currently returns undefined
      expect(doubled.get(key3)).toBe(40); // Currently returns undefined
      expect(doubled.get(key4)).toBe(40); // Currently returns undefined
    });

    test('mapped SetMap cannot find keys with has()', () => {
      const stringified = originalMap.mapOver((value) => `value-${value}`);

      expect(stringified.size).toBe(4);

      // Test with equivalent keys
      const key1 = new Set(['e', 'f']);
      const key2 = new Set(['f', 'e']); // Equivalent
      const key3 = new Set(['g', 'h']);
      const key4 = new Set(['h', 'g']); // Equivalent

      // These should all return true but currently return false
      expect(stringified.has(key1)).toBe(true);
      expect(stringified.has(key2)).toBe(true);
      expect(stringified.has(key3)).toBe(true);
      expect(stringified.has(key4)).toBe(true);
    });

    test('mapped SetMap cannot delete keys', () => {
      const incremented = originalMap.mapOver((value) => value + 1);

      expect(incremented.size).toBe(4);

      // Try to delete with equivalent keys
      const keyToDelete = new Set(['a', 'b']);
      const equivalentKey = new Set(['b', 'a']);

      // These should return true but currently return false
      expect(incremented.delete(keyToDelete)).toBe(true);
      expect(incremented.size).toBe(3);

      // After deletion, equivalent key should also not be found
      expect(incremented.has(equivalentKey)).toBe(false);
    });
  });

  describe('Different mapping functions create broken SetMaps', () => {
    test('mathematical transformations', () => {
      const squared = originalMap.mapOver((value) => value * value);

      expect(squared.size).toBe(4);

      // Expected values: 10² = 100, 20² = 400, 30² = 900, 40² = 1600
      const key1 = new Set(['a', 'b']);
      const key2 = new Set(['c', 'd']);

      expect(squared.get(key1)).toBe(100);
      expect(squared.get(key2)).toBe(400);
    });

    test('type transformation to strings', () => {
      const asStrings = originalMap.mapOver((value) => `${value}-transformed`);

      expect(asStrings.size).toBe(4);

      const key1 = new Set(['e', 'f']);
      const key2 = new Set(['f', 'e']); // Equivalent

      expect(asStrings.get(key1)).toBe('30-transformed');
      expect(asStrings.get(key2)).toBe('30-transformed');
    });

    test('mapping to complex objects', () => {
      const asObjects = originalMap.mapOver((value, key) => ({
        originalValue: value,
        keySize: key.size,
        doubled: value * 2
      }));

      expect(asObjects.size).toBe(4);

      const key = new Set(['g', 'h']);
      const result = asObjects.get(key);

      expect(result).toEqual({
        originalValue: 40,
        keySize: 2,
        doubled: 80
      });
    });
  });

  describe('Chaining operations fails', () => {
    test('mapOver() -> mapOver() creates doubly broken SetMaps', () => {
      const doubled = originalMap.mapOver((value) => value * 2);
      const thenSquared = doubled.mapOver((value) => value * value);

      expect(thenSquared.size).toBe(4);

      // Should contain squared doubled values
      // 10 -> 20 -> 400, 20 -> 40 -> 1600, etc.
      const key1 = new Set(['a', 'b']);
      const key2 = new Set(['b', 'a']); // Equivalent

      expect(thenSquared.get(key1)).toBe(400); // (10 * 2)²
      expect(thenSquared.get(key2)).toBe(400);
    });

    test('mapOver() -> filter() chain fails', () => {
      const doubled = originalMap.mapOver((value) => value * 2);
      const filtered = doubled.filter((value) => value > 50);

      expect(filtered.size).toBe(2); // Should contain 60 and 80 (30*2, 40*2)

      const key1 = new Set(['e', 'f']);
      const key2 = new Set(['g', 'h']);

      expect(filtered.get(key1)).toBe(60);
      expect(filtered.get(key2)).toBe(80);
    });

    test('mapOver() -> iteration works but get() does not', () => {
      const mapped = originalMap.mapOver((value) => value / 10);

      expect(mapped.size).toBe(4);

      // Iteration should work (uses internal valueMap directly)
      const entriesFromIteration = Array.from(mapped.entries());
      expect(entriesFromIteration).toHaveLength(4);

      const valuesFromIteration = entriesFromIteration.map(([_, value]) => value).sort();
      expect(valuesFromIteration).toEqual([1, 2, 3, 4]); // 10/10, 20/10, 30/10, 40/10

      // But getting specific keys fails
      const key1 = new Set(['a', 'b']); // Should have value 1
      const key2 = new Set(['c', 'd']); // Should have value 2

      expect(mapped.get(key1)).toBe(1); // Currently undefined
      expect(mapped.get(key2)).toBe(2); // Currently undefined
    });
  });

  describe('Mapping with key-dependent transformations', () => {
    test('mapping function uses both value and key', () => {
      const keyAwareMap = originalMap.mapOver((value, key) => {
        const keyArray = Array.from(key).sort();
        return `${value}-${keyArray.join('-')}`;
      });

      expect(keyAwareMap.size).toBe(4);

      // Test retrieval with equivalent keys
      const key1 = new Set(['a', 'b']);
      const key2 = new Set(['b', 'a']); // Equivalent but different order

      const expected = '10-a-b'; // value=10, sorted key=['a','b']
      expect(keyAwareMap.get(key1)).toBe(expected);
      expect(keyAwareMap.get(key2)).toBe(expected); // Should be same result
    });

    test('mapping function accesses original SetMap context', () => {
      const contextAwareMap = originalMap.mapOver((value, key, map) => {
        return {
          value,
          totalSize: map.size,
          isLargest: value === 40 // Assuming 40 is the largest in our test data
        };
      });

      expect(contextAwareMap.size).toBe(4);

      const key = new Set(['g', 'h']);
      const result = contextAwareMap.get(key);

      expect(result).toEqual({
        value: 40,
        totalSize: 4,
        isLargest: true
      });
    });
  });

  describe('Edge cases with mapped SetMaps', () => {
    test('mapping to same values should still maintain separate keys', () => {
      // Map all values to the same constant
      const constant = originalMap.mapOver(() => 999);

      expect(constant.size).toBe(4); // All 4 keys should still exist

      // All keys should return the same value
      const key1 = new Set(['a', 'b']);
      const key2 = new Set(['c', 'd']);

      expect(constant.get(key1)).toBe(999);
      expect(constant.get(key2)).toBe(999);
    });

    test('empty SetMap mapOver should work', () => {
      const empty = new SetMap<string, number>();
      const mapped = empty.mapOver((value) => value * 10);

      expect(mapped.size).toBe(0);

      // Should still work correctly for future additions
      mapped.set(new Set(['test']), 42);
      expect(mapped.size).toBe(1);
      expect(mapped.get(new Set(['test']))).toBe(42);
    });
  });

  describe('MapOver preserves original map', () => {
    test('original map remains unchanged after mapOver', () => {
      const mapped = originalMap.mapOver((value) => value * 1000);

      // Original map should be unchanged
      expect(originalMap.size).toBe(4);

      // Original values should still be there (with set() bug limitations)
      const originalEntries = Array.from(originalMap.entries());
      expect(originalEntries).toHaveLength(4);

      // Mapped values should be different
      const mappedEntries = Array.from(mapped.entries());
      const mappedValues = mappedEntries.map(([_, value]) => value).sort();
      expect(mappedValues).toEqual([10000, 20000, 30000, 40000]);
    });
  });
});