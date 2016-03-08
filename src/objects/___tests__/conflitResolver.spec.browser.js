import ConflictResolver from '../../objects/conflictResolver';

describe( 'conflictResolver', () => {
  let conflictResolver;
  before(() => {
    conflictResolver = new ConflictResolver();
  });

  it( 'should not throw an error', () => {
    expect( conflictResolver ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( conflictResolver ).to.be.an('object');
  } );

  it( 'should not have a configuration ', () => {
    expect( conflictResolver.config ).to.not.be.a.object;
  } );

  describe( ' when conflictResolver initialized correctly' , () => {
    let conflicManagementJson = {
      'haaretz.co.il.web.plazma': [
        { 'onsize': '1280x200,970x250,3x3', 'avoid': 'haaretz.co.il.web.halfpage.floating_x' },
        { 'onsize': '1280x200,970x250,3x3', 'avoid': 'haaretz.co.il.web.ruler' },
        {}
      ]
    };
    window.conflicManagementJson = conflicManagementJson;

    before(() => {
      conflictResolver = new ConflictResolver();
    });

    it( 'should properly init the queue', () => {
      expect( window.conflicManagementJson ).to.be.an('object');
    } );

    it( 'should properly init the blockingQueue', () => {
      expect( conflictResolver.blockingQueue ).to.have.lengthOf(1);
    } );

    it( 'should properly init the blockingQueue rules', () => {
      expect( conflictResolver.blockingQueue[0].rules ).to.have.lengthOf(2);
    } );
    describe(`updateResolvedSlot`, () => {
      it( `should properly define a 'updateResolvedSlot' method on 'conflictResolver'`, () => {
        expect( conflictResolver.updateResolvedSlot).to.be.a('function');
      } );

      it( `should throw an error when called without an 'adSlotId' parameter`, () => {
        expect( () => conflictResolver.updateResolvedSlot('970x250')).to.throw;
      } );

      it( `should throw an error when called without an 'resolvedSize' parameter`, () => {
        expect( () => conflictResolver.updateResolvedSlot('haaretz.co.il.web.halfpage.floating_x'))
          .to.throw;
      } );

      it(`should not throw an error when called with both parameters`,
        () => {
          expect( conflictResolver.updateResolvedSlot('haaretz.co.il.web.plazma','970x250'))
            .to.not.throw;
        } );

      it(`should not throw an error when called with an undefined node`,
        () => {
          expect( conflictResolver.updateResolvedSlot('haaretz.co.il.web.halfpage.floating_x','970x250'))
            .to.not.throw;
        } );

      it( `should return 'isBlocked=true on an blocked node'`, () => {
        expect( conflictResolver.isBlocked('haaretz.co.il.web.ruler')).to.be.true;
      } );

      it( `should return 'isBlocked=false on an unblocked hunode'`, () => {
        expect( conflictResolver.isBlocked('haaretz.co.il.web.plazma')).to.be.false;
      } );
    });

    describe(`isBlocked`, () => {
      before(() => {
        conflictResolver = new ConflictResolver();
      });
      it( `should properly define a 'isBlocked' method on 'conflictResolver'`, () => {
        expect( conflictResolver.isBlocked).to.be.a('function');
      } );

      it( `should throw an error when called without an 'adSlotId' parameter`, () => {
        expect( () => conflictResolver.isBlocked()).to.throw;
      } );

      it( `should not throw an error when called with a parameter`, () => {
        expect( conflictResolver.isBlocked('haaretz.co.il.web.plazma')).to.not.throw;
      } );

      it( `should return 'isBlocked=true on an blocked node'`, () => {
        expect( conflictResolver.isBlocked('haaretz.co.il.web.ruler')).to.be.true;
      } );

      it( `should return 'isBlocked=false on an unblocked node'`, () => {
        expect( conflictResolver.isBlocked('haaretz.co.il.web.plazma')).to.be.false;
      } );

      it(`should keep blocking after blocking node was resolved with a blocking size`,
        () => {
          conflictResolver.updateResolvedSlot('haaretz.co.il.web.ruler', '970x250');
          expect( conflictResolver.isBlocked('haaretz.co.il.web.ruler'))
            .to.be.true;
        } );

      it(`should release a block after blocking node was resolved with a permitted size`,
        () => {
          conflictResolver = new ConflictResolver(); //clean side effects
          conflictResolver.updateResolvedSlot('haaretz.co.il.web.plazma', '250x250');
          expect( conflictResolver.isBlocked('haaretz.co.il.web.ruler'))
            .to.be.false;
        } );
    });

  })

} );
