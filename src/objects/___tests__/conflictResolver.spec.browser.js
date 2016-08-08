import ConflictResolver from '../../objects/conflictResolver';
import globalConfig from '../../__tests__/globalConfig.mock';

const conflictManagementConfig = globalConfig.conflictManagementConfig;

describe('conflictResolver', () => {
  let conflictResolver;
  before(() => {
    conflictResolver = new ConflictResolver(conflictManagementConfig);
  });

  it('should not throw an error', () => {
    /* eslint-disable no-new */
    expect(() => { new ConflictResolver(conflictManagementConfig); }).to.not.throw(Error);
    /* eslint-enable no-new */
  });

  it('should be a object', () => {
    expect(conflictResolver).to.be.an('object');
  });

  it('should not have a configuration ', () => {
    expect(conflictResolver.config).to.not.be.an('object');
  });

  it('should not have a deferredSlots set ', () => {
    expect(conflictResolver.deferredSlots).to.deep.equal(new Set());
  });

  describe(' initializeDependencyMap', () => {
    before(() => {
      conflictResolver = new ConflictResolver(conflictManagementConfig);
    });

    it(' should be a Map', () => {
      expect(conflictResolver.initializeDependencyMap(conflictManagementConfig)).to.be.a('Map');
    });

    it('should be a Map with a single entry', () => {
      const keys = Array.from(conflictResolver.dependencyMap.keys());
      expect(keys).to.have.lengthOf(1);
    });

    it('should properly init the dependencyMap rules', () => {
      const values = Array.from(conflictResolver.dependencyMap.values());
      expect(values[0].rules).to.have.lengthOf(2);
    });
  });

  describe('updateResolvedSlot', () => {
    it('should properly define a \'updateResolvedSlot\' method on \'conflictResolver\'', () => {
      expect(conflictResolver.updateResolvedSlot).to.be.a('function');
    });

    it('should throw an error when called without an \'adSlotId\' parameter', () => {
      expect(() => conflictResolver.updateResolvedSlot('970x250')).to.throw(Error);
    });

    it('should throw an error when called without an \'resolvedSize\' parameter', () => {
      expect(() => conflictResolver.updateResolvedSlot('haaretz.co.il.web.halfpage.floating_x'))
        .to.throw(Error);
    });

    it('should not throw an error when called with both parameters',
      () => {
        expect(() => conflictResolver.updateResolvedSlot('haaretz.co.il.web.plazma', [970, 250]))
          .to.not.throw(Error);
      });

    it('should not throw an error when called with an undefined node',
      () => {
        expect(() => conflictResolver.updateResolvedSlot('haaretz.co.il.web.halfpage.floating_x',
          [970, 250])).to.not.throw(Error);
      });

    it('should return \'isBlocked=true\' on an blocked node', () => {
      expect(conflictResolver.isBlocked('haaretz.co.il.web.ruler')).to.be.true();
    });

    it('should return \'isBlocked=false\' on an unblocked node', () => {
      expect(conflictResolver.isBlocked('haaretz.co.il.web.plazma')).to.be.false();
    });
  });

  describe('isBlocked', () => {
    before(() => {
      conflictResolver = new ConflictResolver(conflictManagementConfig);
    });
    it('should properly define a \'isBlocked\' method on \'conflictResolver\'', () => {
      expect(conflictResolver.isBlocked).to.be.a('function');
    });

    it('should throw an error when called without an \'adSlotId\' parameter', () => {
      expect(() => { new ConflictResolver(conflictManagementConfig).isBlocked(); }).to.throw(Error);
    });

    it('should not throw an error when called with a parameter', () => {
      expect(() => { conflictResolver.isBlocked('haaretz.co.il.web.plazma'); }).to.not.throw(Error);
    });

    it('should return \'isBlocked=true\' on an blocked node', () => {
      expect(conflictResolver.isBlocked('haaretz.co.il.web.ruler')).to.be.true();
    });

    it('once \'isBlocked returns true on an unresolved node, it adds it to the deferred slots Set',
      () => {
        expect(Array.from(conflictResolver.deferredSlots)).to.have.lengthOf(1);
      });

    it('should not add duplicate entries to the to the \'blocked\' deferred slots set', () => {
      conflictResolver.isBlocked('haaretz.co.il.web.ruler');
      expect(Array.from(conflictResolver.deferredSlots)).to.have.lengthOf(1);
    });

    it('should only add new, unique entries to the \'blocked\' deferred slots set', () => {
      conflictResolver.isBlocked('haaretz.co.il.web.halfpage.floating_x');
      expect(Array.from(conflictResolver.deferredSlots)).to.have.lengthOf(2);
    });

    it('should only add blocked slot id entries to the set', () => {
      conflictResolver.isBlocked('haaretz.co.il.web.plazma');
      expect(Array.from(conflictResolver.deferredSlots)).to.have.lengthOf(2);
    });

    it('should return \'isBlocked=false\' on an unblocked node', () => {
      expect(conflictResolver.isBlocked('haaretz.co.il.web.plazma')).to.be.false();
    });

    it('should keep blocking after blocking node was resolved with a blocking size',
      () => {
        conflictResolver.updateResolvedSlot('haaretz.co.il.web.ruler', '970x250');
        expect(conflictResolver.isBlocked('haaretz.co.il.web.ruler')).to.be.true();
      });

    it('should release a block after blocking node was resolved with a permitted size',
      () => {
        conflictResolver = new ConflictResolver(conflictManagementConfig); // clean side effects
        conflictResolver.updateResolvedSlot('haaretz.co.il.web.plazma', '250x250');
        expect(conflictResolver.isBlocked('haaretz.co.il.web.ruler')).to.be.false();
      });
  });

  describe('isBlocking', () => {
    before(() => {
      conflictResolver = new ConflictResolver(conflictManagementConfig);
    });
    it('should properly define a \'isBlocking\' method on \'conflictResolver\'', () => {
      expect(conflictResolver.isBlocking).to.be.a('function');
    });

    it('should throw an error when called without an \'adSlotId\' parameter', () => {
      expect(() => { conflictResolver.isBlocking(); }).to.throw(Error);
    });

    it('should not throw an error when called with a parameter', () => {
      expect(() => { conflictResolver.isBlocking('haaretz.co.il.web.plazma'); })
        .to.not.throw(Error);
    });

    it('should return \'isBlocking=true\' on a blocking node', () => {
      expect(conflictResolver.isBlocking('haaretz.co.il.web.plazma')).to.be.true();
    });
    it('should return \'isBlocked=false\' on an none blocking node', () => {
      expect(conflictResolver.isBlocking('haaretz.co.il.web.ruler')).to.be.false() &&
      expect(conflictResolver.isBlocking('haaretz.co.il.web.halfpage.floating_x')).to.be.false();
    });
    it('should return \'isBlocked=false\' on an none existing node', () => {
      expect(conflictResolver.isBlocking('haaretz.co.il.web.promotional.big.box.2')).to.be.false();
    });
  });
});
