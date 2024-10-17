const { selectTopics, insertTopic } = require("../models/topics-models");
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

exports.postTopic = (request, response, next) => {
  const { body } = request;
  insertTopic(body)
    .then((newTopic) => {
      response.status(201).send({topic: newTopic})
    })
    .catch((err) => {
      next(err)
    })
};
