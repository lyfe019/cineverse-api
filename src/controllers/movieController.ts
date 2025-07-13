import { Request, Response, NextFunction } from 'express';
import * as movieService from '../services/movieService.js'; // Import all functions from movieService
import {
    IAddMovieInput,
    IAddPersonInput,
    IConnectActorToMovieInput,
    IConnectDirectorToMovieInput,
    IAddGenreInput,
    IConnectMovieToGenreInput, 
    IAddStudioInput,
    IConnectStudioToMovieInput,
        IDeleteMovieInput,        
    IDeletePersonInput,       
    IDeleteRelationshipInput  
} from '../interfaces/movie.js';

// --- Movie Controllers ---

export const addMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input: IAddMovieInput = req.body;
        // Basic validation (more robust validation will be added in a later commit)
        if (!input.title) {
            return res.status(400).json({ message: 'Movie title is required.' });
        }
        const movie = await movieService.addMovie(input);
        res.status(201).json(movie); // 201 Created
    } catch (error) {
        next(error); // Pass error to global error handler
    }
};

export const getMovieByTitle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title } = req.params;
        const movie = await movieService.getMovieByTitle(title);
        if (movie) {
            res.status(200).json(movie);
        } else {
            res.status(404).json({ message: 'Movie not found.' });
        }
    } catch (error) {
        next(error);
    }
};

export const listAllMovies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const movies = await movieService.listAllMovies(page, limit);
        res.status(200).json(movies);
    } catch (error) {
        next(error);
    }
};

// --- Person Controllers ---

export const addPerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input: IAddPersonInput = req.body;
        // Basic validation
        if (!input.name) {
            return res.status(400).json({ message: 'Person name is required.' });
        }
        const person = await movieService.addPerson(input);
        res.status(201).json(person); // 201 Created
    } catch (error) {
        next(error);
    }
};

export const getPersonByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.params;
        const person = await movieService.getPersonByName(name);
        if (person) {
            res.status(200).json(person);
        } else {
            res.status(404).json({ message: 'Person not found.' });
        }
    } catch (error) {
        next(error);
    }
};

export const listAllPeople = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const people = await movieService.listAllPeople(page, limit);
        res.status(200).json(people);
    } catch (error) {
        next(error);
    }
};

// --- Relationship Controllers ---

export const connectActorToMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { actorName, movieTitle } = req.params;
        const { roles } = req.body; // Roles come from the request body

        // Basic validation
        if (!roles || !Array.isArray(roles) || roles.length === 0) {
            return res.status(400).json({ message: 'Roles (as an array of strings) are required.' });
        }
        if (typeof actorName !== 'string' || typeof movieTitle !== 'string') {
             return res.status(400).json({ message: 'Actor name and movie title must be strings.' });
        }

        const result = await movieService.connectActorToMovie({ actorName, movieTitle, roles });
        res.status(201).json(result); // 201 Created
    } catch (error) {
        next(error);
    }
};

export const connectDirectorToMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { directorName, movieTitle } = req.params;

        // Basic validation
        if (typeof directorName !== 'string' || typeof movieTitle !== 'string') {
             return res.status(400).json({ message: 'Director name and movie title must be strings.' });
        }

        const result = await movieService.connectDirectorToMovie({ directorName, movieTitle });
        res.status(201).json(result); // 201 Created
    } catch (error) {
        next(error);
    }
};

// --- Genre Controllers ---

export const addGenre = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input: IAddGenreInput = req.body;
        if (!input.name) {
            return res.status(400).json({ message: 'Genre name is required.' });
        }
        const genre = await movieService.addGenre(input);
        res.status(201).json(genre);
    } catch (error) {
        next(error);
    }
};

export const connectMovieToGenre = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movieTitle } = req.params;
        const { genreNames } = req.body;

        // Create an object that matches IConnectMovieToGenreInput
        const input: IConnectMovieToGenreInput = { movieTitle, genreNames }; // <--- CORRECTED INPUT TYPE

        if (!input.genreNames || !Array.isArray(input.genreNames) || input.genreNames.length === 0) {
            return res.status(400).json({ message: 'Genre names (as an array of strings) are required.' });
        }
        if (typeof input.movieTitle !== 'string') {
             return res.status(400).json({ message: 'Movie title must be a string.' });
        }

        const results = await movieService.connectMovieToGenre(input); // Pass the correctly typed input
        res.status(201).json(results);
    } catch (error) {
        next(error);
    }
};

// --- Studio Controllers ---

export const addStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input: IAddStudioInput = req.body;
        if (!input.name) {
            return res.status(400).json({ message: 'Studio name is required.' });
        }
        const studio = await movieService.addStudio(input);
        res.status(201).json(studio);
    } catch (error) {
        next(error);
    }
};

export const connectStudioToMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studioName, movieTitle } = req.params;

        // Create an object that matches IConnectStudioToMovieInput
        const input: IConnectStudioToMovieInput = { studioName, movieTitle }; // <--- CORRECTED INPUT TYPE

        if (typeof input.studioName !== 'string' || typeof input.movieTitle !== 'string') {
             return res.status(400).json({ message: 'Studio name and movie title must be strings.' });
        }

        const result = await movieService.connectStudioToMovie(input); // Pass the correctly typed input
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};


export const deleteMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title } = req.params;
        // Basic validation
        if (!title || typeof title !== 'string') {
            return res.status(400).json({ message: 'Movie title is required for deletion.' });
        }
        const message = await movieService.deleteMovie(title);
        res.status(200).json({ message }); // 200 OK with confirmation message
    } catch (error) {
        next(error);
    }
};

export const deletePerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.params;
        // Basic validation
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: 'Person name is required for deletion.' });
        }
        const message = await movieService.deletePerson(name);
        res.status(200).json({ message }); // 200 OK with confirmation message
    } catch (error) {
        next(error);
    }
};

export const deleteRelationship = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input: IDeleteRelationshipInput = req.body;
        // Basic validation
        if (!input.fromName || !input.toName || !input.relationshipType) {
            return res.status(400).json({ message: 'fromName, toName, and relationshipType are required to delete a relationship.' });
        }
        if (typeof input.fromName !== 'string' || typeof input.toName !== 'string' || typeof input.relationshipType !== 'string') {
            return res.status(400).json({ message: 'All relationship deletion fields must be strings.' });
        }

        const message = await movieService.deleteRelationship(input);
        res.status(200).json({ message }); // 200 OK with confirmation message
    } catch (error) {
        next(error);
    }
};


// --- Relationship Exploration Controllers ---

export const getMoviesByActor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { actorName } = req.params;
        if (!actorName || typeof actorName !== 'string') {
            return res.status(400).json({ message: 'Actor name is required.' });
        }
        const movies = await movieService.getMoviesByActor(actorName);
        if (movies.length > 0) {
            res.status(200).json(movies);
        } else {
            res.status(404).json({ message: `No movies found for actor '${actorName}'.` });
        }
    } catch (error) {
        next(error);
    }
};

export const getActorsInMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movieTitle } = req.params;
        if (!movieTitle || typeof movieTitle !== 'string') {
            return res.status(400).json({ message: 'Movie title is required.' });
        }
        const actors = await movieService.getActorsInMovie(movieTitle);
        if (actors.length > 0) {
            res.status(200).json(actors);
        } else {
            res.status(404).json({ message: `No actors found for movie '${movieTitle}'.` });
        }
    } catch (error) {
        next(error);
    }
};

export const getMoviesDirectedByPerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { directorName } = req.params;
        if (!directorName || typeof directorName !== 'string') {
            return res.status(400).json({ message: 'Director name is required.' });
        }
        const movies = await movieService.getMoviesDirectedByPerson(directorName);
        if (movies.length > 0) {
            res.status(200).json(movies);
        } else {
            res.status(404).json({ message: `No movies found for director '${directorName}'.` });
        }
    } catch (error) {
        next(error);
    }
};


// --- New Relationship Exploration Controllers (Genres, Studios) ---

export const getMoviesByGenre = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { genreName } = req.params;
        if (!genreName || typeof genreName !== 'string') {
            return res.status(400).json({ message: 'Genre name is required.' });
        }
        const movies = await movieService.getMoviesByGenre(genreName);
        if (movies.length > 0) {
            res.status(200).json(movies);
        } else {
            res.status(404).json({ message: `No movies found for genre '${genreName}'.` });
        }
    } catch (error) {
        next(error);
    }
};

export const getMoviesByStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studioName } = req.params;
        if (!studioName || typeof studioName !== 'string') {
            return res.status(400).json({ message: 'Studio name is required.' });
        }
        const movies = await movieService.getMoviesByStudio(studioName);
        if (movies.length > 0) {
            res.status(200).json(movies);
        } else {
            res.status(404).json({ message: `No movies found for studio '${studioName}'.` });
        }
    } catch (error) {
        next(error);
    }
};

export const getGenresOfMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movieTitle } = req.params;
        if (!movieTitle || typeof movieTitle !== 'string') {
            return res.status(400).json({ message: 'Movie title is required.' });
        }
        const genres = await movieService.getGenresOfMovie(movieTitle);
        if (genres.length > 0) {
            res.status(200).json(genres);
        } else {
            res.status(404).json({ message: `No genres found for movie '${movieTitle}'.` });
        }
    } catch (error) {
        next(error);
    }
};

export const getStudioOfMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movieTitle } = req.params;
        if (!movieTitle || typeof movieTitle !== 'string') {
            return res.status(400).json({ message: 'Movie title is required.' });
        }
        const studio = await movieService.getStudioOfMovie(movieTitle);
        if (studio) {
            res.status(200).json(studio);
        } else {
            res.status(404).json({ message: `No studio found for movie '${movieTitle}'.` });
        }
    } catch (error) {
        next(error);
    }
};


// --- Basic Graph Insights Controllers ---

export const getCoActors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { actorName } = req.params;
        if (!actorName || typeof actorName !== 'string') {
            return res.status(400).json({ message: 'Actor name is required.' });
        }
        const coActors = await movieService.getCoActors(actorName);
        if (coActors.length > 0) {
            res.status(200).json(coActors);
        } else {
            res.status(404).json({ message: `No co-actors found for '${actorName}'.` });
        }
    } catch (error) {
        next(error);
    }
};

export const getSharedMoviesBetweenActors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { actor1Name, actor2Name } = req.params;
        if (!actor1Name || !actor2Name || typeof actor1Name !== 'string' || typeof actor2Name !== 'string') {
            return res.status(400).json({ message: 'Both actor1Name and actor2Name are required.' });
        }
        const sharedMovies = await movieService.getSharedMoviesBetweenActors(actor1Name, actor2Name);
        if (sharedMovies.length > 0) {
            res.status(200).json(sharedMovies);
        } else {
            res.status(404).json({ message: `No shared movies found between '${actor1Name}' and '${actor2Name}'.` });
        }
    } catch (error) {
        next(error);
    }
};

export const getShortestPathBetweenActors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { actor1Name, actor2Name } = req.params;
        if (!actor1Name || !actor2Name || typeof actor1Name !== 'string' || typeof actor2Name !== 'string') {
            return res.status(400).json({ message: 'Both actor1Name and actor2Name are required.' });
        }
        const path = await movieService.getShortestPathBetweenActors(actor1Name, actor2Name);
        if (path) {
            res.status(200).json(path);
        } else {
            res.status(404).json({ message: `No path found between '${actor1Name}' and '${actor2Name}'.` });
        }
    } catch (error) {
        next(error)
    }
};