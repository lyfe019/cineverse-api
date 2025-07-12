
import neo4j from 'neo4j-driver';
import { config } from '../config/index.js'; 

// Initialize the Neo4j Driver
// The driver is a lightweight, thread-safe, and immutable object.
// It's recommended to create only one driver instance per application.
const driver = neo4j.driver(
    config.neo4j.uri,
    neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
);

/**
 * Provides a new Neo4j session.
 * Sessions are logical units of work that encapsulate all communication with the database.
 * They should be opened and closed for each unit of work (e.g., per API request).
 * @returns {neo4j.Session} A new Neo4j session.
 */
export function getSession(): neo4j.Session {
    return driver.session({ database: config.neo4j.database });
}

/**
 * Gracefully closes the Neo4j driver connection pool.
 * This should be called when the application is shutting down.
 */
export async function closeDriver(): Promise<void> {
    if (driver) {
        await driver.close();
        console.log('[Neo4j DB]: Driver connection closed.');
    }
}

/**
 * Creates unique constraints in the Neo4j database for core entities.
 * This ensures data integrity and optimizes MERGE operations.
 * Should ideally be called once during application startup or deployment.
 */
export async function createConstraints(): Promise<void> {
    const session = getSession();
    try {
        // Movie title constraint
        await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (m:Movie) REQUIRE m.title IS UNIQUE');
        console.log('[Neo4j DB]: Unique constraint on Movie(title) ensured.');

        // Person name constraint
        await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE');
        console.log('[Neo4j DB]: Unique constraint on Person(name) ensured.');

        // Genre name constraint
        await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (g:Genre) REQUIRE g.name IS UNIQUE');
        console.log('[Neo4j DB]: Unique constraint on Genre(name) ensured.');

        // Studio name constraint
        await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (s:Studio) REQUIRE s.name IS UNIQUE');
        console.log('[Neo4j DB]: Unique constraint on Studio(name) ensured.');

    } catch (error) {
        console.error('[Neo4j DB]: Error creating constraints:', error);
        throw error; // Re-throw to indicate a critical setup failure
    } finally {
        await session.close();
    }
}

// Optional: A simple function to test the connection, similar to our previous app.js
export async function testDbConnection(): Promise<void> {
    const session = getSession();
    try {
        const result = await session.run('RETURN "Neo4j connection test successful!" AS message');
        console.log(`[Neo4j DB]: ${result.records[0].get('message')}`);
        console.log(`[Neo4j DB]: Connected to database: ${config.neo4j.database}`);
    } catch (error) {
        console.error('[Neo4j DB]: Failed to connect to Neo4j:', error);
        throw error; // Propagate error
    } finally {
        await session.close();
    }
}