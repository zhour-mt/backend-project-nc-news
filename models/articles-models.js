const db = require("../db/connection");

exports.selectArticleById = (id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [id])
    .then((result) => {
      return result.rows;
    });
};

exports.selectArticles = () => {
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

exports.selectArticleComments = (id) => {
  return db
    .query("SELECT * FROM comments WHERE article_id = $1;", [id])
    .then((result) => {
      return result.rows;
    });
};

exports.insertComment = (body, id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found." });
      }
    })
    .then(() => {
      const queryString = `INSERT INTO comments (body, article_id, author)
      VALUES ($1, $2, $3) RETURNING *;`;
      return db.query(queryString, [body.body, id, body.author]);
    })
    .then((result) => {
      return result.rows;
    });
};

exports.updateArticleById = (body, id) => {
  const { inc_votes } = body;
  const queryString = "SELECT * FROM articles WHERE article_id = $1";
  return db.query(queryString, [id]).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, message: "Article not found." });
    }
    if (!inc_votes || typeof inc_votes !== "number") {
      return Promise.reject({ status: 400, message: "Bad request." });
    }
    result.rows[0].votes += inc_votes;
    return result.rows;
  });
};
