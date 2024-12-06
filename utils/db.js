import MongoClient from 'mongodb/lib/mongo_client';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = MongoClient(url);
    this.database = database;

    this.client.on('error', (error) => {
      console.error(`MongoDB error: ${error}`);
    });

    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    // returns the number of documents in the collection users
    try {
      const count = await this.client.db(this.database).collection('users').countDocuments();
      return count;
    } catch (error) {
      console.log(`nbUsers Error: ${error.message}`);
      return null;
    }
  }

  async nbFiles() {
    try {
      // returns the number of documents in the collection files
      const countDocs = await this.client.db(this.database).collection('files').countDocuments();
      return countDocs;
    } catch (error) {
      console.log(`nbFiles Error: ${error.message}`);
      return null;
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
