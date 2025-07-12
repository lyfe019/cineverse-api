// src/services/movieService.ts

import { getSession } from '../db/index.js'; // Import the getSession function
import {
    IMovie,
    IPerson,
    IAddMovieInput,
    IAddPersonInput,
    IMovieResponse,
    IPersonResponse,
    IPaginatedResponse,
    IConnectActorToMovieInput, 
    IConnectDirectorToMovieInput, 
    IRelationshipCreatedResponse,
        IAddGenreInput,         
  IConnectMovieToGenreInput,    
    IAddStudioInput,         // <-- NEW IMPORT
        IConnectStudioToMovieInput,    // <-- NEW IMPORT
    IGenreResponse,          // <-- NEW IMPORT
    IStudioResponse          // <-- NEW IMPORT
} from '../interfaces/movie.js'; 
import neo4j from 'neo4j-driver'; 

/**
 * Adds a new movie or updates an existing one.
 * @param {IAddMovieInput} input - Movie details.
 * @returns {Promise<IMovieResponse>} The created or updated movie.
 */
export async function addMovie(input: IAddMovieInput): Promise<IMovieResponse> {
    const session = getSession();
    try {
        const query = `
            MERGE (m:Movie {title: $title})
            ON CREATE SET m.released = $released, m.tagline = $tagline
            ON MATCH SET m.released = $released, m.tagline = $tagline
            RETURN m
        `;
        const result = await session.run(query, {
            title: input.title,
            released: input.released,
            tagline: input.tagline
        });
        const movieNode = result.records[0].get('m');
        return movieNode.properties as IMovieResponse;
    } finally {
        await session.close();
    }
}

/**
 * Adds a new person or updates an existing one.
 * @param {IAddPersonInput} input - Person details.
 * @returns {Promise<IPersonResponse>} The created or updated person.
 */
export async function addPerson(input: IAddPersonInput): Promise<IPersonResponse> {
    const session = getSession();
    try {
        const query = `
            MERGE (p:Person {name: $name})
            ON CREATE SET p.born = $born
            ON MATCH SET p.born = $born
            RETURN p
        `;
        const result = await session.run(query, {
            name: input.name,
            born: input.born
        });
        const personNode = result.records[0].get('p');
        return personNode.properties as IPersonResponse;
    } finally {
        await session.close();
    }
}

/**
 * Retrieves a movie by its title.
 * @param {string} title - The title of the movie.
 * @returns {Promise<IMovieResponse | null>} The movie details or null if not found.
 */
export async function getMovieByTitle(title: string): Promise<IMovieResponse | null> {
    const session = getSession();
    try {
        const query = `
            MATCH (m:Movie {title: $title})
            RETURN m
        `;
        const result = await session.run(query, { title });
        if (result.records.length > 0) {
            const movieNode = result.records[0].get('m');
            return movieNode.properties as IMovieResponse;
        }
        return null;
    } finally {
        await session.close();
    }
}

/**
 * Retrieves a person by their name.
 * @param {string} name - The name of the person.
 * @returns {Promise<IPersonResponse | null>} The person details or null if not found.
 */
export async function getPersonByName(name: string): Promise<IPersonResponse | null> {
    const session = getSession();
    try {
        const query = `
            MATCH (p:Person {name: $name})
            RETURN p
        `;
        const result = await session.run(query, { name });
        if (result.records.length > 0) {
            const personNode = result.records[0].get('p');
            return personNode.properties as IPersonResponse;
        }
        return null;
    } finally {
        await session.close();
    }
}

/**
 * Retrieves a paginated list of all movies.
 * @param {number} page - The page number (1-indexed).
 * @param {number} limit - The number of items per page.
 * @returns {Promise<IPaginatedResponse<IMovieResponse>>} A paginated list of movies.
 */
export async function listAllMovies(page: number = 1, limit: number = 10): Promise<IPaginatedResponse<IMovieResponse>> {
    const session = getSession();
    try {
        const skip = (page - 1) * limit;

        // Query to get total count
        const countResult = await session.run('MATCH (m:Movie) RETURN count(m) AS total');
        const totalItems = countResult.records[0].get('total').toNumber();

        // Query to get paginated movies
        const moviesResult = await session.run(
            `MATCH (m:Movie) RETURN m ORDER BY m.title SKIP $skip LIMIT $limit`,
            { skip: neo4j.int(skip), limit: neo4j.int(limit) } 
        );
        const movies = moviesResult.records.map(record => record.get('m').properties as IMovieResponse);

        return {
            data: movies,
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit)
        };
    } finally {
        await session.close();
    }
}

/**
 * Retrieves a paginated list of all people.
 * @param {number} page - The page number (1-indexed).
 * @param {number} limit - The number of items per page.
 * @returns {Promise<IPaginatedResponse<IPersonResponse>>} A paginated list of people.
 */
export async function listAllPeople(page: number = 1, limit: number = 10): Promise<IPaginatedResponse<IPersonResponse>> {
    const session = getSession();
    try {
        const skip = (page - 1) * limit;

        // Query to get total count
        const countResult = await session.run('MATCH (p:Person) RETURN count(p) AS total');
        const totalItems = countResult.records[0].get('total').toNumber();

        // Query to get paginated people
        const peopleResult = await session.run(
            `MATCH (p:Person) RETURN p ORDER BY p.name SKIP $skip LIMIT $limit`,
            { skip: neo4j.int(skip), limit: neo4j.int(limit) } 
        );
        const people = peopleResult.records.map(record => record.get('p').properties as IPersonResponse);

        return {
            data: people,
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit)
        };
    } finally {
        await session.close();
    }
}



/**
 * Connects an actor to a movie with their specific roles.
 * @param {IConnectActorToMovieInput} input - Actor name, movie title, and roles.
 * @returns {Promise<IRelationshipCreatedResponse>} Confirmation of the relationship.
 */
export async function connectActorToMovie(input: IConnectActorToMovieInput): Promise<IRelationshipCreatedResponse> {
    const session = getSession();
    try {
        const query = `
            MATCH (p:Person {name: $actorName})
            MATCH (m:Movie {title: $movieTitle})
            MERGE (p)-[r:ACTED_IN]->(m)
            ON CREATE SET r.roles = $roles
            ON MATCH SET r.roles = $roles // Update roles if relationship already exists
            RETURN p.name AS fromName, m.title AS toName, type(r) AS relationshipType, r.roles AS properties
        `;
        const result = await session.run(query, {
            actorName: input.actorName,
            movieTitle: input.movieTitle,
            roles: input.roles
        });

        if (result.records.length === 0) {
            // This scenario means either actor or movie wasn't found, or relationship couldn't be merged
            throw new Error(`Failed to connect actor '${input.actorName}' to movie '${input.movieTitle}'. Ensure both exist.`);
        }

        const record = result.records[0];
        return {
            message: `Relationship ACTED_IN created/updated.`,
            from: record.get('fromName'),
            to: record.get('toName'),
            type: record.get('relationshipType'),
            properties: { roles: record.get('properties') }
        };
    } finally {
        await session.close();
    }
}



/**
 * Connects a director to a movie.
 * @param {IConnectDirectorToMovieInput} input - Director name and movie title.
 * @returns {Promise<IRelationshipCreatedResponse>} Confirmation of the relationship.
 */
export async function connectDirectorToMovie(input: IConnectDirectorToMovieInput): Promise<IRelationshipCreatedResponse> {
    const session = getSession();
    try {
        const query = `
            MATCH (p:Person {name: $directorName})
            MATCH (m:Movie {title: $movieTitle})
            MERGE (p)-[r:DIRECTED]->(m)
            RETURN p.name AS fromName, m.title AS toName, type(r) AS relationshipType
        `;
        const result = await session.run(query, {
            directorName: input.directorName,
            movieTitle: input.movieTitle
        });

        if (result.records.length === 0) {
            throw new Error(`Failed to connect director '${input.directorName}' to movie '${input.movieTitle}'. Ensure both exist.`);
        }

        const record = result.records[0];
        return {
            message: `Relationship DIRECTED created/updated.`,
            from: record.get('fromName'),
            to: record.get('toName'),
            type: record.get('relationshipType')
        };
    } finally {
        await session.close();
    }
}



/**
 * Adds a new genre or updates an existing one.
 * @param {IAddGenreInput} input - Genre details.
 * @returns {Promise<IGenreResponse>} The created or updated genre.
 */
export async function addGenre(input: IAddGenreInput): Promise<IGenreResponse> {
    const session = getSession();
    try {
        const query = `
            MERGE (g:Genre {name: $name})
            RETURN g
        `;
        const result = await session.run(query, { name: input.name });
        const genreNode = result.records[0].get('g');
        return genreNode.properties as IGenreResponse;
    } finally {
        await session.close();
    }
}

/**
 * Connects a movie to one or more genres.
 * @param {IConnectMovieToGenreInput} input - Movie title and an array of genre names.
 * @returns {Promise<IRelationshipCreatedResponse[]>} Confirmation of the relationships.
 */
export async function connectMovieToGenre(input: IConnectMovieToGenreInput): Promise<IRelationshipCreatedResponse[]> {
    const session = getSession();
    const results: IRelationshipCreatedResponse[] = [];
    try {
        const query = `
            MATCH (m:Movie {title: $movieTitle})
            UNWIND $genreNames AS genreName
            MERGE (g:Genre {name: genreName}) // MERGE genre to ensure it exists
            MERGE (m)-[r:HAS_GENRE]->(g)
            RETURN m.title AS fromName, g.name AS toName, type(r) AS relationshipType
        `;
        const result = await session.run(query, {
            movieTitle: input.movieTitle,
            genreNames: input.genreNames
        });

        if (result.records.length === 0) {
             throw new Error(`Failed to connect movie '${input.movieTitle}' to genres. Ensure movie exists.`);
        }

        result.records.forEach(record => {
            results.push({
                message: `Relationship HAS_GENRE created/updated.`,
                from: record.get('fromName'),
                to: record.get('toName'),
                type: record.get('relationshipType')
            });
        });
        return results;
    } finally {
        await session.close();
    }
}

/**
 * Adds a new studio or updates an existing one.
 * @param {IAddStudioInput} input - Studio details.
 * @returns {Promise<IStudioResponse>} The created or updated studio.
 */
export async function addStudio(input: IAddStudioInput): Promise<IStudioResponse> {
    const session = getSession();
    try {
        const query = `
            MERGE (s:Studio {name: $name})
            RETURN s
        `;
        const result = await session.run(query, { name: input.name });
        const studioNode = result.records[0].get('s');
        return studioNode.properties as IStudioResponse;
    } finally {
        await session.close();
    }
}

/**
 * Connects a studio to a movie it produced.
 * @param {IConnectStudioToMovieInput} input - Studio name and movie title.
 * @returns {Promise<IRelationshipCreatedResponse>} Confirmation of the relationship.
 */
export async function connectStudioToMovie(input: IConnectStudioToMovieInput): Promise<IRelationshipCreatedResponse> {
    const session = getSession();
    try {
        const query = `
            MATCH (s:Studio {name: $studioName})
            MATCH (m:Movie {title: $movieTitle})
            MERGE (s)-[r:PRODUCED]->(m)
            RETURN s.name AS fromName, m.title AS toName, type(r) AS relationshipType
        `;
        const result = await session.run(query, {
            studioName: input.studioName,
            movieTitle: input.movieTitle
        });

        if (result.records.length === 0) {
            throw new Error(`Failed to connect studio '${input.studioName}' to movie '${input.movieTitle}'. Ensure both exist.`);
        }

        const record = result.records[0];
        return {
            message: `Relationship PRODUCED created/updated.`,
            from: record.get('fromName'),
            to: record.get('toName'),
            type: record.get('relationshipType')
        };
    } finally {
        await session.close();
    }
}