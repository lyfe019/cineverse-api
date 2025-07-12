// src/app.ts

import express from 'express';
import { errorHandler } from './middleware/errorHandler.js'; // Note the .js extension for ES Modules

const app = express();

// --- Global Middleware ---
// Enable JSON body parsing for incoming requests
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing) if your frontend is on a different domain
// For now, we'll keep it simple. If you need it, you'd install 'cors' and use it like:
// import cors from 'cors';
// app.use(cors());

// --- Routes (will be added in subsequent commits) ---
// For now, a simple health check route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'CineVerse API is running!' });
});

// --- Error Handling Middleware ---
// This should be the last middleware added
app.use(errorHandler);

export default app; // Export the Express app instance