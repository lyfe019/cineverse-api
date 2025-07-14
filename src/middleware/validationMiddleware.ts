// src/middleware/validationMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi'; // Import Joi

// --- Joi Schemas for Input Validation ---

// Movie Schemas
export const addMovieSchema = Joi.object({
    title: Joi.string().min(1).required().messages({
        'string.empty': 'Movie title cannot be empty.',
        'any.required': 'Movie title is required.'
    }),
    released: Joi.number().integer().min(1888).max(new Date().getFullYear() + 5).optional().messages({
        'number.integer': 'Released year must be an integer.',
        'number.min': 'Released year must be after 1888.',
        'number.max': 'Released year cannot be in the far future.'
    }),
    tagline: Joi.string().min(1).optional().messages({
        'string.empty': 'Tagline cannot be empty.'
    }),
});

// Person Schemas
export const addPersonSchema = Joi.object({
    name: Joi.string().min(1).required().messages({
        'string.empty': 'Person name cannot be empty.',
        'any.required': 'Person name is required.'
    }),
    born: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional().messages({
        'number.integer': 'Born year must be an integer.',
        'number.min': 'Born year must be valid.',
        'number.max': 'Born year cannot be in the future.'
    }),
});

// Relationship Creation Schemas
export const connectActorToMovieSchema = Joi.object({
    actorName: Joi.string().min(1).required().messages({
        'string.empty': 'Actor name cannot be empty.',
        'any.required': 'Actor name is required.'
    }),
    movieTitle: Joi.string().min(1).required().messages({
        'string.empty': 'Movie title cannot be empty.',
        'any.required': 'Movie title is required.'
    }),
    roles: Joi.array().items(Joi.string().min(1).messages({
        'string.empty': 'Role cannot be empty.'
    })).min(1).required().messages({
        'array.min': 'At least one role is required.',
        'any.required': 'Roles are required.'
    }),
});

export const connectDirectorToMovieSchema = Joi.object({
    directorName: Joi.string().min(1).required().messages({
        'string.empty': 'Director name cannot be empty.',
        'any.required': 'Director name is required.'
    }),
    movieTitle: Joi.string().min(1).required().messages({
        'string.empty': 'Movie title cannot be empty.',
        'any.required': 'Movie title is required.'
    }),
});

export const connectMovieToGenreSchema = Joi.object({
    movieTitle: Joi.string().min(1).required().messages({
        'string.empty': 'Movie title cannot be empty.',
        'any.required': 'Movie title is required.'
    }),
    genreNames: Joi.array().items(Joi.string().min(1).messages({
        'string.empty': 'Genre name cannot be empty.'
    })).min(1).required().messages({
        'array.min': 'At least one genre name is required.',
        'any.required': 'Genre names are required.'
    }),
});

export const connectStudioToMovieSchema = Joi.object({
    studioName: Joi.string().min(1).required().messages({
        'string.empty': 'Studio name cannot be empty.',
        'any.required': 'Studio name is required.'
    }),
    movieTitle: Joi.string().min(1).required().messages({
        'string.empty': 'Movie title cannot be empty.',
        'any.required': 'Movie title is required.'
    }),
});

// Delete Relationship Schema (uses body for all fields)
export const deleteRelationshipSchema = Joi.object({
    fromName: Joi.string().min(1).required().messages({
        'string.empty': 'Source node name (fromName) is required.',
        'any.required': 'fromName is required.'
    }),
    toName: Joi.string().min(1).required().messages({
        'string.empty': 'Target node name (toName) is required.',
        'any.required': 'toName is required.'
    }),
    relationshipType: Joi.string().min(1).required().messages({
        'string.empty': 'Relationship type is required.',
        'any.required': 'relationshipType is required.'
    }),
});

// Query Parameter Schemas (for optional parameters like 'n', 'page', 'limit')
export const paginationQuerySchema = Joi.object({
    page: Joi.number().integer().positive().default(1).optional().messages({
        'number.integer': 'Page must be an integer.',
        'number.positive': 'Page must be a positive integer.'
    }),
    limit: Joi.number().integer().positive().default(10).optional().messages({
        'number.integer': 'Limit must be an integer.',
        'number.positive': 'Limit must be a positive integer.'
    }),
});

export const topNQuerySchema = Joi.object({
    n: Joi.number().integer().positive().default(10).optional().messages({
        'number.integer': 'N must be an integer.',
        'number.positive': 'N must be a positive integer.'
    }),
});

// --- Generic Validation Middleware Function ---

// This middleware can validate req.body, req.params, or req.query
export const validate = (schema: Joi.ObjectSchema<any>, property: 'body' | 'params' | 'query' = 'body') =>
    (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req[property], { abortEarly: false }); // abortEarly: false to get all errors

        if (error) {
            const errors = error.details.map(err => ({
                path: err.path.join('.'),
                message: err.message,
            }));
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors,
            });
        }
        next();
    };