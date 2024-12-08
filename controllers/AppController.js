import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * AppController class with methods to retrieve status and statistics.
 */
class AppController {
  /**
   * Retrieves the status of Redis and database connections.
   * @param {Object} req - The incoming request object.
   * @param {Object} res - The outgoing response object.
   * @returns {Promise<void>}
   */
  static async getStatus(req, res) {
    try {
      const redisAlive = await redisClient.isAlive();
      const dbAlive = await dbClient.isAlive();
      res.status(200).json({ redis: redisAlive, db: dbAlive });
    } catch (error) {
      console.error(`AppController: getStatus error: ${error.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Retrieves statistics about the number of users and files.
   * @param {Object} req - The incoming request object.
   * @param {Object} res - The outgoing response object.
   * @returns {Promise<void>}
   */
  static async getStats(req, res) {
    try {
      const numberOfUsers = await dbClient.nbUsers();
      const numberOfFiles = await dbClient.nbFiles();
      res.status(200).json({ users: numberOfUsers, files: numberOfFiles });
    } catch (error) {
      console.error(`AppController: getStats error: ${error.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AppController;
