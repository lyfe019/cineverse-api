// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { ApiError, BadRequestError, NotFoundError, DatabaseError, InternalServerError } from '../utils/errors.js'; // <-- NEW IMPORTS

import Joi from 'joi'; // Import the default export
const { ValidationError } = Joi; // Destructure ValidationError from the default export


// Global error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Log the error for debugging purposes (consider a more robust logger in production)
    console.error('[API Error]:', err);

    let errorResponse: {
        status: string;
        message: string;
        details?: string; // Optional detailed message for dev/operational errors
        stack?: string;   // Optional stack trace for dev
        errors?: { path: string; message: string }[]; // Optional array for validation errors
    } = {
        status: 'error',
        message: 'An unexpected server error occurred.',
    };
    let statusCode = 500;

    // Handle custom operational errors (ApiError and its subclasses)
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        errorResponse.message = err.message;
        // For operational errors, we might expose more details even in production if safe
        if (err.isOperational && process.env.NODE_ENV === 'development') { // Always show details in dev
             errorResponse.details = err.message;
        } else if (err.isOperational) { // For operational errors in production, show message, but not stack
            errorResponse.details = undefined; // Don't expose internal details in production unless explicitly safe
        }
    }
    // Handle Joi validation errors
    else if (err instanceof ValidationError) {
        statusCode = 400; // Bad Request for validation errors
        errorResponse.message = 'Validation failed';
        errorResponse.errors = err.details.map(detail => ({
            path: detail.path.join('.'), // Path to the invalid field
            message: detail.message,     // Joi's validation message
        }));
        errorResponse.details = undefined; // Clear generic details if Joi errors are present
    }
    // Handle specific Neo4j driver errors that might not be wrapped by our services
    // This is a fallback for unexpected Neo4j issues that weren't caught by DatabaseError
    else if (err.name === 'Neo4jError') {
        statusCode = 500; // Default to 500 for unhandled DB errors
        errorResponse.message = 'A database operation failed unexpectedly.';
        if (process.env.NODE_ENV === 'development') {
            // Include Neo4j specific code/message in dev for debugging
            errorResponse.details = `Neo4j Error: ${err.message} (Code: ${(err as any).code})`;
        }
    }
    // Handle any other unexpected errors (e.g., programming errors)
    else {
        // For truly unexpected errors, ensure message is generic in production
        errorResponse.message = 'An unexpected internal server error occurred.';
        // If it's not an operational error, we generally don't expose its details/message directly
        // unless in development.
        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = err.message;
        }
    }

    // Include stack trace only in development environment
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    // Send the error response
    res.status(statusCode).json(errorResponse);
};

export default errorHandler;