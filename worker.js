import Bull from 'bull';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const files = dbClient.client.db(dbClient.database).collection('files');
  const file = await files.findOne({ _id: new ObjectId(fileId), userId: userId });
  if (!file) throw new Error('File not found');

  if (file.type !== 'image') throw new Error('File is not an image');

  const sizes = [500, 250, 100];
  const originalPath = file.localPath;

  for (const size of sizes) {
    const options = { width: size };
    const thumbnail = await imageThumbnail(originalPath, options);
    const thumbnailPath = `${originalPath}_${size}`;
    fs.writeFileSync(thumbnailPath, thumbnail);
  }
});

const userQueue = new Queue('userQueue', {redis: { host: '127.0.0.1', port: 6379 }})

userQueue.proecss(async (job) => {
	const { userId } = job.data

	if (!userId){
		throw Error("Missing userId")
	}

	const user  = await dbClient.db.collection('users').findOne({_id: userId})

	if(!user){
		throw Error("User not found")
	}
	
	console.log(`Welcome ${user.email}!`);
})
