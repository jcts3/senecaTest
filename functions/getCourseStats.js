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
  const processedResult = handleDynamoResult(result);

  const response = {
    statusCode: 200,
    body: JSON.stringify(processedResult)
  };

  return response;
};

const handleDynamoResult = ({ Items }) => {
  const processedResult = Items.reduce(
    (acc, record) => {
      const newAcc = {
        timeStudied: record.timeStudied + acc.timeStudied,
        totalModulesStudied:
          record.totalModulesStudied + acc.totalModulesStudied
      };
      newAcc.averageScore =
        (acc.averageScore * acc.totalModulesStudied +
          record.averageScore * record.totalModulesStudied) /
        newAcc.totalModulesStudied;
      return newAcc;
    },
    { timeStudied: 0, totalModulesStudied: 0, averageScore: 0 }
  );
  return processedResult;
};
