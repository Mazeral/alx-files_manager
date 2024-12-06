import { createClient } from 'redis';

class RedisClient {
  constructor() {
    const localhost = '127.0.0.1';
    this.client = createClient({
      host: localhost,
      port: 6379,
    });
    this.client.on('error', (error) => {
      console.log(`Error: ${error.message}`);
    });
  }

  isAlive() {
    const status = this.client.on('connect', () => true);
    if (status) return true;
    return false;
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.log(`Error on get: ${error.message}`);
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      const expire = { EX: duration.toString() };
      const result = await this.client.set(key, value, expire);
      return result;
    } catch (error) {
      console.log(`Error: ${error.message}`);
      return false;
    }
  }

  async del(key) {
    try {
      const value = await this.client.del(key);
      return value;
    } catch (error) {
      console.log(`Error on del: ${error.message}`);
      return false;
    }
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
