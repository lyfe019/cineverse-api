// src/routes/movieRoutes.ts

import { Router } from 'express';
import * as movieController from '../controllers/movieController.js'; // Import all controller methods
import {
    validate, // <-- Import the validate middleware
    addMovieSchema,
    addPersonSchema,
    connectActorToMovieSchema,
    connectDirectorToMovieSchema,
    connectMovieToGenreSchema,
    connectStudioToMovieSchema,
    deleteRelationshipSchema,
    paginationQuerySchema,
    topNQuerySchema
} from '../middleware/validationMiddleware.js'; // Note the .js extension

const router = Router();

// --- Movie Routes ---
router.post('/movies', validate(addMovieSchema, 'body'), movieController.addMovie); // Validate body
router.get('/movies/:title', movieController.getMovieByTitle); // No body/query validation needed here, params are simple strings
router.get('/movies', validate(paginationQuerySchema, 'query'), movieController.listAllMovies); // Validate query

// --- Person Routes ---
router.post('/persons', validate(addPersonSchema, 'body'), movieController.addPerson); // Validate body
router.get('/persons/:name', movieController.getPersonByName); // No body/query validation needed here, params are simple strings
router.get('/persons', validate(paginationQuerySchema, 'query'), movieController.listAllPeople); // Validate query

// --- Relationship Creation Routes ---
// For routes with params and body, we validate the body. Params are simple strings.
router.post('/actors/:actorName/act-in/:movieTitle', validate(connectActorToMovieSchema, 'body'), movieController.connectActorToMovie); // Validate body
router.post('/directors/:directorName/direct/:movieTitle', validate(connectDirectorToMovieSchema, 'body'), movieController.connectDirectorToMovie); // Validate body

// --- Genre Routes ---
router.post('/genres', validate(addMovieSchema, 'body'), movieController.addGenre); // Reusing addMovieSchema for name validation, validate body
router.post('/movies/:movieTitle/genres', validate(connectMovieToGenreSchema, 'body'), movieController.connectMovieToGenre); // Validate body

// --- Studio Routes ---
router.post('/studios', validate(addMovieSchema, 'body'), movieController.addStudio); // Reusing addMovieSchema for name validation, validate body
router.post('/studios/:studioName/produces/:movieTitle', validate(connectStudioToMovieSchema, 'body'), movieController.connectStudioToMovie); // Validate body

// --- Delete Routes ---
router.delete('/movies/:title', movieController.deleteMovie); // Params handled by controller
router.delete('/persons/:name', movieController.deletePerson); // Params handled by controller
router.delete('/relationships', validate(deleteRelationshipSchema, 'body'), movieController.deleteRelationship); // Validate body

// --- Relationship Exploration Routes (Existing) ---
// These are GET requests with simple string parameters, basic type checking is sufficient in controller
router.get('/actors/:actorName/movies', movieController.getMoviesByActor);
router.get('/movies/:movieTitle/actors', movieController.getActorsInMovie);
router.get('/directors/:directorName/movies', movieController.getMoviesDirectedByPerson);
router.get('/genres/:genreName/movies', movieController.getMoviesByGenre);
router.get('/studios/:studioName/movies', movieController.getMoviesByStudio);
router.get('/movies/:movieTitle/genres', movieController.getGenresOfMovie);
router.get('/movies/:movieTitle/studio', movieController.getStudioOfMovie);

// --- Basic Graph Insights Routes (Existing) ---
// These are GET requests with simple string parameters, basic type checking is sufficient in controller
router.get('/actors/:actorName/co-actors', movieController.getCoActors);
router.get('/actors/:actor1Name/shared-movies/:actor2Name', movieController.getSharedMoviesBetweenActors);
router.get('/actors/:actor1Name/path-to/:actor2Name', movieController.getShortestPathBetweenActors);

// --- Advanced Recommendation Routes (Existing) ---
// These are GET requests with simple string parameters, basic type checking is sufficient in controller
router.get('/movies/:movieTitle/recommendations/genre', movieController.recommendMoviesBySharedGenres);
router.get('/movies/:movieTitle/recommendations/cast-crew', movieController.recommendMoviesBySharedCastCrew);

// --- Top N & Common Directors Routes (Existing) ---
router.get('/top-actors', validate(topNQuerySchema, 'query'), movieController.getTopNActorsByMovieCount); // Validate query
router.get('/top-directors', validate(topNQuerySchema, 'query'), movieController.getTopNDirectorsByMovieCount); // Validate query
router.get('/actors/:actor1Name/common-directors/:actor2Name', movieController.findCommonDirectorsBetweenActors); // Params are simple strings
router.get('/genres/:genreName/movies-with-actors', movieController.findMoviesWithActorsFromGenre); // Params are simple strings

export default router;