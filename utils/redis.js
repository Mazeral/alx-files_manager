// Import the createClient function from the redis library
import { createClient } from 'redis';

/**
 * RedisClient class to handle interactions with a Redis server
 */
class RedisClient {
  /**
   * Constructor to initialize the RedisClient instance
   */
  constructor() {
    // Define the Redis server host and port
    const localhost = '127.0.0.1';
    const port = 6379;

    // Create a new Redis client instance
    this.client = createClient({
      host: localhost,
      port,
    });

    // Bind an error event handler to the client
    this.client.on('error', (error) => {
      console.log(`Redis Error: ${error.message}`);
    });
  }

  /**
   * Check if the Redis client is connected
   * @returns {boolean} True if connected, false otherwise
   */
  isAlive() {
    // Use the ping method to check if the client is connected
    return new Promise((resolve) => {
      this.client.ping((error, reply) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Get the value associated with a key
   * @param {string} key The key to retrieve
   * @returns {Promise<string|null>} The value associated with the key or null if an error occurs
   */
  async get(key) {
    try {
		return await this.get(key);
    } catch (error) {
      console.log(`Error on redis get: ${error.message}`);
      return null;
    }
  }

  /**
   * Set a key-value pair with an optional expiration time
   * @param {string} key The key to set
   * @param {string} value The value to set
   * @param {number} [duration] The expiration time in seconds (optional)
   * @returns {Promise<string|boolean>} The result of the set operation or false if an error occurs
   */
  async set(key, value, duration) {
    try {
      if (duration) {
      // Ensure duration is a valid positive integer
        const parsedDuration = parseInt(duration, 10);
        if (isNaN(parsedDuration) || parsedDuration <= 0) {
          throw new Error(`Invalid duration: ${duration}`);
        }
        // Correct syntax: key, value, 'EX', duration
        const result = await this.client.set(key, value, 'EX', parsedDuration);
        return result;
      }
      // Set without expiration
      const result = await this.client.set(key, value);
      return result;
    } catch (error) {
      console.log(`Error on redis set: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete a key
   * @param {string} key The key to delete
   * @returns {Promise<number|boolean>} The number of deleted keys or false if an error occurs
   */
  async del(key) {
    try {
      // Use the del method to delete the key
      const value = await this.client.del(key);
      return value;
    } catch (error) {
      console.log(`Error on del: ${error.message}`);
      return false;
    }
  }
}

// Create a new RedisClient instance
const redisClient = new RedisClient();

// Export the RedisClient instance
module.exports = redisClient;
