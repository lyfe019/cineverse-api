import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
// It's good practice to specify the path explicitly if not in the root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define and export your configuration constants
// Use default values or throw errors if essential variables are missing
export const config = {
    app: {
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
        env: process.env.NODE_ENV || 'development',
    },
    neo4j: {
        uri: process.env.NEO4J_URI || 'bolt://127.0.0.1:7687',
        user: process.env.NEO4J_USER || 'neo4j',
        password: process.env.NEO4J_PASSWORD || 'ebenezer000', 
        database: process.env.NEO4J_DATABASE || 'neo4j', // Default to 'neo4j'
    },
    
};

// Basic validation for critical Neo4j credentials
if (!config.neo4j.password || config.neo4j.password === 'ebenezer000') {
    console.warn('WARNING: NEO4J_PASSWORD is not set in .env or is using a placeholder. Please set a strong password.');
    // In a production environment, you might want to throw an error here:
    // throw new Error('NEO4J_PASSWORD environment variable is required.');
}

console.log(`[Config]: Loaded environment: ${config.app.env}`);
console.log(`[Config]: App Port: ${config.app.port}`);
console.log(`[Config]: Neo4j URI: ${config.neo4j.uri}`);
console.log(`[Config]: Neo4j User: ${config.neo4j.user}`);
console.log(`[Config]: Neo4j Database: ${config.neo4j.database}`);