const { selectTopics } = require("../models/topics-models");
const endpoints = require("../endpoints.json");
const { request, response } = require("express");

exports.getEndpoints = (request, response, next) => {
  return response.status(200).send({ endpoints });
};

exports.getTopics = (request, response, next) => {
  selectTopics()
    .then((topicData) => {
      response.status(200).send({ topics: topicData });
    })
    .catch((err) => {
      next(err);
    });
};
