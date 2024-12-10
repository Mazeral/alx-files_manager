// Import the express module to create a new router
import express from 'express';

// Import the AppController class to handle API requests
import AppController from '../controllers/AppController';

// Import UserController class to handle API requests
import UserController from '../controllers/UsersController';

import AuthController from '../controllers/AuthController';

import FilesController from '../controllers/FilesController';

// Create a new router instance
const router = express.Router();

// Define API endpoints

// GET /status: Returns the status of the application (Redis and DB connections)
router.get('/status', AppController.getStatus);

// GET /stats: Returns statistics about the application (number of users and files)
router.get('/stats', AppController.getStats);

// POST /users
router.post('/users', UserController.postNew);

router.get('/connect', AuthController.getConnect);

router.get('/disconnect', AuthController.getDisconnect);

router.get('/users/me', UserController.getMe);

router.post('/files', FilesController.postUpload)

// GET /files/:id => FilesController.getShow
// GET /files => FilesController.getIndex
router.get('/files/:id', FilesController.getShow)
router.get('/files', FilesController.getIndex)


// PUT /files/:id/publish => FilesController.putPublish
// PUT /files/:id/publish => FilesController.putUnpublish
router.put('/files/:id/publish', FilesController.putPublish)
router.put('/files/:id/unpublish', FilesController.putUnPublish)


// GET /files/:id/data => FilesController.getFile
router.get('/files/:id/data', FilesController.getFile)


// Export the router to be used in the main application file
export default router;
