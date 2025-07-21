import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { SetMap } from '../../index.ts';

describe('Bug: filter() Method Creates Broken SetMap Instance', () => {
  test('filtered SetMap should work with equivalent keys for get()', () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(['a', 'b']), 1);
    originalMap.set(new Set(['c', 'd']), 2);
    originalMap.set(new Set(['e', 'f']), 3);
    originalMap.set(new Set(['g', 'h']), 4);

    // Filter to only keep values > 2
    const filtered = originalMap.filter((value) => value > 2);

    // Should contain 2 entries (values 3 and 4)
    assert.equal(filtered.size, 2);

    // Should be able to retrieve with equivalent keys
    const key1 = new Set(['e', 'f']); // Should map to value 3
    const key2 = new Set(['f', 'e']); // Equivalent key, different order
    const key3 = new Set(['g', 'h']); // Should map to value 4
    const key4 = new Set(['h', 'g']); // Equivalent key, different order

    assert.equal(filtered.get(key1), 3);
    assert.equal(filtered.get(key2), 3);
    assert.equal(filtered.get(key3), 4);
    assert.equal(filtered.get(key4), 4);
  });

  test('filtered SetMap should work with equivalent keys for has()', () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(['a', 'b']), 1);
    originalMap.set(new Set(['c', 'd']), 2);
    originalMap.set(new Set(['e', 'f']), 3);
    originalMap.set(new Set(['g', 'h']), 4);

    const filtered = originalMap.filter((value) => value <= 2);

    assert.equal(filtered.size, 2); // Should contain values 1 and 2

    // Test with equivalent keys
    const key1 = new Set(['a', 'b']);
    const key2 = new Set(['b', 'a']); // Equivalent
    const key3 = new Set(['c', 'd']);
    const key4 = new Set(['d', 'c']); // Equivalent

    assert.equal(filtered.has(key1), true);
    assert.equal(filtered.has(key2), true);
    assert.equal(filtered.has(key3), true);
    assert.equal(filtered.has(key4), true);
  });

  test('filtered SetMap should work with equivalent keys for delete()', () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(['a', 'b']), 1);
    originalMap.set(new Set(['c', 'd']), 2);
    originalMap.set(new Set(['e', 'f']), 3);
    originalMap.set(new Set(['g', 'h']), 4);

    const filtered = originalMap.filter((value) => value >= 1);

    assert.equal(filtered.size, 4); // All entries should be included

    // Try to delete with equivalent key
    const equivalentKey = new Set(['b', 'a']);
    assert.equal(filtered.delete(equivalentKey), true);
    assert.equal(filtered.size, 3);

    // After deletion, equivalent key should also not be found
    const anotherEquivalentKey = new Set(['a', 'b']);
    assert.equal(filtered.has(anotherEquivalentKey), false);
  });

  test('chaining filter operations should work', () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(['a', 'b']), 1);
    originalMap.set(new Set(['c', 'd']), 2);
    originalMap.set(new Set(['e', 'f']), 3);
    originalMap.set(new Set(['g', 'h']), 4);

    const firstFilter = originalMap.filter((value) => value >= 2);
    const secondFilter = firstFilter.filter((value) => value <= 3);

    assert.equal(secondFilter.size, 2); // Should contain values 2 and 3

    // Should be able to access the data with equivalent keys
    const key1 = new Set(['c', 'd']);
    const key1Equiv = new Set(['d', 'c']);
    const key2 = new Set(['e', 'f']);
    const key2Equiv = new Set(['f', 'e']);

    assert.equal(secondFilter.get(key1), 2);
    assert.equal(secondFilter.get(key1Equiv), 2);
    assert.equal(secondFilter.get(key2), 3);
    assert.equal(secondFilter.get(key2Equiv), 3);
  });

  test('filtered SetMap can be used for new operations', () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(['a', 'b']), 10);
    originalMap.set(new Set(['c', 'd']), 20);

    const filtered = originalMap.filter((value) => value > 5);
    assert.equal(filtered.size, 2);

    // Should be able to add new items to filtered SetMap
    filtered.set(new Set(['new', 'key']), 999);
    assert.equal(filtered.size, 3);

    // Should be able to retrieve with equivalent key
    const equivalentKey = new Set(['key', 'new']);
    assert.equal(filtered.get(equivalentKey), 999);
    assert.equal(filtered.has(equivalentKey), true);
  });

  test('complex filtering with key-dependent predicates', () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(['a', 'b']), 1);
    originalMap.set(new Set(['c', 'd']), 2);
    originalMap.set(new Set(['x', 'y', 'z']), 10);
    originalMap.set(new Set(['p', 'q', 'r', 's']), 20);

    const filtered = originalMap.filter((value, key) => {
      return value > 5 && key.size >= 3;
    });

    assert.equal(filtered.size, 2); // Should contain the two entries with 3+ elements and value > 5

    // Should be able to query with equivalent keys
    const key1 = new Set(['z', 'x', 'y']); // Equivalent to ['x', 'y', 'z']
    const key2 = new Set(['s', 'p', 'r', 'q']); // Equivalent to ['p', 'q', 'r', 's']

    assert.equal(filtered.get(key1), 10);
    assert.equal(filtered.get(key2), 20);
    assert.equal(filtered.has(key1), true);
    assert.equal(filtered.has(key2), true);
  });

  test('original map remains functional after filter', () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(['a', 'b']), 1);
    originalMap.set(new Set(['c', 'd']), 2);
    originalMap.set(new Set(['e', 'f']), 3);
    originalMap.set(new Set(['g', 'h']), 4);

    originalMap.filter((value) => value > 2);

    // Original map should still work correctly
    assert.equal(originalMap.size, 4);
    assert.equal(originalMap.get(new Set(['b', 'a'])), 1); // Equivalent key lookup
    assert.equal(originalMap.get(new Set(['d', 'c'])), 2);
  });
});