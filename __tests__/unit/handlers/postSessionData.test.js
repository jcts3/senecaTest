const lambda = require("../../../functions/postSessionData");
const dynamodb = require("aws-sdk/clients/dynamodb");

const postEventJSON = require("../../../events/seneca-post-session.json");

const clonePostEventJSON = () => ({ ...postEventJSON });

describe("Test postSessionData handler", () => {
  let putSpy;

  beforeAll(() => {
    putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, "put");
  });

  afterAll(() => {
    putSpy.mockRestore();
  });

  it("should return OK", async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({})
    });
    const eventJSON = clonePostEventJSON();
    const result = await lambda(eventJSON);
    const expectedResult = {
      statusCode: 200,
      body: "OK"
    };
    expect(result).toEqual(expectedResult);
  });
  it("should call ddb with the right params", async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({})
    });
    const eventJSON = clonePostEventJSON();
    const result = await lambda(eventJSON);

    const expectedParams = {
      TableName: undefined,
      Item: {
        id: "James123",
        sk: "maths1-iamasessionid4",
        sessionId: "iamasessionid4",
        totalModulesStudied: 2,
        averageScore: 70,
        timeStudied: 1234567,
        courseId: "maths1"
      }
    };
    expect(putSpy).toHaveBeenCalledWith(expectedParams);
  });
});
