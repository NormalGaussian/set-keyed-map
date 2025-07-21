# Bug: mapOver() Method Creates Broken SetMap Instance

## Description

The `mapOver()` method (lines 250-259 in `index.ts`) creates a new SetMap instance and populates it using `result.set(key, value)`, but this creates a broken SetMap where the `subkeyToKeys` index is never populated. This makes the mapped SetMap completely non-functional for its core operations.

## Root Cause

The `mapOver()` method creates a new SetMap and calls `set()` on it, but since the `set()` method itself has the bug where it doesn't update `subkeyToKeys`, the mapped SetMap instance is broken from the start.

```typescript
mapOver<T>(
  callbackfn: (value: V, key: K, map: SetMap<KT, V, K>) => T,
  thisArg?: any,
): SetMap<KT, T, K> {
  const result = new SetMap<KT, T, K>();
  for (const [key, value] of this.entries()) {
    result.set(key, callbackfn.call(thisArg, value, key, this));  // BUG: This doesn't populate subkeyToKeys
  }
  return result;  // Returns broken SetMap
}
```

## Impact

**Severity: High** - Any use of `mapOver()` returns a broken SetMap.

- Mapped SetMaps cannot find any keys using `get()`, `has()`, or `delete()`
- Only works with exact object reference matches
- Cascading failure when chaining operations

## Example Demonstrating the Bug

```typescript
const map = new SetMap<string, number>();
map.set(new Set(['a', 'b']), 10);
map.set(new Set(['c', 'd']), 20);

// Map all values by doubling them
const doubled = map.mapOver((value) => value * 2);

// These should work but fail:
console.log(doubled.has(new Set(['a', 'b']))); // Returns false, should be true
console.log(doubled.get(new Set(['b', 'a']))); // Returns undefined, should be 20
console.log(doubled.get(new Set(['c', 'd']))); // Returns undefined, should be 40
```

## Dependency

This bug is **dependent on fixing the primary `set()` method bug** described in `bug-missing-subkey-index.md`. Once the `set()` method properly updates `subkeyToKeys`, the `mapOver()` method will automatically work correctly.

## Required Fix

No direct fix needed for `mapOver()` - fixing the `set()` method will resolve this issue since `mapOver()` correctly uses `set()` to populate the new instance.

## Test Coverage

This bug affects:
- Any test that uses `mapOver()` followed by `get()`, `has()`, or `delete()`
- Integration tests that chain SetMap operations