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


// --- Relationship Creation Routes ---
// POST /api/actors/:actorName/act-in/:movieTitle
router.post('/actors/:actorName/act-in/:movieTitle', movieController.connectActorToMovie);

// POST /api/directors/:directorName/direct/:movieTitle
router.post('/directors/:directorName/direct/:movieTitle', movieController.connectDirectorToMovie);


router.post('/genres', movieController.addGenre);
router.post('/movies/:movieTitle/genres', movieController.connectMovieToGenre); // Connect movie to one or more genres

// --- Studio Routes (NEW) ---
router.post('/studios', movieController.addStudio);
router.post('/studios/:studioName/produces/:movieTitle', movieController.connectStudioToMovie); // Connect studio to movie


// --- Delete Routes (NEW) ---
router.delete('/movies/:title', movieController.deleteMovie); // DELETE /api/movies/The%20Matrix
router.delete('/persons/:name', movieController.deletePerson); // DELETE /api/persons/Keanu%20Reeves
router.delete('/relationships', movieController.deleteRelationship); // DELETE /api/relationships (requires body)


export default router