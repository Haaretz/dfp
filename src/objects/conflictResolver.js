/*global conflicManagementJson, conflictManagementJson*/
export default class ConflictResolver {
  constructor() {
    this.blockingQueue = this.initQueueFromJson();
  }
  initQueueFromJson() {
    let queue = [];
    const conflictManagementJson = window.conflicManagementJson || window.conflictManagementJson || {};
    //Typo in original code. //TODO fix typo

    Object.keys(conflictManagementJson).map(function(key, value) {
      let rules = conflictManagementJson[key];
      if(rules) {
       rules = rules.filter((item) => item.onsize && item.avoid);
      }
      queue.push({
        id: key,
        rules: rules,
        resolvedWith: null
      })
    });
    return queue;
  }

  updateResolvedSlot(adSlotId,resolvedSize) {
    if(!adSlotId) {
      throw new Error("updateResolvedSlot must be called with an adSlotId!");
    }
    if(!resolvedSize) {
      throw new Error("updateResolvedSlot must be called with a resolved size!");
    }
    for(const adSlot of this.blockingQueue) {
      if(adSlot.id = adSlotId) {
        adSlot.resolvedWith = resolvedSize; //Size, i.e. 1280x200
      }
    }
  }

  isBlocked(adSlotId) {
    if(!adSlotId) {
      throw new Error("isBlocked must be called with an adSlotId!");
    }
    let isBlocked = false;
    for(const adSlot of this.blockingQueue) {
      for(const adSlotRule of adSlot.rules) {
        //Found rule specific to our target
        if(adSlotRule.avoid === adSlotId) {
          const parentResolvedWith = adSlot.resolvedWith;
          // Fail fast: parent is not resolved yet - unknown returned size.
          if(!parentResolvedWith) {
            isBlocked = true;
          }
          if(adSlotRule.onsize.split(',').find(size => size === parentResolvedWith)) {
            //Block found
            isBlocked = true;
          }
        }
      }
    }
    return isBlocked;
  }
}
