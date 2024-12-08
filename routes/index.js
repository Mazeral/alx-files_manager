// Import the express module to create a new router
import express from 'express';

// Import the AppController class to handle API requests
import AppController from '../controllers/AppController';

// Create a new router instance
const router = express.Router();

// Define API endpoints

// GET /status: Returns the status of the application (Redis and DB connections)
router.get('/status', AppController.getStatus);

// GET /stats: Returns statistics about the application (number of users and files)
router.get('/stats', AppController.getStats);

// Export the router to be used in the main application file
export default router;
