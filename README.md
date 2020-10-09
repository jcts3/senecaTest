# Seneca Backend Task: Stats

## Deployment

Deployment is done using SAM. Either the normal commands can be used, or the yarn alias

```
yarn vbd
```

can be used (validate, build, deploy).

## Testing

Unit testing has been added to the project and can be run using

```bash
yarn test
```

Command line tests using `sam local invoke` have been used too, yarn aliases for these are given as

```bash
yarn get-c-inv
yarn get-s-inv
yarn post-c-inv
```

for the GetCourse, GetSession and PostSession endpoints respectively. In order to utilise these, env.json needs to be modified to contain the correct dynamoDB table in the cloud. (This presume the stack has been built.)

# Design

## Table Design

For scalability, minimal cost and ease of development, DynamoDB has been chosen as the preferred database for this service.

The patterns of insertion / retrieval from the DB are to be:

- All queries are against one specific user, specified by the _"X-User-Id"_ header param.
- POST about a specific _sessionId_ against a _courseId_ (by one _X-User-Id_)
- GET stats against a specific _courseId_ (by one _X-User-Id_)
- GET stats against a specific _courseId_ and specific _sessionId_ (by one _X-User-Id_)

Given the _X-User-id_ is always required, this makes sense as the PK.
In all queries the _courseId_ is also required, and this has a 'child' property of multiple *sessionId*s which is sometimes required. Therefore, a combination of these as a SK can be used, with a separating character. Queries that don't require information on specific sessions can query against the prefix of the SK.

This assumes that these are the only queries that will be used against this table. If further queries are required the table redesign may be required as this is relatively inflexible, e.g if you want to query against user properties (school? time of session?)
This also assumes that the _X-User-ID_ being referred to is a user's ID, and not an admin's, such that the point of this service is for a player to access their own individual statistics.

## Additional Assumptions

- That if a user attempts a session twice (e.g. to retry a test), that the prior history for the session in question can be disregarded. (The implicit assumption also of the sessionId remains the same on the retry)
