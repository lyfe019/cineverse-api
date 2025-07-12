import { Request, Response, NextFunction } from 'express';
import * as movieService from '../services/movieService.js'; // Import all functions from movieService
import { IAddMovieInput, IAddPersonInput } from '../interfaces/movie.js'; // Import input interfaces

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