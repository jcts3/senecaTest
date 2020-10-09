const lambda = require("../../../functions/getSessionStats");
const dynamodb = require("aws-sdk/clients/dynamodb");

const getSessionEventJSON = require("../../../events/seneca-get-session.json");

const cloneGetSessionEvent = () => ({ ...getSessionEventJSON });

describe("Test getSessionStats handler", () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, "query");
  });

  afterAll(async () => {
    getSpy.mockRestore();
  });
  it("should call ddb with the right params", async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }) // doesn't matter for this test
    });
    const eventJSON = cloneGetSessionEvent();
    const result = await lambda(eventJSON);

    const expectedParams = {
      TableName: undefined,
      KeyConditionExpression: "#id = :id and #sk = :skval",
      ProjectionExpression: [
        "sessionId",
        "averageScore",
        "timeStudied",
        "totalModulesStudied"
      ],
      ExpressionAttributeNames: { "#id": "id", "#sk": "sk" },
      ExpressionAttributeValues: {
        ":id": "James123",
        ":skval": "maths1-iamasessionid3"
      }
    };
    expect(getSpy).toHaveBeenCalledWith(expectedParams);
  });
  it("should return the first item of what's passed to it by ddb", async () => {
    const objectToReturn = {
      Items: [
        {
          timeStudied: 1234567,
          averageScore: 100,
          sessionId: "iamasessionid3",
          totalModulesStudied: 1
        }
      ],
      Count: 1,
      ScannedCount: 1
    };
    getSpy.mockReturnValue({
      promise: () => Promise.resolve(objectToReturn)
    });
    const eventJSON = cloneGetSessionEvent();
    const result = await lambda(eventJSON);

    const expectation = {
      statusCode: 200,
      body:
        '{"timeStudied":1234567,"averageScore":100,"sessionId":"iamasessionid3","totalModulesStudied":1}'
    };

    expect(result).toEqual(expectation);
  });
});
