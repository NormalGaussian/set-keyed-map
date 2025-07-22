import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { SetMap } from "../../index.ts";

describe("Bug: Missing subkeyToKeys Index Population in set() Method", () => {
  test("get() should work with equivalent keys", () => {
    const map = new SetMap<string, number>();
    const key1 = new Set(["a", "b"]);
    const key2 = new Set(["b", "a"]); // Same elements, different order

    map.set(key1, 42);

    // Should work: equivalent keys should return the same value
    assert.equal(map.get(key2), 42);
    assert.equal(map.get(key1), 42);
  });

  test("has() should work with equivalent keys", () => {
    const map = new SetMap<string, number>();
    const key1 = new Set(["x", "y", "z"]);
    const key2 = new Set(["z", "y", "x"]); // Same elements, different order

    map.set(key1, 100);

    // Should work: equivalent keys should be found
    assert.equal(map.has(key2), true);
    assert.equal(map.has(key1), true);
  });

  test("delete() should work with equivalent keys", () => {
    const map = new SetMap<string, number>();
    const key1 = new Set(["foo", "bar"]);
    const key2 = new Set(["bar", "foo"]); // Same elements, different order

    map.set(key1, 999);

    // Should work: equivalent keys should be deletable
    assert.equal(map.delete(key2), true);
    assert.equal(map.has(key1), false);
    assert.equal(map.size, 0);
  });

  test("different insertion orders should be equivalent", () => {
    const map = new SetMap<string, string>();
    const key1 = new Set(["1", "2", "3"]);
    const key2 = new Set(["3", "1", "2"]);
    const key3 = new Set(["2", "3", "1"]);

    // All should map to the same canonical key
    map.set(key1, "first");
    assert.equal(map.get(key2), "first");
    assert.equal(map.get(key3), "first");

    // Updating with any equivalent key should update all
    map.set(key2, "updated");
    assert.equal(map.get(key1), "updated");
    assert.equal(map.get(key3), "updated");
    assert.equal(map.size, 1); // Still only one canonical key
  });

  test("complex sets with multiple elements", () => {
    const map = new SetMap<string, string>();
    const key1 = new Set(["alpha", "beta", "gamma", "delta"]);
    const key2 = new Set(["delta", "alpha", "gamma", "beta"]);
    const key3 = new Set(["gamma", "delta", "alpha", "beta"]);

    map.set(key1, "complex-value");

    // All equivalent keys should work
    assert.equal(map.get(key2), "complex-value");
    assert.equal(map.get(key3), "complex-value");
    assert.equal(map.has(key2), true);
    assert.equal(map.has(key3), true);
  });

  test("single element sets should work", () => {
    const map = new SetMap<string, string>();
    const key1 = new Set(["solo"]);
    const key2 = new Set(["solo"]); // Equivalent

    map.set(key1, "alone");
    assert.equal(map.get(key2), "alone");
    assert.equal(map.has(key2), true);
  });

  test("size reflects actual number of canonical keys", () => {
    const map = new SetMap<string, number>();
    const key1 = new Set(["x", "y"]);
    const key2 = new Set(["y", "x"]); // Equivalent to key1
    const key3 = new Set(["a", "b"]); // Different

    map.set(key1, 1);
    map.set(key2, 2); // Should overwrite key1's value
    map.set(key3, 3);

    assert.equal(map.size, 2); // Only 2 unique canonical keys
    assert.equal(map.get(key1), 2); // Should have the updated value
    assert.equal(map.get(key2), 2); // Same value
    assert.equal(map.get(key3), 3);
  });

  test("iteration should include all canonical keys", () => {
    const map = new SetMap<string, string>();
    const key1 = new Set(["p", "q"]);
    const key2 = new Set(["q", "p"]); // Equivalent
    const key3 = new Set(["r", "s"]); // Different

    map.set(key1, "first");
    map.set(key2, "overwritten"); // Should overwrite first
    map.set(key3, "second");

    const entries = Array.from(map.entries());
    assert.equal(entries.length, 2);

    const values = entries.map(([_, value]) => value).sort();
    assert.deepEqual(values, ["overwritten", "second"]);
  });
});
