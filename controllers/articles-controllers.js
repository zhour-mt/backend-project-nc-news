const {
  selectArticleById,
  selectArticles,
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
  selectArticles()
    .then((articlesData) => {
      response.status(200).send({ articles: articlesData });
    })
    .catch((err) => {
      next(err);
    });
};


