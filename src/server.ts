// src/server.ts

import app from './app.js'; // Import the Express app
import { config } from './config/index.js'; // Import configuration
import { testDbConnection, createConstraints, closeDriver } from './db/index.js'; // Import DB functions

const PORT = config.app.port;

async function startServer() {
    try {
        // 1. Test Database Connection
        await testDbConnection();
        console.log('[Server]: Neo4j database connection verified.');

        // 2. Ensure Constraints are Created
        await createConstraints();
        console.log('[Server]: Neo4j constraints ensured.');

        // 3. Start the Express Server
        app.listen(PORT, () => {
            console.log(`[Server]: CineVerse API listening on port ${PORT}`);
            console.log(`[Server]: Access API at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('[Server]: Failed to start CineVerse API:', error);
        console.error('[Server]: Shutting down due to critical error.');
        // Ensure driver is closed if startup fails
        await closeDriver();
        process.exit(1); // Exit with a failure code
    }
}

// Start the server
startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n[Server]: SIGINT signal received. Closing Neo4j driver and shutting down.');
    await closeDriver();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n[Server]: SIGTERM signal received. Closing Neo4j driver and shutting down.');
    await closeDriver();
    process.exit(0);
});