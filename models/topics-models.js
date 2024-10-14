const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((results) => {
    return results.rows;
  });
};

exports.selectArticleById = (id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [id])
    .then((result) => {
      return result.rows;
    });
};

exports.selectArticles = () => {
  const comment_count = `SELECT author, COUNT(article_id) AS comment_count
    FROM comments
    JOIN articles ON articles.article_id = comments.article_id
    GROUP BY article_name;`;

  let queryString = `SELECT articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
    COUNT(comments.article_id) 
    AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id 
    GROUP BY articles.article_id 
    ORDER BY articles.created_at DESC;`;

  return db.query(queryString).then((result) => {
    return result.rows;
  });
};

//comment_count, which is the total count of all the comments with this article_id. You should make use of queries to the database in order to achieve this.
