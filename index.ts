export class SetKeyedMap<KT, V, K extends Set<KT> = Set<KT>>
  implements Map<K, V>
{
  private valueMap = new Map<K, V>();
  private subkeyToKeys = new Map<KT, K[]>();

  /** Number of entries pairs in the map. */
  get size() {
    return this.valueMap.size;
  }

  /** Removes all entries. */
  clear() {
    this.valueMap.clear();
    this.subkeyToKeys.clear();
  }

  /** Finds the canonical key, or false if not found. */
  private getCannonicalKey(key: K): K | false {
    /**
     * A key is a set of subkeys.
     *
     * The subkeyToKeys map has a list of canonical keys that contain each subkey.
     *
     * We search subkeyToKeys for a key that contains all subkeys, and no more. That
     *  is the canonical key.
     *
     * If that key isn't found, then it isn't in the map.
     */

    if (this.valueMap.has(key)) {
      // If the key is already in the map, then it is the canonical key
      return key;
    }

    // Convert the keys to its subkeys
    const subkeys = Array.from(key);

    // Select all the potential canonical keys which have the right number of subkeys
    const potentialCanonicalKeys = subkeys
      .map((subkey) => this.subkeyToKeys.get(subkey))
      .map((keys) => {
        return keys?.filter((key) => key.size === subkeys.length) ?? [];
      });

    // Order the array so that the subkey with the fewest potential canonical keys is first,
    //  this might speed up the search.
    potentialCanonicalKeys.sort((a, b) => (a?.length ?? 0) - (b?.length ?? 0));

    // Ensure that there is a chance of finding a key
    const firstSubkeys = potentialCanonicalKeys[0];
    if (!firstSubkeys) {
      // This will only happen if the key has no members
      // TODO: should we support the empty set?
      return false;
    }

    // If a key is found in *every* potential subkey list, then it is the canonical key
    for (const key of firstSubkeys) {
      if (potentialCanonicalKeys.every((keys) => keys.includes(key))) {
        return key;
      }
    }

    // If no key is found in every list, then the key is not in the map
    return false;
  }

  /** Creates a new canonical key from an existing set. */
  private createCanonicalKey(from: K): K {
    return new Set(Array.from(from)) as K;
  }
  /** Creates a new user-facing key copy. */
  private createUserFacingKey(from: K): K {
    return new Set(Array.from(from)) as K;
  }

  /** Associates a value with this key in this set. */
  set(key: K, value: V): this {
    const existingCanonicalKey = this.getCannonicalKey(key);

    if (existingCanonicalKey) {
      // Update existing key
      this.valueMap.set(existingCanonicalKey, value);
    } else {
      // Create new key and populate subkeyToKeys index
      const canonicalKey = this.createCanonicalKey(key);
      this.valueMap.set(canonicalKey, value);

      // Update subkeyToKeys index for each subkey in the canonical key
      for (const subkey of canonicalKey) {
        const keyList = this.subkeyToKeys.get(subkey) || [];
        keyList.push(canonicalKey);
        this.subkeyToKeys.set(subkey, keyList);
      }
    }

    return this;
  }

  /** Removes the entry. Returns true if an entry was removed. */
  delete(key: K) {
    const canonicalKey = this.getCannonicalKey(key);
    if (!canonicalKey) {
      // If there is no canonical key, then the key is not in the map :. false
      return false;
    }
    // As the key is present, each subkey must have a reference to it in the subkeyToKeys map
    //  and this reference must be removed.
    for (const subkey of canonicalKey) {
      // Retrieve and replace the list of keys that contain this subkey, removing the canonical key
      const keylist = this.subkeyToKeys.get(subkey);
      if (!keylist) {
        // This should not happen, as the canonical key did exist. This check is for TS.
        continue;
      }
      // Remove the canonical key from the list
      const newkeylist = keylist.filter((k) => k !== canonicalKey);
      if (newkeylist.length) {
        // Update the list
        this.subkeyToKeys.set(subkey, newkeylist);
      } else {
        // If the list is empty, then remove the subkey from the map
        this.subkeyToKeys.delete(subkey);
      }
    }
    // Remove the canonical key from the map
    this.valueMap.delete(canonicalKey);
    // A key was deleted :. true
    return true;
  }

  /** Returns the value, or undefined if not found. */
  get(key: K): V | undefined {
    // Get the canonical key representation for this key
    const canonicalKey = this.getCannonicalKey(key);
    if (!canonicalKey) {
      // If there is no canonical key, then the key is not in the map
      return undefined;
    }
    return this.valueMap.get(canonicalKey);
  }

  /** Returns true if an entry exists. */
  has(key: K): boolean {
    // Get the canonical key representation for this key
    const canonicalKey = this.getCannonicalKey(key);
    if (!canonicalKey) {
      // If there is no canonical key, then the key is not in the map
      return false;
    }
    return this.valueMap.has(canonicalKey);
  }

  /** Iterator over all set keys. */
  *keys(): MapIterator<K> {
    for (const key of this.valueMap.keys()) {
      yield this.createUserFacingKey(key);
    }
  }

  /** Iterator over all values. */
  *values(): MapIterator<V> {
    yield* this.valueMap.values();
  }

  /** Iterator over all key-value pairs. */
  *entries(): MapIterator<[K, V]> {
    for (const [key, value] of this.valueMap.entries()) {
      yield [this.createUserFacingKey(key), value];
    }
  }

  [Symbol.iterator](): MapIterator<[K, V]> {
    return this.entries();
  }

  [Symbol.toStringTag] = "SetKeyedMap";

  [Symbol.dispose](): void {
    this.clear();
  }

  /** Executes a callback for each entry. */
  forEach(
    callbackfn: (value: V, key: K, map: SetKeyedMap<KT, V, K>) => void,
    thisArg?: any,
  ): void {
    for (const [key, value] of this.entries()) {
      callbackfn.call(thisArg, value, key, this);
    }
  }

  /** Tests whether all entries pass the provided predicate. */
  every(
    callbackfn: (value: V, key: K, map: SetKeyedMap<KT, V, K>) => boolean,
    thisArg?: any,
  ): boolean {
    for (const [key, value] of this.entries()) {
      if (!callbackfn.call(thisArg, value, key, this)) {
        return false;
      }
    }
    return true;
  }

  /** Returns a new SetKeyedMap with entries that pass the predicate. */
  filter(
    callbackfn: (value: V, key: K, map: SetKeyedMap<KT, V, K>) => boolean,
    thisArg?: any,
  ): SetKeyedMap<KT, V, K> {
    const result = new SetKeyedMap<KT, V, K>();
    for (const [key, value] of this.entries()) {
      if (callbackfn.call(thisArg, value, key, this)) {
        result.set(key, value);
      }
    }
    return result;
  }

  /** Tests whether at least one entry passes the predicate. */
  some(
    callbackfn: (value: V, key: K, map: SetKeyedMap<KT, V, K>) => boolean,
    thisArg?: any,
  ): boolean {
    for (const [key, value] of this.entries()) {
      if (callbackfn.call(thisArg, value, key, this)) {
        return true;
      }
    }
    return false;
  }

  /** Returns the first entry that matches the predicate. */
  find(
    callbackfn: (value: V, key: K, map: SetKeyedMap<KT, V, K>) => boolean,
    thisArg?: any,
  ): [K, V] | undefined {
    for (const [key, value] of this.entries()) {
      if (callbackfn.call(thisArg, value, key, this)) {
        return [key, value];
      }
    }
    return undefined;
  }

  /** Returns true if any entry has this value. */
  includes(value: V): boolean {
    for (const v of this.values()) {
      if (v === value) {
        return true;
      }
    }
    return false;
  }

  /** Maps entries to an array of transformed values. */
  map<T>(
    callbackfn: (value: V, key: K, map: SetKeyedMap<KT, V, K>) => T,
    thisArg?: any,
  ): T[] {
    const result: T[] = [];
    for (const [key, value] of this.entries()) {
      result.push(callbackfn.call(thisArg, value, key, this));
    }
    return result;
  }

  /** Maps entries to arrays and flattens the result. */
  flatMap<T>(
    callbackfn: (value: V, key: K, map: SetKeyedMap<KT, V, K>) => T[],
    thisArg?: any,
  ): T[] {
    const result: T[] = [];
    for (const [key, value] of this.entries()) {
      result.push(...callbackfn.call(thisArg, value, key, this));
    }
    return result;
  }

  /** Returns a new SetKeyedMap with transformed values. */
  mapOver<T>(
    callbackfn: (value: V, key: K, map: SetKeyedMap<KT, V, K>) => T,
    thisArg?: any,
  ): SetKeyedMap<KT, T, K> {
    const result = new SetKeyedMap<KT, T, K>();
    for (const [key, value] of this.entries()) {
      result.set(key, callbackfn.call(thisArg, value, key, this));
    }
    return result;
  }

  /** Reduces entries to a single value from left to right. */
  reduce<T>(
    callbackfn: (
      previousValue: T,
      value: V,
      key: K,
      map: SetKeyedMap<KT, V, K>,
    ) => T,
    initialValue: T,
  ): T {
    let accumulator = initialValue;
    for (const [key, value] of this.entries()) {
      accumulator = callbackfn(accumulator, value, key, this);
    }
    return accumulator;
  }

  /** Reduces entries to a single value from right to left. */
  reduceRight<T>(
    callbackfn: (
      previousValue: T,
      value: V,
      key: K,
      map: SetKeyedMap<KT, V, K>,
    ) => T,
    initialValue: T,
  ): T {
    let accumulator = initialValue;
    for (const [key, value] of this.entries()) {
      accumulator = callbackfn(accumulator, value, key, this);
    }
    return accumulator;
  }
}
