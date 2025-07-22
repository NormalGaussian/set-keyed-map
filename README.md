# SetKeyedMap

A map where the keys are Sets. Any two equivalent sets map to the same key, even when they are different objects.

This is useful for grouping and caching over select properties in an environment where the Set object is not necessarily shared.

## Features

- **Set-based Keys**: Use Sets as keys in a Map-like interface
- **The Key is the Set Content**: Different Set instances with equivalent elements are matching keys
- **Full Map Interface**: Implements the complete Map interface
- **Array-like Interface**: Implements additional array-like methods
- **Type Safe**: Full TypeScript support with generic type parameters

## Usage

```typescript
import { SetKeyedMap } from "set-keyed-map";

const setKeyedMap = new SetKeyedMap<string, number>();

const key1 = new Set(["a", "b", "c"]);
const key2 = new Set(["a", "b", "c"]); // Different object, equivalent elements

setKeyedMap.set(key1, 100);

// These are equivalent - both return 100
console.log(setKeyedMap.get(key1)); // 100
console.log(setKeyedMap.get(key2)); // 100

console.log(setKeyedMap.has(key2)); // true
```

## API

### Map Interface

- `set(key, value)` - Add or update a key-value pair
- `get(key)` - Retrieve value by key
- `has(key)` - Check if key exists
- `delete(key)` - Remove key-value pair
- `clear()` - Remove all entries
- `size` - Number of entries
- `keys()`, `values()`, `entries()` - Iterators
- `forEach(callback)` - Iterate over entries

### Array-like Methods

- `every(callback)` - Test if all entries pass condition
- `some(callback)` - Test if any entry passes condition
- `filter(callback)` - Create new SetKeyedMap with filtered entries
- `find(callback)` - Find first entry matching condition
- `includes(value)` - Check if value exists
- `map(callback)` - Map entries to array
- `flatMap(callback)` - Map and flatten entries to array
- `mapOver(callback)` - Map entries to new SetKeyedMap
- `reduce(callback, initial)` - Reduce entries to single value
- `reduceRight(callback, initial)` - Reduce entries right-to-left

## Type Parameters

- `KT` - Type of elements within the Set keys
- `V` - Type of values stored in the map
- `K` - Type of Set keys (defaults to `Set<KT>`)

## License

MIT
