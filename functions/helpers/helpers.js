// GET COURSE STATS

const processCourseDynamoResult = ({ Items }) => {
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

module.exports = {
  processCourseDynamoResult
};
