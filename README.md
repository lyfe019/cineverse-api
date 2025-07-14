CineVerse API
A Graph-Powered Movie and Person Data API
Welcome to the CineVerse API! This project provides a robust backend for managing movie, person (actors, directors), genre, and studio data, leveraging the power of a Neo4j graph database. It's designed to demonstrate efficient data modeling, relationship management, and advanced graph queries for insights and recommendations.

🌟 Features
Movie Management: Add, retrieve, and list movies with details like title, release year, and tagline.

Person Management: Add, retrieve, and list people (actors, directors) with their birth year.

Rich Relationships:

Connect actors to movies with specific roles (ACTED_IN).

Connect directors to movies (DIRECTED).

Assign movies to genres (HAS_GENRE).

Link studios to movies they produced (PRODUCED).

Data Deletion: Delete movies, persons, or specific relationships.

Relationship Exploration: Query movies by actor/director, actors by movie, genres by movie, and studio by movie.

Graph Insights:

Find co-actors (actors who have worked together).

Discover shared movies between any two actors.

Calculate the shortest path between two actors (requires APOC plugin in Neo44j).

Advanced Recommendations:

Recommend movies based on shared genres.

Recommend movies based on shared cast and crew.

Top N Lists: Get top actors and directors by movie count.

Robust Error Handling: Custom error classes and a centralized error handling middleware provide clear and consistent API responses for various error scenarios (e.g., Not Found, Bad Request, Database Errors, Validation Failures).

Joi Validation: Request payloads are validated using Joi for data integrity and early error detection.

Pagination: List endpoints support pagination for efficient data retrieval.

🎬 Domain Model
The CineVerse API's strength lies in its graph-based domain model, which represents entities (nodes) and their connections (relationships) in a highly intuitive and powerful way.

Nodes:
:Movie

title (String, Unique)

released (Number, Optional)

tagline (String, Optional)

:Person

name (String, Unique)

born (Number, Optional)

:Genre

name (String, Unique)

:Studio

name (String, Unique)

Relationships:
(:Person)-[:ACTED_IN {roles: ["Role1", "Role2"]}]->(:Movie)

Connects an actor to a movie, with an array of roles as a relationship property.

(:Person)-[:DIRECTED]->(:Movie)

Connects a director to a movie.

(:Movie)-[:HAS_GENRE]->(:Genre)

Connects a movie to its genre(s).

(:Studio)-[:PRODUCED]->(:Movie)

Connects a studio to a movie it produced.

Benefits of the Graph Model:
Intuitive Representation: Directly maps real-world relationships, making the data model easy to understand and evolve.

Powerful Queries: Graph queries (Cypher) are highly efficient for traversing complex relationships, finding patterns, and performing recommendations that would be cumbersome in relational databases.

Flexibility: Easily add new types of relationships or nodes without complex schema migrations.

Performance: Optimized for connected data, leading to fast query times for relationship-heavy operations.

🚀 Getting Started
Follow these steps to set up and run the CineVerse API locally.

Prerequisites
Node.js (v18 or higher): Download & Install Node.js

npm: Comes with Node.js.

Neo4j Database (v5.x recommended):

Neo4j Desktop: Easiest way to get started. Download Neo4j Desktop

Neo4j AuraDB: Cloud-hosted Neo4j. Sign up for AuraDB Free

Docker: docker run --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password -e NEO4J_dbms_connector_bolt_listen__address=0.0.0.0:7687 -e NEO4J_dbms_connector_http_listen__address=0.0.0.0:7474 neo4j:latest

Setup & Installation
Clone the repository:

git clone <repository_url>
cd cineverse-api

Install dependencies:

npm install

Configuration
Create a .env file in the root of your project and add your Neo4j connection details:

# .env
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
APP_PORT=3000

NEO4J_URI: The connection URI for your Neo4j instance.

NEO4J_USERNAME: Your Neo4j database username.

NEO4J_PASSWORD: Your Neo4j database password.

APP_PORT: The port on which the Express API will run.

Running the API
Build the TypeScript project:

npm run build

Start the API in development mode (with nodemon for auto-restarts):

npm run dev

The API will typically run on http://localhost:3000 (or your specified APP_PORT). The console will log messages about Neo4j connection and API startup.

Note: On first run or if the database is empty, the API will automatically create unique constraints for Movie titles, Person names, Genre names, and Studio names.

📋 API Endpoints
All API endpoints are prefixed with /api. For example, a route /movies means http://localhost:3000/api/movies.

1. Movie Endpoints
Create a new Movie

POST /movies

Payload (Body - JSON):

{
    "title": "string" (required, min 1 char),
    "released": "number" (optional, integer, min 1888, max current_year + 5),
    "tagline": "string" (optional, min 1 char)
}

Example: POST /api/movies with {"title": "Dune", "released": 2021, "tagline": "Fear is the mind-killer."}

Success: 201 Created

Errors: 400 Bad Request (Validation failed, Movie already exists), 500 Internal Server Error

Get Movie by Title

GET /movies/:title

Payload: None (title is in path parameter)

Example: GET /api/movies/Dune

Success: 200 OK

Errors: 404 Not Found, 500 Internal Server Error

List All Movies (with Pagination)

GET /movies

Payload (Query Parameters - Optional):

page: number (optional, integer, positive, default: 1)

limit: number (optional, integer, positive, default: 10)

Example: GET /api/movies?page=2&limit=5

Success: 200 OK

Errors: 400 Bad Request (Validation failed for query params), 500 Internal Server Error

2. Person Endpoints
Create a new Person

POST /persons

Payload (Body - JSON):

{
    "name": "string" (required, min 1 char),
    "born": "number" (optional, integer, min 1000, max current_year)
}

Example: POST /api/persons with {"name": "Denis Villeneuve", "born": 1967}

Success: 201 Created

Errors: 400 Bad Request (Validation failed, Person already exists), 500 Internal Server Error

Get Person by Name

GET /persons/:name

Payload: None (name is in path parameter)

Example: GET /api/persons/Denis%20Villeneuve

Success: 200 OK

Errors: 404 Not Found, 500 Internal Server Error

List All People (with Pagination)

GET /persons

Payload (Query Parameters - Optional):

page: number (optional, integer, positive, default: 1)

limit: number (optional, integer, positive, default: 10)

Example: GET /api/persons?page=1&limit=20

Success: 200 OK

Errors: 400 Bad Request (Validation failed for query params), 500 Internal Server Error

3. Relationship Creation Endpoints
Connect Actor to Movie

POST /actors/:actorName/act-in/:movieTitle

Path Parameters:

:actorName: Name of the actor (e.g., Tim%20Chalamet)

:movieTitle: Title of the movie (e.g., Dune)

Payload (Body - JSON):

{
    "roles": ["string"] (required, array of strings, each string min 1 char, at least one role)
}

Example: POST /api/actors/Tim%20Chalamet/act-in/Dune with {"roles": ["Paul Atreides"]}

Success: 200 OK

Errors: 400 Bad Request (Validation failed), 404 Not Found (Actor or Movie not found), 500 Internal Server Error

Connect Director to Movie

POST /directors/:directorName/direct/:movieTitle

Path Parameters:

:directorName: Name of the director (e.g., Denis%20Villeneuve)

:movieTitle: Title of the movie (e.g., Dune)

Payload: None (body is not validated by Joi, only path params are used by service)

Example: POST /api/directors/Denis%20Villeneuve/direct/Dune

Success: 200 OK

Errors: 404 Not Found (Director or Movie not found), 500 Internal Server Error

4. Genre Endpoints
Create a new Genre

POST /genres

Payload (Body - JSON):

{
    "name": "string" (required, min 1 char)
}

Example: POST /api/genres with {"name": "Sci-Fi"}

Success: 201 Created

Errors: 400 Bad Request (Validation failed, Genre already exists), 500 Internal Server Error

Connect Movie to one or more Genres

POST /movies/:movieTitle/genres

Path Parameter:

:movieTitle: Title of the movie (e.g., Dune)

Payload (Body - JSON):

{
    "genreNames": ["string"] (required, array of strings, each string min 1 char, at least one genre)
}

Example: POST /api/movies/Dune/genres with {"genreNames": ["Sci-Fi", "Adventure"]}

Success: 200 OK

Errors: 400 Bad Request (Validation failed), 404 Not Found (Movie not found or no genres connected), 500 Internal Server Error

5. Studio Endpoints
Create a new Studio

POST /studios

Payload (Body - JSON):

{
    "name": "string" (required, min 1 char)
}

Example: POST /api/studios with {"name": "Legendary Pictures"}

Success: 201 Created

Errors: 400 Bad Request (Validation failed, Studio already exists), 500 Internal Server Error

Connect Studio to Movie

POST /studios/:studioName/produces/:movieTitle

Path Parameters:

:studioName: Name of the studio (e.g., Legendary%20Pictures)

:movieTitle: Title of the movie (e.g., Dune)

Payload: None (body is not validated by Joi, only path params are used by service)

Example: POST /api/studios/Legendary%20Pictures/produces/Dune

Success: 200 OK

Errors: 404 Not Found (Studio or Movie not found), 500 Internal Server Error

6. Delete Endpoints
Delete a Movie

DELETE /movies/:title

Payload: None (title is in path parameter)

Example: DELETE /api/movies/MovieToDelete

Success: 200 OK

Errors: 404 Not Found (Movie not found or could not be deleted), 500 Internal Server Error

Delete a Person

DELETE /persons/:name

Payload: None (name is in path parameter)

Example: DELETE /api/persons/PersonToDelete

Success: 200 OK

Errors: 404 Not Found (Person not found or could not be deleted), 500 Internal Server Error

Delete a Relationship

DELETE /relationships

Payload (Body - JSON):

{
    "fromName": "string" (required, min 1 char, e.g., "Tim Chalamet"),
    "toName": "string" (required, min 1 char, e.g., "Dune"),
    "relationshipType": "string" (required, min 1 char, e.g., "ACTED_IN", "DIRECTED", "HAS_GENRE", "PRODUCED")
}

Example: DELETE /api/relationships with {"fromName": "Tim Chalamet", "toName": "Dune", "relationshipType": "ACTED_IN"}

Success: 200 OK

Errors: 400 Bad Request (Validation failed), 404 Not Found (Relationship not found or could not be deleted), 500 Internal Server Error

7. Relationship Exploration Endpoints
Get Movies by Actor

GET /actors/:actorName/movies

Example: GET /api/actors/Keanu%20Reeves/movies

Success: 200 OK (returns empty array if actor/movies not found)

Errors: 500 Internal Server Error

Get Actors in a Movie

GET /movies/:movieTitle/actors

Example: GET /api/movies/The%20Matrix/actors

Success: 200 OK (returns empty array if movie/actors not found)

Errors: 500 Internal Server Error

Get Movies Directed by Person

GET /directors/:directorName/movies

Example: GET /api/directors/Christopher%20Nolan/movies

Success: 200 OK (returns empty array if director/movies not found)

Errors: 500 Internal Server Error

Get Movies by Genre

GET /genres/:genreName/movies

Example: GET /api/genres/Sci-Fi/movies

Success: 200 OK (returns empty array if genre/movies not found)

Errors: 500 Internal Server Error

Get Movies by Studio

GET /studios/:studioName/movies

Example: GET /api/studios/Warner%20Bros./movies

Success: 200 OK (returns empty array if studio/movies not found)

Errors: 500 Internal Server Error

Get Genres of a Movie

GET /movies/:movieTitle/genres

Example: GET /api/movies/Inception/genres

Success: 200 OK (returns empty array if movie/genres not found)

Errors: 500 Internal Server Error

Get Studio of a Movie

GET /movies/:movieTitle/studio

Example: GET /api/movies/Interstellar/studio

Success: 200 OK (returns null if studio not found)

Errors: 500 Internal Server Error

8. Graph Insights Endpoints
Get Co-Actors for an Actor

GET /actors/:actorName/co-actors

Example: GET /api/actors/Leonardo%20DiCaprio/co-actors

Success: 200 OK (returns empty array if no co-actors)

Errors: 500 Internal Server Error

Get Shared Movies Between Two Actors

GET /actors/:actor1Name/shared-movies/:actor2Name

Example: GET /api/actors/Tom%20Hanks/shared-movies/Leonardo%20DiCaprio

Success: 200 OK (returns empty array if no shared movies)

Errors: 500 Internal Server Error

Get Shortest Path Between Two Actors

GET /actors/:actor1Name/path-to/:actor2Name

Example: GET /api/actors/Tom%20Hanks/path-to/Kevin%20Bacon

Success: 200 OK (returns null if no path found)

Errors: 500 Internal Server Error (e.g., if APOC library is not installed on Neo4j)

9. Advanced Recommendation Endpoints
Recommend Movies by Shared Genres

GET /movies/:movieTitle/recommendations/genre

Example: GET /api/movies/The%20Matrix/recommendations/genre

Success: 200 OK (returns empty array if no recommendations)

Errors: 500 Internal Server Error

Recommend Movies by Shared Cast/Crew

GET /movies/:movieTitle/recommendations/cast-crew

Example: GET /api/movies/Inception/recommendations/cast-crew

Success: 200 OK (returns empty array if no recommendations)

Errors: 500 Internal Server Error

10. Top N & Common Directors Endpoints
Get Top N Actors by Movie Count

GET /top-actors

Payload (Query Parameters - Optional):

n: number (optional, integer, positive, default: 10)

Example: GET /api/top-actors?n=5

Success: 200 OK

Errors: 400 Bad Request (Validation failed for query params), 500 Internal Server Error

Get Top N Directors by Movie Count

GET /top-directors

Payload (Query Parameters - Optional):

n: number (optional, integer, positive, default: 10)

Example: GET /api/top-directors?n=3

Success: 200 OK

Errors: 400 Bad Request (Validation failed for query params), 500 Internal Server Error

Find Common Directors Between Two Actors

GET /actors/:actor1Name/common-directors/:actor2Name

Example: GET /api/actors/Leonardo%20DiCaprio/common-directors/Jamie%20Foxx

Success: 200 OK (returns empty array if no common directors)

Errors: 500 Internal Server Error

Find Movies with Actors from a Specific Genre

GET /genres/:genreName/movies-with-actors

Example: GET /api/genres/Sci-Fi/movies-with-actors

Success: 200 OK (returns empty array if no movies found)

Errors: 500 Internal Server Error

🧪 Testing
While comprehensive testing setup was a later consideration, the API is designed with testability in mind.

You can run the tests using:

npm test
# To run unit tests only:
# npm run test:unit
# To run integration tests only:
# npm run test:integration

Note: Integration tests require a running Neo4j instance and will clear all data in the database specified in your .env file.

🚨 Error Handling
The API employs a centralized error handling mechanism to provide consistent and informative responses. When an error occurs, you will receive a JSON response with the following structure:

{
    "status": "error",
    "message": "A human-readable error message.",
    "details": "More specific details (e.g., validation errors, original database error message in development).",
    "errors": [ // Present for validation failures
        {
            "path": "field.subfield",
            "message": "Validation error message"
        }
    ],
    "stack": "Stack trace (only in development environment for debugging)."
}

Common HTTP Status Codes you might encounter:

200 OK: Request successful.

201 Created: Resource successfully created.

400 Bad Request: Client-side error, often due to invalid input (e.g., missing required fields, incorrect data types, unique constraint violation).

404 Not Found: The requested resource or relationship could not be found.

500 Internal Server Error: An unexpected server-side error occurred.

💡 Future Enhancements
Authentication & Authorization: Implement user authentication (e.g., JWT) and role-based access control.

More Advanced Graph Algorithms: Explore additional Neo4j Graph Data Science Library algorithms for deeper insights (e.g., community detection, centrality).

Caching: Implement caching (e.g., Redis) for frequently accessed data to improve performance.

GraphQL API: Provide a GraphQL interface for more flexible data querying by clients.

Docker Compose: Set up Docker Compose for easier local development with Neo4j and the API in containers.

CI/CD Pipeline: Automate testing and deployment with a CI/CD pipeline.

