// src/services/movieService.ts

import { getSession } from '../db/index.js'; // Import the getSession function
import {
    IMovie,
    IPerson,
    IAddMovieInput,
    IAddPersonInput,
    IMovieResponse,
    IPersonResponse,
    IPaginatedResponse
} from '../interfaces/movie.js'; // Import interfaces
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