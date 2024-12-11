import { expect } from 'chai';
import sinon from 'sinon';
import dbClient from '../utils/dbClient'; // Adjust path as needed
import MongoClient from 'mongodb/lib/mongo_client';

describe('DBClient', () => {
  let mockDb;
  let mockCollection;

  beforeEach(() => {
    // Mock MongoDB methods
    mockCollection = {
      countDocuments: sinon.stub(),
    };

    mockDb = {
      collection: sinon.stub().returns(mockCollection),
    };

    sinon.stub(MongoClient.prototype, 'connect').resolves();
    sinon.stub(MongoClient.prototype, 'db').returns(mockDb);
    sinon.stub(MongoClient.prototype, 'isConnected').returns(true); // Mock connection status
  });

  afterEach(() => {
    sinon.restore(); // Restore all mocked methods
  });

  describe('isAlive', () => {
    it('should return true if the client is connected', () => {
      expect(dbClient.isAlive()).to.be.true;
    });

    it('should return false if the client is not connected', () => {
      MongoClient.prototype.isConnected.returns(false); // Mock disconnected state
      expect(dbClient.isAlive()).to.be.false;
    });
  });

  describe('nbUsers', () => {
    it('should return the correct number of users', async () => {
      mockCollection.countDocuments.resolves(5); // Mock a successful count

      const userCount = await dbClient.nbUsers();
      expect(userCount).to.equal(5);
      expect(mockDb.collection.calledOnceWith('users')).to.be.true; // Verify correct collection
    });

    it('should return null and log an error if countDocuments fails', async () => {
      const error = new Error('Failed to count users');
      mockCollection.countDocuments.rejects(error); // Mock a failed count
      const consoleSpy = sinon.spy(console, 'log');

      const userCount = await dbClient.nbUsers();
      expect(userCount).to.be.null;
      expect(consoleSpy.calledWith(sinon.match(`nbUsers Error: ${error.message}`))).to.be.true;

      consoleSpy.restore();
    });
  });

  describe('nbFiles', () => {
    it('should return the correct number of files', async () => {
      mockCollection.countDocuments.resolves(10); // Mock a successful count

      const fileCount = await dbClient.nbFiles();
      expect(fileCount).to.equal(10);
      expect(mockDb.collection.calledOnceWith('files')).to.be.true; // Verify correct collection
    });

    it('should return null and log an error if countDocuments fails', async () => {
      const error = new Error('Failed to count files');
      mockCollection.countDocuments.rejects(error); // Mock a failed count
      const consoleSpy = sinon.spy(console, 'log');

      const fileCount = await dbClient.nbFiles();
      expect(fileCount).to.be.null;
      expect(consoleSpy.calledWith(sinon.match(`nbFiles Error: ${error.message}`))).to.be.true;

      consoleSpy.restore();
    });
  });
});
