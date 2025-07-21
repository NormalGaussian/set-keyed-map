# Bug: Missing subkeyToKeys Index Population in set() Method

## Description

The `set()` method in SetMap fails to populate the critical `subkeyToKeys` index when adding new key-value pairs. This causes all retrieval operations (`get()`, `has()`, `delete()`) to fail, making the SetMap essentially non-functional for its intended purpose.

## Root Cause

In the `set()` method (lines 74-81 in `index.ts`), the implementation:

1. ✅ Creates or finds a canonical key 
2. ✅ Stores the value in `valueMap`
3. ❌ **Never updates the `subkeyToKeys` index**

```typescript
set(key: K, value: V): this {
  const canonicalKey: K = this.getCannonicalKey(key) || this.createCanonicalKey(key);
  this.valueMap.set(canonicalKey, value);  // Stores value
  return this;  // BUG: Missing subkeyToKeys update
}
```

The `subkeyToKeys` map is essential for `getCannonicalKey()` to work. It maps each individual element (subkey) to all canonical keys that contain it.

## Impact

**Severity: Critical** - The SetMap is completely non-functional for its core use case.

- `get()` always returns `undefined`
- `has()` always returns `false`  
- `delete()` always returns `false`
- Only works if you use the exact same Set object reference used during insertion

## Example Demonstrating the Bug

```typescript
const map = new SetMap<string, number>();
const key1 = new Set(['a', 'b']);
const key2 = new Set(['b', 'a']); // Same elements, different order

map.set(key1, 42);

// These should work but fail:
console.log(map.get(key2)); // Returns undefined, should return 42
console.log(map.has(key1)); // Returns false, should return true
console.log(map.delete(key1)); // Returns false, should return true

// Only this works:
console.log(map.get(key1)); // Returns 42 (same object reference)
```

## Expected Behavior

Sets with identical elements should be treated as equivalent keys regardless of:
- Element insertion order
- Object reference identity

## Required Fix

The `set()` method must update `subkeyToKeys` when creating a new canonical key:

```typescript
set(key: K, value: V): this {
  const existingCanonicalKey = this.getCannonicalKey(key);
  
  if (existingCanonicalKey) {
    // Update existing key
    this.valueMap.set(existingCanonicalKey, value);
  } else {
    // Create new key and populate subkeyToKeys index
    const canonicalKey = this.createCanonicalKey(key);
    this.valueMap.set(canonicalKey, value);
    
    // CRITICAL: Update subkeyToKeys index
    for (const subkey of canonicalKey) {
      const keyList = this.subkeyToKeys.get(subkey) || [];
      keyList.push(canonicalKey);
      this.subkeyToKeys.set(subkey, keyList);
    }
  }
  
  return this;
}
```

## Test Coverage

This bug is caught by all test files:
- `test/basic.test.ts` - 5 out of 11 tests fail
- `test/array-methods.test.ts` - 2 out of 10 tests fail  
- `test/edge-cases.test.ts` - All 7 tests fail
- `test/iterators.test.ts` - Mostly passes (only uses values already stored)

The comprehensive test suite clearly demonstrates the extent of this critical bug.