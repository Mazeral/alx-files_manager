import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

class FilesController {
  static decodeBase64(base64String) {
	  return Buffer.from(base64String, 'base64').toString('utf8');
  }

  static async postUpload(req, res) {
    // creates a file for a user
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
    if (user) res.status(200).json({ email: user.email, id: user._id });
    else throw Error('Unauthorized');
    // userId: The authenticated user’s ID.
    // name: The provided name.
    // type: "file" or "image".
    // isPublic: The provided value (default: false).
    // parentId: The provided parentId (default: 0).
    // localPath: T
    const fileUserId = req.body.userId;
    const fileName = req.body.name;
    const fileType = req.body.type;
    const fileIsPublic = req.body.isPublic;
    const fileData = req.body.data;
    const fileParentId = req.body.parentId;
    const fileLocalPath = req.body.localPath;
    const files = dbClient.client.db(dbClient.database).collection('files');
    if (!fileName) {
      res.status(400).json({ error: 'Missing name' });
    }
    if (!fileType) {
      res.stataus(400).json({ error: 'Missing type' });
    }
    if (fileType === 'file' || fileType === 'image') {
      if (!fileData) {
        res.status(400).json({ error: 'Missing data' });
      }
    }
    if (fileParentId && fileParentId !== 0) {
      // check if the file exists in the database
      const file = files.findOne({ parentId: fileParentId }, { projection: { type: 1 } });
      if (!file) {
        res.status(400).json({ error: 'Parent not found' });
      }
      if (file.type !== 'folder') res.status(400).json({ error: 'Parent is not a folder' });
    }
    if (fileType === 'folder') {
      if (!fileParentId) fileParentId = 0;
      if (!fileIsPublic) fileIsPublic = false;
      const file = {
        userId: fileUserId, name: fileName, type: 'folder', parentId: fileParentId, isPublic: fileIsPublic,
      };
      if (file) res.status(201).json(file);
    }
    if (fileType === 'file' || fileType === 'image') {
      const decodedData = FilesController.decodeBase64(fileData);
		file.data = decodedData;
    }
	const folderPath = process.env.FOLDER_PATH
	const fs = require('fs')
	if (!folderPath){
		fs.mkdir("/tmp/files_manager", (err) => {
				console.log(`Error at created the files_manger folder: ${err.message}`)
			})
		folderPath = "/tmp/files_manager"

		}
	const fileUuid = uuid()
	fs.open	
  }
}

export default FilesController;
