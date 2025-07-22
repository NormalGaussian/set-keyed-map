import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { SetMap } from "../index.ts";

describe("SetMap - Basic Map functionality", () => {
  test("should create empty SetMap", () => {
    const map = new SetMap<string, number>();
    assert.equal(map.size, 0);
  });

  test("should set and get values", () => {
    const map = new SetMap<string, number>();
    const key = new Set(["a", "b"]);
    map.set(key, 42);

    assert.equal(map.get(key), 42);
    assert.equal(map.size, 1);
  });

  test("should handle equivalent keys", () => {
    const map = new SetMap<string, number>();
    const key1 = new Set(["a", "b"]);
    const key2 = new Set(["b", "a"]);

    map.set(key1, 42);
    assert.equal(map.get(key2), 42);
    assert.equal(map.size, 1);
  });

  test("should update existing values", () => {
    const map = new SetMap<string, number>();
    const key = new Set(["a", "b"]);

    map.set(key, 42);
    map.set(key, 100);

    assert.equal(map.get(key), 100);
    assert.equal(map.size, 1);
  });

  test("should check if key exists", () => {
    const map = new SetMap<string, number>();
    const key1 = new Set(["a", "b"]);
    const key2 = new Set(["c", "d"]);

    map.set(key1, 42);

    assert.equal(map.has(key1), true);
    assert.equal(map.has(key2), false);
  });

  test("should delete keys", () => {
    const map = new SetMap<string, number>();
    const key = new Set(["a", "b"]);

    map.set(key, 42);
    assert.equal(map.delete(key), true);
    assert.equal(map.has(key), false);
    assert.equal(map.size, 0);
  });

  test("should return false when deleting non-existent key", () => {
    const map = new SetMap<string, number>();
    const key = new Set(["a", "b"]);

    assert.equal(map.delete(key), false);
  });

  test("should clear all entries", () => {
    const map = new SetMap<string, number>();
    map.set(new Set(["a", "b"]), 42);
    map.set(new Set(["c", "d"]), 100);

    map.clear();
    assert.equal(map.size, 0);
  });

  test("should return undefined for non-existent keys", () => {
    const map = new SetMap<string, number>();
    assert.equal(map.get(new Set(["nonexistent"])), undefined);
  });

  test("should handle Symbol.toStringTag", () => {
    const map = new SetMap<string, number>();
    assert.equal(map[Symbol.toStringTag], "SetMap");
  });

  test("should handle Symbol.dispose", () => {
    const map = new SetMap<string, number>();
    map.set(new Set(["a"]), 42);

    map[Symbol.dispose]();
    assert.equal(map.size, 0);
  });
});
