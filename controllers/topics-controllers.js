const { selectTopics } = require("../models/topics-models");

exports.getTopics = (request, response, next) => {
  selectTopics()
    .then((topicData) => {
      response.status(200).send({ topics: topicData });
    })
    .catch((err) => {
      next(err);
    });
};
