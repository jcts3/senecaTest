const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const { handleCourseDynamoResult } = require("./helpers/helpers");

const tableName = process.env.STATS_TABLE;

module.exports = async event => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `postMethod only accepts GET method, you tried: ${event.httpMethod} method.`
    );
  }

  console.info("received:", event);

  const userId = event.headers["X-User-ID"];
  const { courseId } = event.pathParameters;

  const params = {
    TableName: tableName,
    KeyConditionExpression: "#id = :id and begins_with ( #sk, :skval )",
    ProjectionExpression: [
      "id",
      "sk",
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
      ":skval": courseId
    }
  };
  console.info("request for ddb", params);

  const result = await docClient.query(params).promise();
  console.info("result", result);
  const processedResult = handleCourseDynamoResult(result);

  const response = {
    statusCode: 200,
    body: JSON.stringify(processedResult)
  };

  return response;
};
