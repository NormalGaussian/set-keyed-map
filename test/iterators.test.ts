import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { SetKeyedMap } from "../index.ts";

describe("SetKeyedMap - Iterators", () => {
  test("should iterate over keys", () => {
    const map = new SetKeyedMap<string, number>();
    map.set(new Set(["a", "b"]), 42);
    map.set(new Set(["c", "d"]), 100);

    const keys = Array.from(map.keys());
    assert.equal(keys.length, 2);
    assert.ok(keys.some((k) => k.has("a") && k.has("b") && k.size === 2));
    assert.ok(keys.some((k) => k.has("c") && k.has("d") && k.size === 2));
  });

  test("should iterate over values", () => {
    const map = new SetKeyedMap<string, number>();
    map.set(new Set(["a", "b"]), 42);
    map.set(new Set(["c", "d"]), 100);

    const values = Array.from(map.values());
    assert.deepEqual(
      values.sort((a, b) => a - b),
      [42, 100],
    );
  });

  test("should iterate over entries", () => {
    const map = new SetKeyedMap<string, number>();
    map.set(new Set(["a", "b"]), 42);
    map.set(new Set(["c", "d"]), 100);

    const entries = Array.from(map.entries());
    assert.equal(entries.length, 2);
  });

  test("should use Symbol.iterator", () => {
    const map = new SetKeyedMap<string, number>();
    map.set(new Set(["a", "b"]), 42);

    const entries = Array.from(map);
    assert.equal(entries.length, 1);
    assert.equal(entries[0][1], 42);
  });
});

describe("SetKeyedMap - forEach", () => {
  test("should iterate with forEach", () => {
    const map = new SetKeyedMap<string, number>();
    map.set(new Set(["a", "b"]), 42);
    map.set(new Set(["c", "d"]), 100);

    const results: number[] = [];
    map.forEach((value) => results.push(value));

    assert.equal(results.length, 2);
    assert.ok(results.includes(42));
    assert.ok(results.includes(100));
  });

  test("should use thisArg in forEach", () => {
    const map = new SetKeyedMap<string, number>();
    map.set(new Set(["a"]), 42);

    const context = { multiplier: 2 };
    let result = 0;

    map.forEach(function (value) {
      result = value * this.multiplier;
    }, context);

    assert.equal(result, 84);
  });
});
