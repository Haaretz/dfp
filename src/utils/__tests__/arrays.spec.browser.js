import { arraysEqual } from '../arrays';

describe('arraysEqual', () => {
  it('should be a function ', () => {
    expect(arraysEqual).to.be.a('function');
  });

  it('should not throw an error when called without parameters', () => {
    expect(() => { arraysEqual(); }).to.not.throw(Error);
  });

  it('should not throw an error when called with a single parameter', () => {
    expect(() => arraysEqual([1])).to.not.throw(Error);
  });

  it('should return true when called with an array object reference', () => {
    const arr = [970, 250, 150];
    expect(arraysEqual(arr, arr)).to.be.true();
  });

  it('should return false when called with a non-array object reference', () => {
    const arr = 'aba';
    expect(arraysEqual(arr, arr)).to.be.false();
  });

  it('should return true on two equal arrays', () => {
    expect(arraysEqual([970, 250], [970, 250])).to.be.true();
  });

  it('should return false on two none length-equal arrays', () => {
    expect(arraysEqual([970, 250], [970])).to.be.false();
  });

  it('should compare without type coercion', () => {
    expect(arraysEqual([970, 250, 0], [970, 250, '0'])).to.be.false();
  });

  it('should return false on two none equal arrays (order matters)', () => {
    expect(arraysEqual([970, 250], [250, 970])).to.be.false();
  });
});
