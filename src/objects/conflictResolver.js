class ConflictResolver {
  constructor(conflictManagementConfig) {
    this.dependencyMap = this.initializeDependencyMap(conflictManagementConfig);
    this.deferredSlots = new Set();
  }
  initializeDependencyMap(conflictManagementJson) {
    const queue = new Map();
    Object.keys(conflictManagementJson).map((key, value) => {
      let rules = conflictManagementJson[key];
      if (rules) {
        rules = rules.filter((item) => item.onsize && item.avoid);
      }
      queue.set(key, {
        id: key,
        rules,
        resolvedWith: null,
      });
      return this;
    });
    return queue;
  }

  updateResolvedSlot(adSlotId, resolvedSize) {
    if (!adSlotId) {
      throw new Error('updateResolvedSlot must be called with an adSlotId!');
    }
    if (!resolvedSize) {
      throw new Error('updateResolvedSlot must be called with a resolved size!');
    }
    if (this.dependencyMap.has(adSlotId)) {
      this.dependencyMap.get(adSlotId).resolvedWith = resolvedSize;
    }
  }


  isBlocked(adSlotId) {
    if (!adSlotId) {
      throw new Error('isBlocked must be called with an adSlotId!');
    }
    let isBlocked = false;
    for (const adSlotKey of this.dependencyMap.keys()) {
      const adSlot = this.dependencyMap.get(adSlotKey);
      for (const adSlotRule of adSlot.rules) {
        // Found rule specific to our target
        if (adSlotRule.avoid === adSlotId) {
          const parentResolvedWith = adSlot.resolvedWith;
          // Fail fast: parent is not resolved yet - unknown returned size.
          if (!parentResolvedWith) {
            isBlocked = true;
            this.deferredSlots.add(adSlotId);
          }
          if (adSlotRule.onsize.split(',').find(sizeString => { // eslint-disable-line
            const size = sizeString.split('x').map(numberStr => parseInt(numberStr, 10));
            return this.arraysEqual(size, parentResolvedWith);
          })) {
            // Block found
            this.deferredSlots.add(adSlotId);
            isBlocked = true;
          }
        }
      }
    }
    return isBlocked;
  }

  isBlocking(adSlotId) {
    if (!adSlotId) {
      throw new Error('isBlocking must be called with an adSlotId!');
    }
    let isBlocking = false;
    for (const adSlotKey of this.dependencyMap.keys()) {
      if (adSlotKey === adSlotId) {
        isBlocking = true;
      }
    }
    return isBlocking;
  }

  /**
   * Gets an array of adSlot Ids for a given adSlotId, that are dependent on (blocked by)
   * @param {String} adSlotId - the blocking slot id
   * @return {Array} an array of blocked slot, that has a dependency on the given slot
   */
  getBlockedSlotsIds(adSlotId) {
    let result;
    if (this.dependencyMap.has(adSlotId)) {
      result = Array.from(this.dependencyMap.get(adSlotId).rules.map(adSlot => adSlot.avoid));
    }
    return result || [];
  }

  arraysEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}
ConflictResolver.EMPTY_SIZE = [];
export default ConflictResolver;
