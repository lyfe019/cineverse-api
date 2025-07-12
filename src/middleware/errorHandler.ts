import { Request, Response, NextFunction } from 'express';

// Basic error handling middleware
// This catches errors thrown in route handlers or other middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[API Error]:', err); // Log the error for debugging

    // Default to 500 Internal Server Error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred.';

    // Send a JSON response
    res.status(statusCode).json({
        status: 'error',
        message: message,
        // In development, you might send the full error stack for debugging:
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};