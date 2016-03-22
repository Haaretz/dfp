import { addHours, addDays } from '../time';

describe(`addHours`, () => {
  before(() => {

  });
  it( `should be a function`, () => {
    expect( addHours).to.be.a('function');
  } );

  it( `should throw an error when called without any parameters`, () => {
    expect( () => addHours()).to.throw(Error);
  } );

  it( `should throw an error when called with a single parameter`, () => {
    expect( () => addHours(new Date())).to.throw(Error);
  } );

  it( `should not throw an error when called with an integer as the 'hours' param`, () => {
    expect( () => addHours(new Date(), 5)).to.not.throw(Error);
  } );

  it( `should not throw an error when called with an string as the 'hours' param`, () => {
    expect( () => addHours(new Date(), '5')).to.not.throw(Error);
  } );

  it( `should not throw an error when called with an float as the 'hours' param`, () => {
    expect( () => addHours(new Date(), 2.515)).to.not.throw(Error);
  } );

  it( `should not throw an error when called with an float-like string as the 'hours' param`, () => {
    expect( () => addHours(new Date(), '2.515')).to.not.throw(Error);
  } );

  it( `should throw an error when called with a NaN object as the 'hours' param`, () => {
    expect( () => addHours(new Date(), 'number')).to.throw(Error);
  } );

  it( `should return a proper date object, with the added hours`, () => {
    const now = new Date();
    const later = new Date(now);
    later.setHours(now.getHours() + 5);
    expect( addHours(now,5).getTime() ).to.equal(later.getTime());
  } );

  it( `should return a proper date object, with the subtracted hours`, () => {
    const now = new Date();
    const later = new Date(now);
    later.setHours(now.getHours() - 5);
    expect( addHours(now,-5).getTime() ).to.equal(later.getTime());
  } );

});


describe(`addDays`, () => {
  before(() => {

  });
  it( `should be a function`, () => {
    expect( addDays).to.be.a('function');
  } );

  it( `should throw an error when called without any parameters`, () => {
    expect( () => addDays()).to.throw(Error);
  } );

  it( `should throw an error when called with a single parameter`, () => {
    expect( () => addDays(new Date())).to.throw(Error);
  } );

  it( `should not throw an error when called with an integer as the 'days' param`, () => {
    expect( () => addDays(new Date(), 5)).to.not.throw(Error);
  } );

  it( `should not throw an error when called with an string as the 'days' param`, () => {
    expect( () => addDays(new Date(), '5')).to.not.throw(Error);
  } );

  it( `should not throw an error when called with an float as the 'days' param`, () => {
    expect( () => addDays(new Date(), 2.515)).to.not.throw(Error);
  } );

  it( `should not throw an error when called with an float-like string as the 'days' param`, () => {
    expect( () => addDays(new Date(), '2.515')).to.not.throw(Error);
  } );

  it( `should throw an error when called with a NaN object as the 'days' param`, () => {
    expect( () => addDays(new Date(), 'number')).to.throw(Error);
  } );

  it( `should return a proper date object, with the added days`, () => {
    const now = new Date();
    const later = new Date(now);
    later.setDate(now.getDate() + 5);
    expect( addDays(now,5).getTime() ).to.equal(later.getTime());
  } );

  it( `should return a proper date object, with the subtracted days`, () => {
    const now = new Date();
    const later = new Date(now);
    later.setDate(now.getDate() - 5);
    expect( addDays(now,-5).getTime() ).to.equal(later.getTime());
  } );

});
