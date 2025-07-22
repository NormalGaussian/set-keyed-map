import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { SetMap } from "../../index.ts";

describe("Bug: mapOver() Method Creates Broken SetMap Instance", () => {
  test("mapped SetMap should work with equivalent keys for get()", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["a", "b"]), 10);
    originalMap.set(new Set(["c", "d"]), 20);
    originalMap.set(new Set(["e", "f"]), 30);
    originalMap.set(new Set(["g", "h"]), 40);

    // Map all values by doubling them
    const doubled = originalMap.mapOver((value) => value * 2);

    // Should contain 4 entries with doubled values
    assert.equal(doubled.size, 4);

    // Should be able to retrieve with equivalent keys
    const key1 = new Set(["a", "b"]); // Should map to value 20 (10 * 2)
    const key2 = new Set(["b", "a"]); // Equivalent key, different order
    const key3 = new Set(["c", "d"]); // Should map to value 40 (20 * 2)
    const key4 = new Set(["d", "c"]); // Equivalent key, different order

    assert.equal(doubled.get(key1), 20);
    assert.equal(doubled.get(key2), 20);
    assert.equal(doubled.get(key3), 40);
    assert.equal(doubled.get(key4), 40);
  });

  test("mapped SetMap should work with equivalent keys for has()", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["a", "b"]), 10);
    originalMap.set(new Set(["c", "d"]), 20);
    originalMap.set(new Set(["e", "f"]), 30);
    originalMap.set(new Set(["g", "h"]), 40);

    const stringified = originalMap.mapOver((value) => `value-${value}`);

    assert.equal(stringified.size, 4);

    // Test with equivalent keys
    const key1 = new Set(["e", "f"]);
    const key2 = new Set(["f", "e"]); // Equivalent
    const key3 = new Set(["g", "h"]);
    const key4 = new Set(["h", "g"]); // Equivalent

    assert.equal(stringified.has(key1), true);
    assert.equal(stringified.has(key2), true);
    assert.equal(stringified.has(key3), true);
    assert.equal(stringified.has(key4), true);
  });

  test("mapped SetMap should work with equivalent keys for delete()", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["a", "b"]), 10);
    originalMap.set(new Set(["c", "d"]), 20);
    originalMap.set(new Set(["e", "f"]), 30);
    originalMap.set(new Set(["g", "h"]), 40);

    const incremented = originalMap.mapOver((value) => value + 1);

    assert.equal(incremented.size, 4);

    // Try to delete with equivalent key
    const equivalentKey = new Set(["b", "a"]);
    assert.equal(incremented.delete(equivalentKey), true);
    assert.equal(incremented.size, 3);

    // After deletion, equivalent key should also not be found
    const anotherEquivalentKey = new Set(["a", "b"]);
    assert.equal(incremented.has(anotherEquivalentKey), false);
  });

  test("mathematical transformations should work", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["a", "b"]), 10);
    originalMap.set(new Set(["c", "d"]), 20);

    const squared = originalMap.mapOver((value) => value * value);

    assert.equal(squared.size, 2);

    // Expected values: 10² = 100, 20² = 400
    const key1 = new Set(["a", "b"]);
    const key1Equiv = new Set(["b", "a"]);
    const key2 = new Set(["c", "d"]);
    const key2Equiv = new Set(["d", "c"]);

    assert.equal(squared.get(key1), 100);
    assert.equal(squared.get(key1Equiv), 100);
    assert.equal(squared.get(key2), 400);
    assert.equal(squared.get(key2Equiv), 400);
  });

  test("type transformation to strings should work", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["e", "f"]), 30);
    originalMap.set(new Set(["g", "h"]), 40);

    const asStrings = originalMap.mapOver((value) => `${value}-transformed`);

    assert.equal(asStrings.size, 2);

    const key1 = new Set(["e", "f"]);
    const key2 = new Set(["f", "e"]); // Equivalent

    assert.equal(asStrings.get(key1), "30-transformed");
    assert.equal(asStrings.get(key2), "30-transformed");
  });

  test("mapping to complex objects should work", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["g", "h"]), 40);

    const asObjects = originalMap.mapOver((value, key) => ({
      originalValue: value,
      keySize: key.size,
      doubled: value * 2,
    }));

    assert.equal(asObjects.size, 1);

    const key = new Set(["h", "g"]); // Equivalent key
    const result = asObjects.get(key);

    assert.deepEqual(result, {
      originalValue: 40,
      keySize: 2,
      doubled: 80,
    });
  });

  test("chaining mapOver operations should work", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["a", "b"]), 10);
    originalMap.set(new Set(["c", "d"]), 20);

    const doubled = originalMap.mapOver((value) => value * 2);
    const thenSquared = doubled.mapOver((value) => value * value);

    assert.equal(thenSquared.size, 2);

    // Should contain squared doubled values
    // 10 -> 20 -> 400, 20 -> 40 -> 1600
    const key1 = new Set(["a", "b"]);
    const key2 = new Set(["b", "a"]); // Equivalent

    assert.equal(thenSquared.get(key1), 400); // (10 * 2)²
    assert.equal(thenSquared.get(key2), 400);
  });

  test("mapOver then filter chain should work", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["a", "b"]), 10);
    originalMap.set(new Set(["c", "d"]), 20);
    originalMap.set(new Set(["e", "f"]), 30);
    originalMap.set(new Set(["g", "h"]), 40);

    const doubled = originalMap.mapOver((value) => value * 2);
    const filtered = doubled.filter((value) => value > 50);

    assert.equal(filtered.size, 2); // Should contain 60 and 80 (30*2, 40*2)

    const key1 = new Set(["e", "f"]);
    const key1Equiv = new Set(["f", "e"]);
    const key2 = new Set(["g", "h"]);
    const key2Equiv = new Set(["h", "g"]);

    assert.equal(filtered.get(key1), 60);
    assert.equal(filtered.get(key1Equiv), 60);
    assert.equal(filtered.get(key2), 80);
    assert.equal(filtered.get(key2Equiv), 80);
  });

  test("mapping with key-dependent transformations", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["a", "b"]), 10);
    originalMap.set(new Set(["c", "d"]), 20);

    const keyAwareMap = originalMap.mapOver((value, key) => {
      const keyArray = Array.from(key).sort();
      return `${value}-${keyArray.join("-")}`;
    });

    assert.equal(keyAwareMap.size, 2);

    // Test retrieval with equivalent keys
    const key1 = new Set(["a", "b"]);
    const key2 = new Set(["b", "a"]); // Equivalent but different order

    const expected = "10-a-b"; // value=10, sorted key=['a','b']
    assert.equal(keyAwareMap.get(key1), expected);
    assert.equal(keyAwareMap.get(key2), expected); // Should be same result
  });

  test("mapping with access to original SetMap context", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["a", "b"]), 10);
    originalMap.set(new Set(["c", "d"]), 40);

    const contextAwareMap = originalMap.mapOver((value, _key, map) => {
      return {
        value,
        totalSize: map.size,
        isLargest: value === 40, // 40 is the largest in our test data
      };
    });

    assert.equal(contextAwareMap.size, 2);

    const key = new Set(["d", "c"]); // Equivalent key
    const result = contextAwareMap.get(key);

    assert.deepEqual(result, {
      value: 40,
      totalSize: 2,
      isLargest: true,
    });
  });

  test("mapped SetMap can be used for new operations", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["a", "b"]), 10);

    const mapped = originalMap.mapOver((value) => value * 10);

    // Should be able to add new items to mapped SetMap
    mapped.set(new Set(["test"]), 42);
    assert.equal(mapped.size, 2);

    // Should be able to retrieve with equivalent key
    const equivalentKey = new Set(["test"]);
    assert.equal(mapped.get(equivalentKey), 42);
  });

  test("original map remains unchanged after mapOver", () => {
    const originalMap = new SetMap<string, number>();
    originalMap.set(new Set(["a", "b"]), 1);
    originalMap.set(new Set(["c", "d"]), 2);

    const mapped = originalMap.mapOver((value) => value * 1000);

    // Original map should be unchanged
    assert.equal(originalMap.size, 2);
    assert.equal(originalMap.get(new Set(["b", "a"])), 1); // Equivalent key lookup
    assert.equal(originalMap.get(new Set(["d", "c"])), 2);

    // Mapped values should be different
    assert.equal(mapped.get(new Set(["a", "b"])), 1000);
    assert.equal(mapped.get(new Set(["c", "d"])), 2000);
  });
});
