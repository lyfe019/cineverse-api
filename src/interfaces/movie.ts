// --- Node Interfaces (Representing Data in the Graph) ---

export interface IPerson {
    name: string;
    born?: number; // Year of birth, optional
}

export interface IMovie {
    title: string;
    released?: number; // Release year, optional
    tagline?: string; // Movie tagline, optional
}

export interface IGenre {
    name: string; // Genre name, e.g., "Sci-Fi", "Comedy"
}

export interface IStudio {
    name: string; // Studio name
}

// --- Relationship Property Interfaces ---

export interface IActedInProperties {
    roles: string[]; // Array of roles played by the actor in the movie
}

// For relationships without specific properties, we can define empty interfaces
export interface IDirectedProperties {}
export interface IHasGenreProperties {}
export interface IProducedProperties {}

// --- API Input Payload Interfaces (Data received from clients) ---

export interface IAddMovieInput {
    title: string;
    released?: number;
    tagline?: string;
}

export interface IAddPersonInput {
    name: string;
    born?: number;
}

export interface IAddGenreInput {
    name: string;
}

export interface IAddStudioInput {
    name: string;
}

export interface IConnectActorToMovieInput {
    actorName: string;
    movieTitle: string;
    roles: string[];
}

export interface IConnectDirectorToMovieInput {
    directorName: string;
    movieTitle: string;
}

export interface IConnectMovieToGenreInput {
    movieTitle: string;
    genreNames: string[]; // Allows connecting to multiple genres at once
}

export interface IConnectStudioToMovieInput {
    studioName: string;
    movieTitle: string;
}

export interface IDeleteMovieInput {
    title: string;
}

export interface IDeletePersonInput {
    name: string;
}

export interface IDeleteRelationshipInput {
    fromName: string; // Name of the source node (e.g., actorName)
    toName: string;   // Name of the target node (e.g., movieTitle)
    relationshipType: string; // Type of relationship (e.g., "ACTED_IN", "DIRECTED")
    // Add specific properties if needed to identify a unique relationship instance
    // e.g., roles?: string[]; for ACTED_IN
}

// --- API Response Interfaces (Data sent back to clients) ---

// Basic response for created/updated entities
export interface IMovieResponse extends IMovie {
    // Could add ID, URL, etc., if exposed by the API
}

export interface IPersonResponse extends IPerson {
    // Could add ID, URL, etc.
}

export interface IGenreResponse extends IGenre {}
export interface IStudioResponse extends IStudio {}

// Response for relationship creation
export interface IRelationshipCreatedResponse {
    message: string;
    from: string;
    to: string;
    type: string;
    properties?: any; // Dynamic properties of the relationship
}

// Responses for lists with pagination
export interface IPaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}

// Responses for specific relationship queries
export interface IMovieDetailsResponse extends IMovieResponse {
    actors?: IActorInMovieResponse[];
    directors?: IPersonResponse[];
    genres?: IGenreResponse[];
    studio?: IStudioResponse;
}

export interface IPersonDetailsResponse extends IPersonResponse {
    actedInMovies?: IMovieResponse[];
    directedMovies?: IMovieResponse[];
}

export interface IActorInMovieResponse {
    actorName: string;
    roles: string[];
}

export interface IMovieByActorResponse extends IMovieResponse {
    roles: string[]; // Roles played by the queried actor in this movie
}

export interface ICoActorResponse extends IPersonResponse {
    sharedMoviesCount: number; // How many movies they shared
}

export interface ISharedMovieResponse extends IMovieResponse {
    // No extra properties needed for this specific response
}

// For shortest path, representing each segment (node or relationship)
export interface IPathSegment {
    type: 'node' | 'relationship';
    label?: string; // For nodes (e.g., 'Person', 'Movie')
    name?: string; // For Person/Genre/Studio nodes
    title?: string; // For Movie nodes
    relationshipType?: string; // For relationships (e.g., 'ACTED_IN')
    roles?: string[]; // For ACTED_IN relationships
    // Add other relevant properties for path segments as needed
}

export interface IShortestPathResponse {
    path: IPathSegment[];
    length: number;
}

// For recommendations
export interface IRecommendedMovieResponse extends IMovieResponse {
    reason?: string; // e.g., "Shared Genre: Action", "Shared Actor: Keanu Reeves"
}

export interface ITopPersonResponse extends IPersonResponse {
    movieCount: number; // Number of movies acted in or directed
}

export interface ICommonDirectorResponse extends IPersonResponse {
    // No extra properties needed for this specific response
}