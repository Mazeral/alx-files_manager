// Import the MongoClient class from the mongodb library
import { MongoClient } from 'mongodb';

// Define a class to handle interactions with the MongoDB database
class DBClient {
  /**
   * Constructor to initialize the DBClient instance
   */
  constructor() {
    // Get the database host, port, and database name from environment variables or use defaults
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // Create a MongoDB connection URL
    const url = `mongodb://${host}:${port}`;

    // Create a new MongoClient instance
    this.client = new MongoClient(url);

    // Store the database name
    this.database = database;

    // Bind an error event handler to the client
    this.client.on('error', (error) => {
      console.error(`MongoDB error: ${error}`);
    });

    // Connect to the MongoDB server
    this.client.connect();
  }

  /**
   * Check if the MongoDB client is connected
   * @returns {boolean} True if connected, false otherwise
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Get the number of users in the database
   * @returns {Promise<number|null>} The number of users or null if an error occurs
   */
  async nbUsers() {
    try {
      // Get the count of documents in the 'users' collection
      const count = await this.client.db(this.database).collection('users').countDocuments();
      return count;
    } catch (error) {
      console.log(`nbUsers Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Get the number of files in the database
   * @returns {Promise<number|null>} The number of files or null if an error occurs
   */
  async nbFiles() {
    try {
      // Get the count of documents in the 'files' collection
      const countDocs = await this.client.db(this.database).collection('files').countDocuments();
      return countDocs;
    } catch (error) {
      console.log(`nbFiles Error: ${error.message}`);
      return null;
    }
  }
}

// Create a new DBClient instance
const dbClient = new DBClient();

// Export the DBClient instance
module.exports = dbClient;
