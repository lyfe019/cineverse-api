import { Router } from 'express';
import movieRoutes from './movieRoutes.js'; // Import your movie routes

const router = Router();

// Register all specific route modules here
router.use('/', movieRoutes); // All movie and person routes will be under the root path for now

export default router;