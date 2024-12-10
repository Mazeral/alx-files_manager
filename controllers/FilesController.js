import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  static decodeBase64(base64String) {
    return Buffer.from(base64String, 'base64').toString('utf8');
  }

  static async postUpload(req, res) {
    try {
      // creates a file for a user
      const token = req.headers['x-token'];
      if (!token) {
        throw Error('Unauthorized');
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        throw Error('Unauthorized');
      }
      // getting the user from mongodb
      const users = dbClient.client.db(dbClient.database).collection('users');
      const { ObjectId } = require('mongodb');
      const user = await users.findOne({ _id: new ObjectId(userId) }, { projection: { email: 1, _id: 1 } });
      if (!user) throw Error('Unauthorized');
      const { body } = req;
      const file = {
        user_id: body.userId,
        name: body.name,
        type: body.type,
        isPublic: body.isPublic,
        data: body.data,
        parentId: body.parentId,
        localPath: body.localPath,
      };
      // Checking the required data
      const files = dbClient.client.db(dbClient.database).collection('files');
      if (!file.name) {
        res.status(400).json({ error: 'Missing name' });
      }
      if (!file.type) {
        res.stataus(400).json({ error: 'Missing type' });
      }
      if (file.type === 'file' || fileType === 'image') {
        if (!file.data) {
          res.status(400).json({ error: 'Missing data' });
        }
      }
      if (file.parentId && file.parentId !== 0) {
        // check if the parent file (The folder) exists in the database
        const foundFolder = await files.findOne({ parentId: file.parentId }, { projection: { type: 1 } });
        if (!foundFolder) {
          res.status(400).json({ error: 'Parent not found' });
        }
        if (foundFolder.type !== 'folder') throw Error('Parent is not a folder');
      }
      if (file.type === 'folder') {
        // If the type is folder, insert the document into the files collection in the database with:
        // userId: The authenticated user’s ID.
        // name: The provided name.
        // type: "folder".
        // parentId: The provided parentId (default: 0).
        // isPublic: The provided value (default: false).
        // return the file
        if (!file.parentId) file.parentId = 0;
        if (!file.isPublic) file.isPublic = false;
        const folder = {
          userId: user._id,
          name: file.name,
          type: 'folder',
          parentId: file.parentId ? file.parentId : 0,
          isPublic: file.isPublic ? file.isPublic : false,
        };
        const result = await files.insertOne(folder);
        console.log(`Inserted the following folder: ${result}`);
        if (file) res.status(201).json(folder);
      }
      if (file.type === 'file' || file.type === 'image') {
        const decodedData = FilesController.decodeBase64(file.data);
        file.data = decodedData;
      }
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fs = require('fs');
      fs.mkdir('/tmp/files_manager', { recursive: true }, (err) => {
        throw err;
      });
      const fileUuid = uuidv4();
      fs.writeSync(`${folderPath}/${fileUuid}.${file.type}`, file.data);
      // Insert the file into the database
      // Example of a file data:
      // {
      //   "id": "61234abc",
      //   "name": "report.pdf",
      //   "type": "file",
      //   "userId": "5f12345",
      //   "isPublic": false,
      //   "parentId": "0",
      //   "localPath": "/tmp/files_manager/155342df-2399-41da-9e8c-458b6ac52a0c"
      // }
      const newFile = await files.insertOne({
        name: file.name,
        type: file.type,
        userId: file.user_id,
        isPublic: file.isPublic,
        parentId: file.parentId,
        localPath: `/tmp/files_manager/${fileUuid}`,
      });
      res.status(201).json(newFile);
    } catch (error) {
      if (error.message === 'Unauthorized') res.status(401).json({ error: 'Unauthorized' });
      else if (error.message === 'Parent is not a folder') res.status(400).json({ error: 'Parent is not a folder' });
      else console.log(`Error on FilesController: ${error.message}`);
    }
  }

  static async getShow(req, res) {
    try {
      // creates a file for a user
      const token = req.headers['x-token'];
      if (!token) throw Error('Unauthorized');

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) throw Error('Unauthorized');
      // getting the user from mongodb
      const users = dbClient.client.db(dbClient.database).collection('users');
      const { ObjectId } = require('mongodb');
      const user = await users.findOne({ _id: new ObjectId(userId) }, { projection: { email: 1, _id: 1 } });
      if (!user) throw Error('Unauthorized');
      const files = dbClient.client.db(dbClient.database).collection('files');
      // Get all the files, if there's non, throw an error
      const fileList = await find({ userId: user._id });
      if (!files) throw Error('Not found');
      res.status(200).json(fileList);
    } catch (error) {
      if (error.message === 'Unauthorized') res.status(401).json({ error: 'Unauthorized' });
      else if (error.message === 'Not found') res.status(404).json({ error: 'Not found' });
      else console.log(`FilesController Error: ${error.message}`);
    }
  }

  static async getIndex(req, res) {
    try {
      // creates a file for a user
      const token = req.headers['x-token'];
      if (!token) {
        throw Error('Unauthorized');
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        throw Error('Unauthorized');
      }
      // getting the user from mongodb
      const users = dbClient.client.db(dbClient.database).collection('users');
      const { ObjectId } = require('mongodb');
      const user = await users.findOne({ _id: new ObjectId(userId) }, { projection: { email: 1, _id: 1 } });
      if (!user) throw Error('Unauthorized');
      const parentId = req.query.parentId || '0'; // Default parentId to 0
      const page = parseInt(req.query.page, 10) || 0; // Default page to 0
      const files = dbClient.client.db(dbClient.database).collection('files');
      // Query for files matching userId and parentId
      const filter = { userId, parentId };
      const fileList = await files
        .find(filter)
        .skip(page * 20) // Skip based on page number
        .limit(20) // Limit results to 20 items
        .toArray();

      // Format the response
      const formattedFiles = fileList.map((file) => ({
        id: file._id.toString(),
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
        userId: file.userId,
      }));
      res.status(200).json(formattedFiles);
    } catch (error) {
      if (error.message === 'Unauthorized') res.status(401).json({ error: 'Unauthorized' });
      else console.log(`FilesController Error: ${error.message}`);
    }
  }
}

export default FilesController;
