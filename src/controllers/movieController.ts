// src/controllers/movieController.ts

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
        // Manual validation removed, handled by Joi middleware
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
        // Validation for page/limit handled by Joi middleware
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
        // Manual validation removed, handled by Joi middleware
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
        // Validation for page/limit handled by Joi middleware
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
        // Params are from URL, body is validated by Joi middleware
        const { actorName, movieTitle } = req.params;
        const { roles } = req.body;

        // Manual validation removed, handled by Joi middleware
        const result = await movieService.connectActorToMovie({ actorName, movieTitle, roles });
        res.status(201).json(result); // 201 Created
    } catch (error) {
        next(error);
    }
};

export const connectDirectorToMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Params are from URL, body is validated by Joi middleware
        const { directorName, movieTitle } = req.params;

        // Manual validation removed, handled by Joi middleware
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
        // Manual validation removed, handled by Joi middleware
        const genre = await movieService.addGenre(input);
        res.status(201).json(genre);
    } catch (error) {
        next(error);
    }
};

export const connectMovieToGenre = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Params are from URL, body is validated by Joi middleware
        const { movieTitle } = req.params;
        const { genreNames } = req.body;

        const input: IConnectMovieToGenreInput = { movieTitle, genreNames };
        // Manual validation removed, handled by Joi middleware
        const results = await movieService.connectMovieToGenre(input);
        res.status(201).json(results);
    } catch (error) {
        next(error);
    }
};

// --- Studio Controllers ---

export const addStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input: IAddStudioInput = req.body;
        // Manual validation removed, handled by Joi middleware
        const studio = await movieService.addStudio(input);
        res.status(201).json(studio);
    } catch (error) {
        next(error);
    }
};

export const connectStudioToMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Params are from URL, body is validated by Joi middleware
        const { studioName, movieTitle } = req.params;

        const input: IConnectStudioToMovieInput = { studioName, movieTitle };
        // Manual validation removed, handled by Joi middleware
        const result = await movieService.connectStudioToMovie(input);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

// --- Delete Controllers ---

export const deleteMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title } = req.params;
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
        const message = await movieService.deleteMovie(title);
        res.status(200).json({ message }); // 200 OK with confirmation message
    } catch (error) {
        next(error);
    }
};

export const deletePerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.params;
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
        const message = await movieService.deletePerson(name);
        res.status(200).json({ message }); // 200 OK with confirmation message
    } catch (error) {
        next(error);
    }
};

export const deleteRelationship = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input: IDeleteRelationshipInput = req.body;
        // Manual validation removed, handled by Joi middleware
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
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
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
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
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
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
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
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
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
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
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
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
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
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
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
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
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
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
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
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
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

// --- Advanced Recommendation Controllers ---

export const recommendMoviesBySharedGenres = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movieTitle } = req.params;
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
        const recommendations = await movieService.recommendMoviesBySharedGenres(movieTitle);
        if (recommendations.length > 0) {
            res.status(200).json(recommendations);
        } else {
            res.status(404).json({ message: `No genre-based recommendations found for '${movieTitle}'.` });
        }
    } catch (error) {
        next(error);
    }
};

export const recommendMoviesBySharedCastCrew = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { movieTitle } = req.params;
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
        const recommendations = await movieService.recommendMoviesBySharedCastCrew(movieTitle);
        if (recommendations.length > 0) {
            res.status(200).json(recommendations);
        } else {
            res.status(404).json({ message: `No cast/crew-based recommendations found for '${movieTitle}'.` });
        }
    } catch (error) {
        next(error);
    }
};

// --- Top N & Common Directors Controllers ---

export const getTopNActorsByMovieCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validation for 'n' handled by Joi middleware
        const n = parseInt(req.query.n as string) || 10;
        const topActors = await movieService.getTopNActorsByMovieCount(n);
        if (topActors.length > 0) {
            res.status(200).json(topActors);
        } else {
            res.status(404).json({ message: `No top actors found.` });
        }
    } catch (error) {
        next(error);
    }
};

export const getTopNDirectorsByMovieCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validation for 'n' handled by Joi middleware
        const n = parseInt(req.query.n as string) || 10;
        const topDirectors = await movieService.getTopNDirectorsByMovieCount(n);
        if (topDirectors.length > 0) {
            res.status(200).json(topDirectors);
        } else {
            res.status(404).json({ message: `No top directors found.` });
        }
    } catch (error) {
        next(error);
    }
};

export const findCommonDirectorsBetweenActors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { actor1Name, actor2Name } = req.params;
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
        const commonDirectors = await movieService.findCommonDirectorsBetweenActors(actor1Name, actor2Name);
        if (commonDirectors.length > 0) {
            res.status(200).json(commonDirectors);
        } else {
            res.status(404).json({ message: `No common directors found between '${actor1Name}' and '${actor2Name}'.` });
        }
    } catch (error) {
        next(error);
    }
};

export const findMoviesWithActorsFromGenre = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { genreName } = req.params;
        // Manual validation removed, handled by Joi middleware (if applicable, or simple type check)
        const movies = await movieService.findMoviesWithActorsFromGenre(genreName);
        if (movies.length > 0) {
            res.status(200).json(movies);
        } else {
            res.status(404).json({ message: `No movies found with actors from genre '${genreName}'.` });
        }
    } catch (error) {
        next(error);
    }
};