import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js'; // Import your aggregated API routes

const app = express();

// --- Global Middleware ---
app.use(express.json());
// app.use(cors()); // Uncomment if you installed and need cors

// --- API Routes ---
// All routes defined in src/routes/index.ts will be mounted here
app.use('/api', apiRoutes); // All your API endpoints will now be prefixed with /api

// --- Health Check Route (kept for quick testing) ---
app.get('/', (req, res) => {
    res.status(200).json({ message: 'CineVerse API is running!' });
});

// --- Error Handling Middleware ---
app.use(errorHandler);

export default app;