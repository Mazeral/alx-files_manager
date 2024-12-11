import { expect } from 'chai';
import sinon from 'sinon';
import redisClient from '../utils/redis';

describe('redisClient', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve a value for a given key', async () => {
    const redisGetStub = sinon.stub(redisClient, 'get').resolves('test-value');
    const value = await redisClient.get('test-key');
    expect(redisGetStub.calledOnceWith('test-key')).to.be.true;
    expect(value).to.equal('test-value');
  });

  it('should set a value for a given key', async () => {
    const redisSetStub = sinon.stub(redisClient, 'set').resolves('OK');
    const result = await redisClient.set('test-key', 'test-value');
    expect(redisSetStub.calledOnceWith('test-key', 'test-value')).to.be.true;
    expect(result).to.equal('OK');
  });
});
