const { errorMonitor } = require("pg/lib/client");
const {
  selectArticleById,
  selectArticles,
  selectArticleComments,
  insertComment,
  updateArticleById,
  insertArticle,
  removeArticle,
} = require("../models/articles-models");
const { totalCount } = require("../db/connection");

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
  const { sort_by, order, topic, limit, page } = request.query;
  selectArticles(sort_by, order, topic, limit, page)
    .then((articlesData) => {
      response.status(200).send({ articles: articlesData[0], totalCount: articlesData[1]});
 
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleComments = (request, response, next) => {
  const { article_id } = request.params;
  const {limit, page} = request.query
  selectArticleComments(article_id, limit, page)
    .then((commentsData) => {
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
  updateArticleById(body, article_id)
    .then((updatedArticle) => {
      response.status(200).send({ updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (request, response, next) => {
  const { body } = request;
  insertArticle(body)
    .then((newArticle) => {
      response.status(201).send({article: newArticle})
    })
    .catch((err) => {
      next(err)
    });
};

exports.deleteArticleById = (request, response, next) => {
  const {article_id} = request.params
  removeArticle(article_id).then((deletedArticle) => {
    response.status(204).send(deletedArticle)
  }).catch((err)=> {
    next(err)
  })
}

