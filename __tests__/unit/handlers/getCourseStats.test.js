const lambda = require("../../../functions/getCourseStats");
const dynamodb = require("aws-sdk/clients/dynamodb");
const {
  processCourseDynamoResult
} = require("../../../functions/helpers/helpers");

const getCourseEventJSON = require("../../../events/seneca-get-course.json");

const cloneGetCourseEvent = () => ({ ...getCourseEventJSON });

describe("Test getCourseStats handler", () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, "query");
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it("should call ddb with the right params", async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }) // doesn't matter for this test
    });
    const eventJSON = cloneGetCourseEvent();
    const result = await lambda(eventJSON);

    const expectedParams = {
      TableName: undefined,
      KeyConditionExpression: "#id = :id and begins_with ( #sk, :skval )",
      ProjectionExpression: [
        "id",
        "sk",
        "averageScore",
        "timeStudied",
        "totalModulesStudied"
      ],
      ExpressionAttributeNames: { "#id": "id", "#sk": "sk" },
      ExpressionAttributeValues: { ":id": "James123", ":skval": "maths1" }
    };
    expect(getSpy).toHaveBeenCalledWith(expectedParams);
  });
});
describe("Test processCourseDynamoResult", () => {
  it("should return the correct aggregates", () => {
    const ItemsFromDynamo = [
      {
        sk: "maths1-iamasessionid",
        timeStudied: 1234567,
        averageScore: 50,
        totalModulesStudied: 4,
        id: "James123"
      },
      {
        sk: "maths1-iamasessionid2",
        timeStudied: 1234567,
        averageScore: 52,
        totalModulesStudied: 5,
        id: "James123"
      },
      {
        sk: "maths1-iamasessionid3",
        timeStudied: 1234567,
        averageScore: 100,
        totalModulesStudied: 1,
        id: "James123"
      },
      {
        sk: "maths1-iamasessionid4",
        timeStudied: 1234567,
        averageScore: 70,
        totalModulesStudied: 2,
        id: "James123"
      }
    ];
    const processedResult = processCourseDynamoResult({
      Items: ItemsFromDynamo
    });
    const expectation = {
      timeStudied: 4938268,
      totalModulesStudied: 12,
      averageScore: 58.333333333333336
    };
    expect(processedResult).toEqual(expectation);
  });
});
