# Bug: filter() Method Creates Broken SetMap Instance

## Description

The `filter()` method (lines 182-193 in `index.ts`) creates a new SetMap instance and populates it using `result.set(key, value)`, but this creates a broken SetMap where the `subkeyToKeys` index is never populated. This makes the filtered SetMap completely non-functional for its core operations.

## Root Cause

The `filter()` method creates a new SetMap and calls `set()` on it, but since the `set()` method itself has the bug where it doesn't update `subkeyToKeys`, the filtered SetMap instance is broken from the start.

```typescript
filter(
  callbackfn: (value: V, key: K, map: SetMap<KT, V, K>) => boolean,
  thisArg?: any,
): SetMap<KT, V, K> {
  const result = new SetMap<KT, V, K>();
  for (const [key, value] of this.entries()) {
    if (callbackfn.call(thisArg, value, key, this)) {
      result.set(key, value);  // BUG: This doesn't populate subkeyToKeys
    }
  }
  return result;  // Returns broken SetMap
}
```

## Impact

**Severity: High** - Any use of `filter()` returns a broken SetMap.

- Filtered SetMaps cannot find any keys using `get()`, `has()`, or `delete()`
- Only works with exact object reference matches
- Cascading failure when chaining operations

## Example Demonstrating the Bug

```typescript
const map = new SetMap<string, number>();
map.set(new Set(['a', 'b']), 1);
map.set(new Set(['c', 'd']), 2);

// Filter to only keep values > 1
const filtered = map.filter((value) => value > 1);

// These should work but fail:
console.log(filtered.has(new Set(['c', 'd']))); // Returns false, should be true
console.log(filtered.get(new Set(['d', 'c']))); // Returns undefined, should be 2
```

## Dependency

This bug is **dependent on fixing the primary `set()` method bug** described in `bug-missing-subkey-index.md`. Once the `set()` method properly updates `subkeyToKeys`, the `filter()` method will automatically work correctly.

## Required Fix

No direct fix needed for `filter()` - fixing the `set()` method will resolve this issue since `filter()` correctly uses `set()` to populate the new instance.

## Test Coverage

This bug affects:
- Any test that uses `filter()` followed by `get()`, `has()`, or `delete()`
- Integration tests that chain SetMap operations