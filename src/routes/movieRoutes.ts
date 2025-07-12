// src/routes/movieRoutes.ts

import { Router } from 'express';
import * as movieController from '../controllers/movieController.js'; // Import all controller methods

const router = Router();

// --- Movie Routes ---
router.post('/movies', movieController.addMovie);
router.get('/movies/:title', movieController.getMovieByTitle);
router.get('/movies', movieController.listAllMovies); // /movies?page=1&limit=10

// --- Person Routes ---
router.post('/persons', movieController.addPerson);
router.get('/persons/:name', movieController.getPersonByName);
router.get('/persons', movieController.listAllPeople); // /persons?page=1&limit=10

export default router;