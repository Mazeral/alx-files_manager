import uuidv4 from 'uuidv4';
import { sha1 } from 'js-sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    try {
      if (!req.email) {
        throw Error('Email missing');
      }
      if (!req.password) {
        throw Error('Password missing');
      }
      const users = dbClient.client.db(dbClient.database).collection('users');
      const user = await users.findOne({ email: req.emai, password: sha1(req.password) },
        { projection: { email: 1, _id: 1 } });
      if (!user) {
        throw Error('Unauthorized');
      } else {
        const token = uuidv4();
        const day = 86400;
        redisClient.set(`auth_${token}`, user._id, day);
        res.status(200).json({ token });
      }
    } catch (error) {
      if (error.message === 'Unauthorized') {
        console.log(`AuthController Error: ${error.message}`);
        res.status(401).json({ error: 'Unauthorized' });
      }
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
