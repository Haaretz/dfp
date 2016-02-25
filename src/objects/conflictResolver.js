class ConflictResolver {

  constructor(config) {
    this.config = config;
    this.rootNode = new ConflictNode({id: null}, null, new Map());
    this.registery = new Map();
  }

  registerNode(conflictNode) {
    if(this.wasNodeRegistered(conflictNode) === false) {
      this.registery.add(conflictNode.id, conflictNode);
      this.findNode(conflictNode.parent).addChildNode()
      return true;
    }
    return false;
  }
  wasNodeRegistered(conflictNode) {
    return this.registery.has(conflictNode.id);
  }
  findNode(conflictNode) {

  }
}


class ConflictNode {
  constructor(nodeConfig, parent, children) {
    this.parent = parent;
    this.children = children;
    this.id = nodeConfig.id;
    this.resolved = false;
  }
  addChildNode(nodeConfig, children) {
    if(!this.children.has(nodeConfig.id)) {
      const child = new ConflictNode(nodeConfig, this, new Map());
      this.children.set(child.id,child);
      return true;
    }
    return false;
  }
  hasAncestor(conflictNodeId) {
    if(conflictNodeId) {
      return this.parent && (this.parent.id == conflictNodeId || this.parent.hasAncestor(conflictNodeId));
    }
    else {
      throw new Error(`conflictNode ${this.id} failed on 'hasAncestor' call: param conflictNodeId must be defined!`);
    }
  }
  hasDescendant(conflictNodeId) {
    let hasDescendant = false;
    if(conflictNodeId) {
      for(let conflictNode of this.children) {
        if(conflictNode.id === conflictNodeId) {
          //Match found, hasDescendant = true
          hasDescendant = true;
          break;
        }
      }
      // Check recursively on children
      if(hasDescendant === false) {
        for(let conflictNode of this.children) {
          if(conflictNode.hasDescendant(conflictNodeId)) {
            hasDescendant = true;
            break;
          }
        }
      }
      // Answer
      return hasDescendant;
    }
    else {
      throw new Error(`conflictNode ${this.id} failed on hasAncestor
       call: param conflictNodeId must be defined!`);
    }
  }
  find(ConflictNode) {
    if(ConflictNode) {

    }
    else {
      throw new Error(`conflictNode ${this.id} failed on 'find' call: param ConflictNode must be defined!`);
    }
  }
}

export default ConflictResolver;
