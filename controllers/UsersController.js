// Import the SHA-1 hashing library for password encryption
// Import the database client utility
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const sha1 = require('sha1');

/**
 * User controller class for handling user-related operations.
 */
class UserController {
  /**
   * Handles the creation of a new user.
   *
   * @param {Object} req - The request object containing user data.
   * @param {Object} res - The response object for sending responses back to the client.
   */
  static async postNew(req, res) {
    try {
      // Check if the email is missing from the request
      if (!req.body.email) {
        console.log(req.body);
        // Throw an error if the email is missing
        throw Error('Missing Email');
      }
      // Check if the password is missing from the request
      if (!req.body.password) {
        // Throw an error if the password is missing
        throw Error('Missing password');
      }

      // Get a reference to the users collection in the database
      const users = dbClient.client.db(dbClient.database).collection('users');

      // Check if a user with the given email already exists
      const emailExists = await users.findOne({ email: req.body.email });

      // If the email does not exist, create a new user
      if (!emailExists) {
        // Create a new user document with the given email and hashed password
        const document = { email: req.body.email, password: sha1(req.body.password) };

        // Insert the new user document into the database
        const result = await users.insertOne(document);

        // Send a successful response with the new user's email and ID
        res.status(201).json({ email: req.body.email, id: result.insertedId });
      } else {
        // If the email already exists, throw an error
        throw Error('Already exist');
      }
    } catch (error) {
      // Handle errors based on their message
      if (error.message === 'Missing Email') {
        // Send a bad request response for missing email
        res.status(400).json({ error: 'Missing email' });
      } else if (error.message === 'Missing password') {
        // Send a bad request response for missing password
        res.status(400).json({ error: 'Missing password' });
      } else if (error.message === 'Already exist') {
        // Send a bad request response for existing email
        res.status(400).json({ error: 'Already exist' });
      } else {
        // Send an internal server error response for any other error
        res.status(500).json({ error: `UserController Error: ${error.message}` });
      }
    }
  }

  static async getMe(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
      }
		const users = dbClient.client.db(dbClient.database).collection('users');
		const { ObjectId } = require('mongodb');
		const user = await users.findOne({ _id: new ObjectId(userId) }, { projection: { email: 1, _id: 1 } });
		if (user)
		res.status(200).json({ "email": user.email, "id": user._id });
			else throw Error("Unauthorized")
    } catch (error) {
      if (error.message === 'Unauthorized') {
        res.status(401).json({ "error": 'Unauthorized' });
      }
    }
  }
}

// Export the user controller class
export default UserController;
