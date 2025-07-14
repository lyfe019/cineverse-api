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
    IAddStudioInput,
    IConnectStudioToMovieInput,
    IGenreResponse,
    IStudioResponse,
    IDeleteMovieInput,
    IDeletePersonInput,
    IDeleteRelationshipInput,
    IMovieByActorResponse,
    IActorInMovieResponse,
    ICoActorResponse,
    ISharedMovieResponse,
    IShortestPathResponse,
    IPathSegment,
    IRecommendedMovieResponse,
    ITopPersonResponse,
    ICommonDirectorResponse
} from '../interfaces/movie.js';
import neo4j from 'neo4j-driver';

// NEW IMPORT: Custom Error Classes
import { NotFoundError, BadRequestError, DatabaseError } from '../utils/errors.js'; // <-- NEW IMPORT

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
    } catch (error: any) {
        // Check for unique constraint violation (Neo4jError code for constraint violation)
        if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
            throw new BadRequestError(`Movie with title '${input.title}' already exists.`);
        }
        throw new DatabaseError(`Failed to add movie: ${error.message}`, error); // Wrap other DB errors
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
    } catch (error: any) {
        if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
            throw new BadRequestError(`Person with name '${input.name}' already exists.`);
        }
        throw new DatabaseError(`Failed to add person: ${error.message}`, error);
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
        return null; // Return null if not found, controller will handle 404
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve movie by title: ${error.message}`, error);
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
        return null; // Return null if not found, controller will handle 404
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve person by name: ${error.message}`, error);
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
    } catch (error: any) {
        throw new DatabaseError(`Failed to list all movies: ${error.message}`, error);
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
    } catch (error: any) {
        throw new DatabaseError(`Failed to list all people: ${error.message}`, error);
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
            throw new NotFoundError(`Actor '${input.actorName}' or movie '${input.movieTitle}' not found.`); // <-- THROW CUSTOM ERROR
        }

        const record = result.records[0];
        return {
            message: `Relationship ACTED_IN created/updated.`,
            from: record.get('fromName'),
            to: record.get('toName'),
            type: record.get('relationshipType'),
            properties: { roles: record.get('properties') }
        };
    } catch (error: any) {
        if (error instanceof NotFoundError) throw error; // Re-throw NotFoundError if already thrown
        throw new DatabaseError(`Failed to connect actor '${input.actorName}' to movie '${input.movieTitle}': ${error.message}`, error); // <-- WRAP OTHER ERRORS
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
            throw new NotFoundError(`Director '${input.directorName}' or movie '${input.movieTitle}' not found.`); // <-- THROW CUSTOM ERROR
        }

        const record = result.records[0];
        return {
            message: `Relationship DIRECTED created/updated.`,
            from: record.get('fromName'),
            to: record.get('toName'),
            type: record.get('relationshipType')
        };
    } catch (error: any) {
        if (error instanceof NotFoundError) throw error;
        throw new DatabaseError(`Failed to connect director '${input.directorName}' to movie '${input.movieTitle}': ${error.message}`, error); // <-- WRAP OTHER ERRORS
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
    } catch (error: any) {
        if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
            throw new BadRequestError(`Genre with name '${input.name}' already exists.`);
        }
        throw new DatabaseError(`Failed to add genre: ${error.message}`, error);
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
            // This indicates the movie wasn't found, or no genres were provided/connected
            throw new NotFoundError(`Movie '${input.movieTitle}' not found or no genres were connected.`); // <-- THROW CUSTOM ERROR
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
    } catch (error: any) {
        if (error instanceof NotFoundError) throw error;
        throw new DatabaseError(`Failed to connect movie '${input.movieTitle}' to genres: ${error.message}`, error); // <-- WRAP OTHER ERRORS
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
        const result = await session.run(query, input);
        const studioNode = result.records[0].get('s');
        return studioNode.properties as IStudioResponse;
    } catch (error: any) {
        if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
            throw new BadRequestError(`Studio with name '${input.name}' already exists.`);
        }
        throw new DatabaseError(`Failed to add studio: ${error.message}`, error);
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
        const result = await session.run(query, input);

        if (result.records.length === 0) {
            throw new NotFoundError(`Studio '${input.studioName}' or movie '${input.movieTitle}' not found.`); // <-- THROW CUSTOM ERROR
        }

        const record = result.records[0];
        return {
            message: `Relationship PRODUCED created/updated.`,
            from: record.get('fromName'),
            to: record.get('toName'),
            type: record.get('relationshipType')
        };
    } catch (error: any) {
        if (error instanceof NotFoundError) throw error;
        throw new DatabaseError(`Failed to connect studio '${input.studioName}' to movie '${input.movieTitle}': ${error.message}`, error); // <-- WRAP OTHER ERRORS
    } finally {
        await session.close()
    }
}

/**
 * Deletes a movie node and all its relationships.
 * @param {string} title - The title of the movie to delete.
 * @returns {Promise<string>} A confirmation message.
 */
export async function deleteMovie(title: string): Promise<string> {
    const session = getSession();
    try {
        const query = `
            MATCH (m:Movie {title: $title})
            DETACH DELETE m
        `;
        const result = await session.run(query, { title });

        // Robust check: If no updates (including deletions) occurred, it means the node wasn't found.
        if (!result.summary.updateStatistics.containsUpdates()) {
            throw new NotFoundError(`Movie with title '${title}' not found or could not be deleted.`); // <-- THROW CUSTOM ERROR
        }
        return `Movie '${title}' and its relationships deleted successfully.`;
    } catch (error: any) {
        if (error instanceof NotFoundError) throw error;
        throw new DatabaseError(`Failed to delete movie '${title}': ${error.message}`, error); // <-- WRAP OTHER ERRORS
    } finally {
        await session.close();
    }
}

/**
 * Deletes a person node and all their relationships.
 * @param {string} name - The name of the person to delete.
 * @returns {Promise<string>} A confirmation message.
 */
export async function deletePerson(name: string): Promise<string> {
    const session = getSession();
    try {
        const query = `
            MATCH (p:Person {name: $name})
            DETACH DELETE p
        `;
        const result = await session.run(query, { name });

        // Robust check: If no updates (including deletions) occurred, it means the node wasn't found.
        if (!result.summary.updateStatistics.containsUpdates()) {
            throw new NotFoundError(`Person with name '${name}' not found or could not be deleted.`); // <-- THROW CUSTOM ERROR
        }
        return `Person '${name}' and their relationships deleted successfully.`;
    } catch (error: any) {
        if (error instanceof NotFoundError) throw error;
        throw new DatabaseError(`Failed to delete person '${name}': ${error.message}`, error); // <-- WRAP OTHER ERRORS
    } finally {
        await session.close();
    }
}

/**
 * Deletes a specific relationship between two entities.
 * Note: This implementation assumes 'from' is a Person and 'to' is a Movie
 * and uses their unique names to identify them. For more generic deletion,
 * you might need to pass node IDs or more specific labels/properties.
 * @param {IDeleteRelationshipInput} input - Details to identify the relationship.
 * @returns {Promise<string>} A confirmation message.
 */
export async function deleteRelationship(input: IDeleteRelationshipInput): Promise<string> {
    const session = getSession();
    try {
        const query = `
            MATCH (from)-[r]->(to)
            WHERE from.name = $fromName
              AND to.title = $toName
              AND type(r) = $relationshipType
            DELETE r
        `;
        const result = await session.run(query, {
            fromName: input.fromName,
            toName: input.toName,
            relationshipType: input.relationshipType
        });

        // Robust check: If no updates (including deletions) occurred, it means the relationship wasn't found.
        if (!result.summary.updateStatistics.containsUpdates()) {
            throw new NotFoundError(`Relationship of type '${input.relationshipType}' from '${input.fromName}' to '${input.toName}' not found or could not be deleted.`); // <-- THROW CUSTOM ERROR
        }
        return `Relationship '${input.relationshipType}' from '${input.fromName}' to '${input.toName}' deleted successfully.`;
    } catch (error: any) {
        if (error instanceof NotFoundError) throw error;
        throw new DatabaseError(`Failed to delete relationship: ${error.message}`, error); // <-- WRAP OTHER ERRORS
    } finally {
        await session.close();
    }
}

/**
 * Retrieves all movies an actor has acted in, including their roles.
 * @param {string} actorName - The name of the actor.
 * @returns {Promise<IMovieByActorResponse[]>} A list of movies with roles.
 */
export async function getMoviesByActor(actorName: string): Promise<IMovieByActorResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (p:Person {name: $actorName})-[r:ACTED_IN]->(m:Movie)
            RETURN m.title AS title, m.released AS released, m.tagline AS tagline, r.roles AS roles
        `;
        const result = await session.run(query, { actorName });
        return result.records.map(record => ({
            title: record.get('title'),
            released: record.get('released'),
            tagline: record.get('tagline'),
            roles: record.get('roles') // Roles from the relationship property
        })) as IMovieByActorResponse[];
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve movies by actor '${actorName}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Retrieves all actors who acted in a specific movie, including their roles.
 * @param {string} movieTitle - The title of the movie.
 * @returns {Promise<IActorInMovieResponse[]>} A list of actors with their roles in the movie.
 */
export async function getActorsInMovie(movieTitle: string): Promise<IActorInMovieResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (p:Person)-[r:ACTED_IN]->(m:Movie {title: $movieTitle})
            RETURN p.name AS actorName, r.roles AS roles
        `;
        const result = await session.run(query, { movieTitle });
        return result.records.map(record => ({
            actorName: record.get('actorName'),
            roles: record.get('roles')
        })) as IActorInMovieResponse[];
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve actors in movie '${movieTitle}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Retrieves all movies a person has directed.
 * @param {string} directorName - The name of the director.
 * @returns {Promise<IMovieResponse[]>} A list of movies directed by the person.
 */
export async function getMoviesDirectedByPerson(directorName: string): Promise<IMovieResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (p:Person {name: $directorName})-[:DIRECTED]->(m:Movie)
            RETURN m
        `;
        const result = await session.run(query, { directorName });
        return result.records.map(record => record.get('m').properties as IMovieResponse);
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve movies directed by '${directorName}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Retrieves all movies belonging to a specific genre.
 * @param {string} genreName - The name of the genre.
 * @returns {Promise<IMovieResponse[]>} A list of movies in that genre.
 */
export async function getMoviesByGenre(genreName: string): Promise<IMovieResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (m:Movie)-[:HAS_GENRE]->(g:Genre {name: $genreName})
            RETURN m
        `;
        const result = await session.run(query, { genreName });
        return result.records.map(record => record.get('m').properties as IMovieResponse);
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve movies by genre '${genreName}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Retrieves all movies produced by a specific studio.
 * @param {string} studioName - The name of the studio.
 * @returns {Promise<IMovieResponse[]>} A list of movies produced by that studio.
 */
export async function getMoviesByStudio(studioName: string): Promise<IMovieResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (s:Studio {name: $studioName})-[:PRODUCED]->(m:Movie)
            RETURN m
        `;
        const result = await session.run(query, { studioName });
        return result.records.map(record => record.get('m').properties as IMovieResponse);
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve movies by studio '${studioName}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Retrieves all genres associated with a specific movie.
 * @param {string} movieTitle - The title of the movie.
 * @returns {Promise<IGenreResponse[]>} A list of genres for the movie.
 */
export async function getGenresOfMovie(movieTitle: string): Promise<IGenreResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (m:Movie {title: $movieTitle})-[:HAS_GENRE]->(g:Genre)
            RETURN g
        `;
        const result = await session.run(query, { movieTitle });
        return result.records.map(record => record.get('g').properties as IGenreResponse);
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve genres of movie '${movieTitle}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Retrieves the studio that produced a specific movie.
 * Note: Assumes a movie is produced by at most one studio for simplicity.
 * @param {string} movieTitle - The title of the movie.
 * @returns {Promise<IStudioResponse | null>} The studio details or null if not found.
 */
export async function getStudioOfMovie(movieTitle: string): Promise<IStudioResponse | null> {
    const session = getSession();
    try {
        const query = `
            MATCH (s:Studio)-[:PRODUCED]->(m:Movie {title: $movieTitle})
            RETURN s
        `;
        const result = await session.run(query, { movieTitle });
        if (result.records.length > 0) {
            const studioNode = result.records[0].get('s');
            return studioNode.properties as IStudioResponse;
        }
        return null; // Controller will handle 404
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve studio of movie '${movieTitle}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}
/**
 * Finds other actors who have acted in the same movie as a given actor.
 * @param {string} actorName - The name of the actor.
 * @returns {Promise<ICoActorResponse[]>} A list of co-actors.
 */
export async function getCoActors(actorName: string): Promise<ICoActorResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (p1:Person {name: $actorName})-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(p2:Person)
            WHERE p1 <> p2 // Exclude the original actor
            RETURN p2.name AS name, count(m) AS sharedMoviesCount
            ORDER BY sharedMoviesCount DESC, name ASC
        `;
        const result = await session.run(query, { actorName });
        return result.records.map(record => ({
            name: record.get('name'),
            // CORRECTED LINE: Use 'sharedMoviesCount' to match the ICoActorResponse interface
            sharedMoviesCount: record.get('sharedMoviesCount').toNumber() // Convert Neo4j Integer to JS number
        })) as ICoActorResponse[];
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve co-actors for '${actorName}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Finds all movies that two specific actors have acted in together.
 * @param {string} actor1Name - The name of the first actor.
 * @param {string} actor2Name - The name of the second actor.
 * @returns {Promise<ISharedMovieResponse[]>} A list of shared movie titles.
 */
export async function getSharedMoviesBetweenActors(actor1Name: string, actor2Name: string): Promise<ISharedMovieResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (p1:Person {name: $actor1Name})-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(p2:Person {name: $actor2Name})
            RETURN m.title AS title, m.released AS released, m.tagline AS tagline
            ORDER BY m.title ASC
        `;
        const result = await session.run(query, { actor1Name, actor2Name });
        return result.records.map(record => ({
            title: record.get('title'),
            released: record.get('released'),
            tagline: record.get('tagline')
        })) as ISharedMovieResponse[];
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve shared movies between '${actor1Name}' and '${actor2Name}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Finds the shortest chain of movies and actors connecting two specified actors.
 * @param {string} actor1Name - The name of the first actor.
 * @param {string} actor2Name - The name of the second actor.
 * @returns {Promise<IShortestPathResponse | null>} The path details or null if no path found.
 */
export async function getShortestPathBetweenActors(actor1Name: string, actor2Name: string): Promise<IShortestPathResponse | null> {
    const session = getSession();
    try {
        const query = `
            MATCH (p1:Person {name: $actor1Name}), (p2:Person {name: $actor2Name})
            CALL apoc.algo.shortestPath(p1, p2, 'ACTED_IN|DIRECTED>', 5) YIELD path
            // Note: apoc.algo.shortestPath is part of APOC library. Ensure APOC is installed on your Neo4j instance.
            // If APOC is not installed, a pure Cypher path query would be more complex but possible.
            RETURN path
        `;
        const result = await session.run(query, { actor1Name, actor2Name });

        if (result.records.length === 0) {
            return null; // No path found, controller will handle 404
        }

        const path = result.records[0].get('path');
        if (!path) {
            return null; // Should not happen if records.length > 0 but good defensive check
        }

        const pathSegments: IPathSegment[] = [];

        // Iterate through nodes and relationships in the path
        for (let i = 0; i < path.segments.length; i++) {
            const segment = path.segments[i];

            // Add start node of the segment
            const startNode = segment.start;
            pathSegments.push({
                type: 'node',
                label: startNode.labels[0], // Assuming one primary label
                name: startNode.properties.name,
                title: startNode.properties.title
            });

            // Add relationship of the segment
            const relationship = segment.relationship;
            pathSegments.push({
                type: 'relationship',
                relationshipType: relationship.type,
                roles: (relationship.properties as any).roles // Cast to any to access roles property
            });

            // If this is the last segment, add its end node
            if (i === path.segments.length - 1) {
                const endNode = segment.end;
                pathSegments.push({
                    type: 'node',
                    label: endNode.labels[0],
                    name: endNode.properties.name,
                    title: endNode.properties.title
                });
            }
        }

        return {
            path: pathSegments,
            length: path.length // Path length is a Neo4j Integer, but JavaScript handles it here
        };

    } catch (error: any) {
        console.error(`Error finding shortest path between ${actor1Name} and ${actor2Name}:`, error);
        // Check if error is related to APOC not being installed
        if (error.code === 'Neo.ClientError.Procedure.ProcedureNotFound') {
            throw new DatabaseError("APOC library not installed or configured on Neo4j. Shortest path feature requires APOC.", error); // <-- THROW CUSTOM ERROR
        }
        throw new DatabaseError(`Failed to find shortest path between '${actor1Name}' and '${actor2Name}': ${error.message}`, error); // <-- WRAP OTHER ERRORS
    } finally {
        await session.close();
    }
}

// --- Advanced Recommendation Services ---

/**
 * Recommends movies based on shared genres with a given movie.
 * Excludes the original movie itself.
 * @param {string} movieTitle - The title of the movie to base recommendations on.
 * @returns {Promise<IRecommendedMovieResponse[]>} A list of recommended movies.
 */
export async function recommendMoviesBySharedGenres(movieTitle: string): Promise<IRecommendedMovieResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (m1:Movie {title: $movieTitle})-[:HAS_GENRE]->(g:Genre)<-[:HAS_GENRE]-(m2:Movie)
            WHERE m1 <> m2 // Exclude the original movie
            RETURN m2.title AS title, m2.released AS released, m2.tagline AS tagline,
                   COLLECT(g.name) AS sharedGenres, COUNT(DISTINCT g) AS commonGenreCount
            ORDER BY commonGenreCount DESC, m2.title ASC
            LIMIT 10 // Limit to top 10 recommendations
        `;
        const result = await session.run(query, { movieTitle });
        return result.records.map(record => ({
            title: record.get('title'),
            released: record.get('released'),
            tagline: record.get('tagline'),
            reason: `Shared Genres: ${record.get('sharedGenres').join(', ')}` // Provide a reason
        })) as IRecommendedMovieResponse[];
    } catch (error: any) {
        throw new DatabaseError(`Failed to recommend movies by shared genres for '${movieTitle}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Recommends movies based on shared cast or crew (actors or directors) with a given movie.
 * Excludes the original movie itself.
 * @param {string} movieTitle - The title of the movie to base recommendations on.
 * @returns {Promise<IRecommendedMovieResponse[]>} A list of recommended movies.
 */
export async function recommendMoviesBySharedCastCrew(movieTitle: string): Promise<IRecommendedMovieResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (m1:Movie {title: $movieTitle})<-[r1:ACTED_IN|DIRECTED]-(p:Person)
            MATCH (p)-[r2:ACTED_IN|DIRECTED]->(m2:Movie)
            WHERE m1 <> m2 // Exclude the original movie
            RETURN m2.title AS title, m2.released AS released, m2.tagline AS tagline,
                   COLLECT(DISTINCT p.name) AS sharedCastCrew, COUNT(DISTINCT p) AS commonCastCrewCount
            ORDER BY commonCastCrewCount DESC, m2.title ASC
            LIMIT 10 // Limit to top 10 recommendations
        `;
        const result = await session.run(query, { movieTitle });
        return result.records.map(record => ({
            title: record.get('title'),
            released: record.get('released'),
            tagline: record.get('tagline'),
            reason: `Shared Cast/Crew: ${record.get('sharedCastCrew').join(', ')}` // Provide a reason
        })) as IRecommendedMovieResponse[];
    } catch (error: any) {
        throw new DatabaseError(`Failed to recommend movies by shared cast/crew for '${movieTitle}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}

// --- Top N & Common Directors Services ---

/**
 * Retrieves the top N actors based on the number of movies they acted in.
 * @param {number} n - The number of top actors to retrieve.
 * @returns {Promise<ITopPersonResponse[]>} A list of top actors with their movie counts.
 */
export async function getTopNActorsByMovieCount(n: number = 10): Promise<ITopPersonResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
            RETURN p.name AS name, COUNT(DISTINCT m) AS movieCount
            ORDER BY movieCount DESC
            LIMIT $n
        `;
        const result = await session.run(query, { n: neo4j.int(n) });
        return result.records.map(record => ({
            name: record.get('name'),
            movieCount: record.get('movieCount').toNumber()
        })) as ITopPersonResponse[];
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve top actors: ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Retrieves the top N directors based on the number of movies they directed.
 * @param {number} n - The number of top directors to retrieve.
 * @returns {Promise<ITopPersonResponse[]>} A list of top directors with their movie counts.
 */
export async function getTopNDirectorsByMovieCount(n: number = 10): Promise<ITopPersonResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (p:Person)-[:DIRECTED]->(m:Movie)
            RETURN p.name AS name, COUNT(DISTINCT m) AS movieCount
            ORDER BY movieCount DESC
            LIMIT $n
        `;
        const result = await session.run(query, { n: neo4j.int(n) });
        return result.records.map(record => ({
            name: record.get('name'),
            movieCount: record.get('movieCount').toNumber()
        })) as ITopPersonResponse[];
    } catch (error: any) {
        throw new DatabaseError(`Failed to retrieve top directors: ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Finds common directors between two actors.
 * @param {string} actor1Name - The name of the first actor.
 * @param {string} actor2Name - The name of the second actor.
 * @returns {Promise<ICommonDirectorResponse[]>} A list of common directors.
 */
export async function findCommonDirectorsBetweenActors(actor1Name: string, actor2Name: string): Promise<ICommonDirectorResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (p1:Person {name: $actor1Name})-[:ACTED_IN]->(m1:Movie)<-[:DIRECTED]-(d:Person)
            MATCH (p2:Person {name: $actor2Name})-[:ACTED_IN]->(m2:Movie)<-[:DIRECTED]-(d)
            RETURN DISTINCT d.name AS name
            ORDER BY name ASC
        `;
        const result = await session.run(query, { actor1Name, actor2Name });
        return result.records.map(record => ({
            name: record.get('name')
        })) as ICommonDirectorResponse[];
    } catch (error: any) {
        throw new DatabaseError(`Failed to find common directors between '${actor1Name}' and '${actor2Name}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}

/**
 * Finds movies that feature actors who have acted in movies of a specific genre.
 * This is a more complex recommendation/discovery query.
 * @param {string} genreName - The name of the genre.
 * @returns {Promise<IMovieResponse[]>} A list of movies.
 */
export async function findMoviesWithActorsFromGenre(genreName: string): Promise<IMovieResponse[]> {
    const session = getSession();
    try {
        const query = `
            MATCH (g:Genre {name: $genreName})<-[:HAS_GENRE]-(m_genre:Movie)<-[:ACTED_IN]-(p:Person)
            MATCH (p)-[:ACTED_IN]->(m_result:Movie)
            WHERE NOT (m_result)-[:HAS_GENRE]->(g) // Exclude movies already in the queried genre
            RETURN DISTINCT m_result AS m
            ORDER BY m.title ASC
            LIMIT 20 // Limit results for practicality
        `;
        const result = await session.run(query, { genreName });
        return result.records.map(record => record.get('m').properties as IMovieResponse);
    } catch (error: any) {
        throw new DatabaseError(`Failed to find movies with actors from genre '${genreName}': ${error.message}`, error);
    } finally {
        await session.close();
    }
}