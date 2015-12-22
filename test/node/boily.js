import boily from '../../src';
import chai from 'chai';

const expect = chai.expect;

describe('Boily - unit tests for nodeJS', () => {

    it('should be a object', () => {
        expect(boily).to.be.a.object;
    })

    it('should contain 123', () => {
        expect(boily.foo).to.equal(123);
    })
});