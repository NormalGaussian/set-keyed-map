import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { SetMap } from "../index.ts";

describe("SetMap - Array-like methods", () => {
  test("should test every condition", () => {
    const map = new SetMap<string, number>();
    map.set(new Set(["a"]), 2);
    map.set(new Set(["b"]), 4);
    map.set(new Set(["c"]), 6);

    assert.equal(
      map.every((v) => v % 2 === 0),
      true,
    );
    assert.equal(
      map.every((v) => v > 5),
      false,
    );
  });

  test("should filter entries", () => {
    const map = new SetMap<string, number>();
    map.set(new Set(["a"]), 2);
    map.set(new Set(["b"]), 4);
    map.set(new Set(["c"]), 6);

    const filtered = map.filter((v) => v > 3);
    assert.equal(filtered.size, 2);
    assert.equal(filtered.get(new Set(["b"])), 4);
    assert.equal(filtered.get(new Set(["c"])), 6);
  });

  test("should test some condition", () => {
    const map = new SetMap<string, number>();
    map.set(new Set(["a"]), 2);
    map.set(new Set(["b"]), 4);

    assert.equal(
      map.some((v) => v > 3),
      true,
    );
    assert.equal(
      map.some((v) => v > 10),
      false,
    );
  });

  test("should find entry", () => {
    const map = new SetMap<string, number>();
    map.set(new Set(["a"]), 2);
    map.set(new Set(["b"]), 4);

    const found = map.find((v) => v > 3);
    assert.ok(found);
    assert.equal(found[1], 4);

    const notFound = map.find((v) => v > 10);
    assert.equal(notFound, undefined);
  });

  test("should check if includes value", () => {
    const map = new SetMap<string, number>();
    map.set(new Set(["a"]), 42);
    map.set(new Set(["b"]), 100);

    assert.equal(map.includes(42), true);
    assert.equal(map.includes(999), false);
  });

  test("should map values", () => {
    const map = new SetMap<string, number>();
    map.set(new Set(["a"]), 2);
    map.set(new Set(["b"]), 4);

    const mapped = map.map((v) => v * 2);
    assert.deepEqual(mapped.sort(), [4, 8]);
  });

  test("should flatMap values", () => {
    const map = new SetMap<string, number>();
    map.set(new Set(["a"]), 2);
    map.set(new Set(["b"]), 3);

    const flattened = map.flatMap((v) => [v, v * 2]);
    assert.equal(flattened.length, 4);
  });

  test("should mapOver to new SetMap", () => {
    const map = new SetMap<string, number>();
    map.set(new Set(["a"]), 2);
    map.set(new Set(["b"]), 4);

    const mapped = map.mapOver((v) => v * 2);
    assert.equal(mapped.size, 2);
    assert.equal(mapped.get(new Set(["a"])), 4);
    assert.equal(mapped.get(new Set(["b"])), 8);
  });

  test("should reduce values", () => {
    const map = new SetMap<string, number>();
    map.set(new Set(["a"]), 2);
    map.set(new Set(["b"]), 4);
    map.set(new Set(["c"]), 6);

    const sum = map.reduce((acc, v) => acc + v, 0);
    assert.equal(sum, 12);
  });

  test("should reduceRight values", () => {
    const map = new SetMap<string, string>();
    map.set(new Set(["a"]), "A");
    map.set(new Set(["b"]), "B");

    const result = map.reduceRight((acc, v) => acc + v, "");
    assert.ok(result.includes("A"));
    assert.ok(result.includes("B"));
  });
});
