import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const sha1 = require('sha1');

class AuthController {
  static decodeBase64(base64String) {
	  return Buffer.from(base64String, 'base64').toString('utf8');
  }

  static async getConnect(req, res) {
    try {
      // Extract the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Decode the Base64 encoded credentials
      const base64Credentials = authHeader.split(' ')[1];
      const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
      const [email, password] = decodedCredentials.split(':');

      if (!email || !password) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the user in the database
      const users = dbClient.client.db(dbClient.database).collection('users');
      const user = await users.findOne(
        { email, password: sha1(password) },
        { projection: { _id: 1 } }, // Only return the user's ID
      );

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a token and store it in Redis
      const token = uuidv4();
      const redisKey = `auth_${token}`;
      const expiration = 24 * 60 * 60; // 24 hours in seconds
      await redisClient.set(redisKey, user._id.toString(), expiration);

      // Return the token
      return res.status(200).json({ token });
    } catch (error) {
      console.error(`AuthController Error: ${error.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    try {
      const user = await redisClient.get(`auth_${req.headers['x-token']}`);
      if (user) {
        redisClient.del(`auth_${req.headers['x-token']}`);
        res.status(204).json({});
      } else throw Error('Unauthorized');
    } catch (error) {
      if (error.message === 'Unauthorized') res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

export default AuthController;
