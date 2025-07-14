// src/utils/errors.ts

/**
 * Base custom error class for API errors.
 * All specific API errors should extend this class.
 */
export class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean; // Indicates if this is an error we expected and handled

    constructor(message: string, statusCode: number, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
        // Capture stack trace for debugging
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error for when a resource is not found (e.g., 404 Not Found).
 */
export class NotFoundError extends ApiError {
    constructor(message: string = 'Resource not found.') {
        super(message, 404);
    }
}

/**
 * Error for invalid client input (e.g., 400 Bad Request).
 * This can be used for validation errors (like Joi errors) or other malformed requests.
 */
export class BadRequestError extends ApiError {
    constructor(message: string = 'Bad request. Please check your input.') {
        super(message, 400);
    }
}

/**
 * Error for database-related issues (e.g., connection problems, query failures).
 * This might often result in a 500 Internal Server Error.
 */
export class DatabaseError extends ApiError {
    constructor(message: string = 'A database error occurred.', originalError?: Error) {
        super(message, 500);
        // Optionally store the original error for debugging, but don't expose to client
        if (originalError) {
            console.error('Original Database Error:', originalError);
        }
    }
}

/**
 * Error for internal server errors not explicitly handled (e.g., 500 Internal Server Error).
 */
export class InternalServerError extends ApiError {
    constructor(message: string = 'An unexpected internal server error occurred.') {
        super(message, 500, false); // Mark as non-operational as it's unexpected
    }
}

// You can add more specific error types as needed, e.g., UnauthorizedError, ForbiddenError