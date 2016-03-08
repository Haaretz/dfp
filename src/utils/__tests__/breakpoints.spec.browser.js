import { getBreakpoint, debounce} from '../breakpoints';
describe( 'breakpoints ', function() {
  describe( 'debounce', () => {

    it( 'should be a function', () => {
      expect( debounce ).to.be.a('function');
    } );

    it( 'should return a function', () => {
      const debouncedFn = debounce(() => {}, 100);
      expect( debouncedFn ).to.be.a('function');
    } );

    it( 'should return a function that not throw', () => {
      const debouncedFn = debounce(() => {});
      expect( () => { debouncedFn() } ).to.not.throw;
    } );

    it( 'should return a function that not throw', () => {
      const debouncedFn = debounce(() => {});
      expect( () => { debouncedFn() } ).to.not.throw;
    } );

    describe(` debounced function`, () => {
      let spy;
      before(() => {
        const spyedFn = debounce(i => i+1 , 250 );
        spy = sinon.spy(spyedFn);
      });

      it(`should run once`, () => {
        spy();
        expect( spy.calledOnce ).to.be.true;
      });

      it(`should run twice`, () => {
        spy();
        expect( spy.calledTwice ).to.be.true;
      });

      it(`should run thrice`, () => {
        spy();
        expect( spy.calledThrice ).to.be.true;
      })
    });


  });

  describe( 'getBreakpoint', () => {
    before(() => {

    });
    it( 'should be a function', () => {
      expect( getBreakpoint ).to.be.a('function');
    } );

    it( 'should return a number', () => {
      const breakpoint = getBreakpoint();
      //console.log(`Breakpoint is: ${getBreakpoint()}`);
      expect( breakpoint ).to.be.a('number');
    } );

  });

  //describe( 'breakpoints resize spy', () => {
  //  let w;
  //  before(() => {
  //    w = window.open("","","width=100,height=100");
  //    w.document.write(`<script>${debounce}</script>`);
  //    w.document.write(`<script>${getBreakpoint}</script>`);
  //  });
  //  it( 'should be a function', () => {
  //    expect( getBreakpoint ).to.be.a('function');
  //  } );
  //
  //  it( 'should return a number', () => {
  //    const breakpoint = getBreakpoint();
  //    console.log(`Breakpoint is: ${getBreakpoint()}`);
  //    expect( breakpoint ).to.be.a('number');
  //  } );
  //
  //  after(() => {
  //    w.close();
  //  })
  //});
});
