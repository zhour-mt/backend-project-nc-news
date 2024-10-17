const express = require("express");
const { getArticles, getArticleById, patchArticleById, getArticleComments, postComment, postArticle } = require("../controllers/articles-controllers");
const articlesRouter = express.Router();

articlesRouter.get("", getArticles);

articlesRouter.post("", postArticle);

articlesRouter.get("/:article_id", getArticleById)

articlesRouter.patch("/:article_id", patchArticleById)

articlesRouter.get("/:article_id/comments", getArticleComments);

articlesRouter.post("/:article_id/comments", postComment)










module.exports = articlesRouter;
