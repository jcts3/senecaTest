const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.STATS_TABLE;

module.exports = async event => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `postMethod only accepts GET method, you tried: ${event.httpMethod} method.`
    );
  }

  console.info("received:", event);

  const userId = event.headers["X-User-ID"];
  const { courseId, sessionId } = event.pathParameters;
  const skval = `${courseId}-${sessionId}`;

  const params = {
    TableName: tableName,
    KeyConditionExpression: "#id = :id and #sk = :skval",
    ProjectionExpression: [
      "sessionId",
      "averageScore",
      "timeStudied",
      "totalModulesStudied"
    ],
    ExpressionAttributeNames: {
      "#id": "id",
      "#sk": "sk"
    },
    ExpressionAttributeValues: {
      ":id": userId,
      ":skval": skval
    }
  };
  console.info("request for ddb", params);

  const result = await docClient.query(params).promise();
  console.info("result", result);

  const response = {
    statusCode: 200,
    body: JSON.stringify(result.Items[0])
  };
  return response;
};
