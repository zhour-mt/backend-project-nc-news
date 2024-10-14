const { selectTopics, selectArticleById, selectArticles } = require("../models/topics-models");
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

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  selectArticleById(article_id)
    .then((articleData) => {
      if (articleData.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Article does not exist",
        });
      }
      response.status(200).send({ article: articleData });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (request, response, next) =>{
    selectArticles()
}