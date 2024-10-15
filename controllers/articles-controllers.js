const { errorMonitor } = require("pg/lib/client");
const {
  selectArticleById,
  selectArticles,
  selectArticleComments,
  insertComment,
  updateArticleById,
} = require("../models/articles-models");

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

exports.getArticles = (request, response, next) => {
  const {sort_by, order, topic} = request.query
  selectArticles(sort_by, order, topic)
    .then((articlesData) => {
      response.status(200).send({ articles: articlesData });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleComments = (request, response, next) => {
  const { article_id } = request.params;
  selectArticleComments(article_id)
    .then((commentsData) => {
      if (commentsData.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Article does not have any comments",
        });
      }
      response.status(200).send({ comments: commentsData });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (request, response, next) => {
  const { body } = request;
  const { article_id } = request.params;
  insertComment(body, article_id)
    .then((newComment) => {
      response.status(201).send({ comment: newComment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleById = (request, response, next) => {
  const { body } = request;
  const { article_id } = request.params;
  updateArticleById(body, article_id).then((updatedArticle) =>{
    response.status(200).send({updatedArticle})
  }).catch((err) => {
    next(err)
  });
};
