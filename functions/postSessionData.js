const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.STATS_TABLE;

module.exports = async event => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }

  console.info("received:", event);

  const body = JSON.parse(event.body);
  const userId = event.headers["X-User-ID"];
  const { courseId } = event.pathParameters;
  const { sessionId } = body;

  const params = {
    TableName: tableName,
    Item: {
      id: userId,
      sk: `${courseId}-${sessionId}`,
      ...body
    }
  };
  console.info("to send to ddb", params);

  const result = await docClient.put(params).promise();

  const response = {
    statusCode: 200,
    body: "OK"
  };

  return response;
};
