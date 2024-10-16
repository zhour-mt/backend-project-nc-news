const db = require("../db/connection");
const format = require("pg-format");

exports.selectArticleById = (id) => {
  const idExists = `SELECT * FROM articles WHERE article_id = $1`

  const queryString = `SELECT articles.*, 
  COUNT(comments.article_id) AS comment_count 
  FROM articles 
  LEFT JOIN comments ON articles.article_id = comments.article_id 
  WHERE articles.article_id = $1
  GROUP BY articles.article_id;`;

  return db.query(idExists, [id]).then((result) => {
    if (result.rows.length === 0){
      return Promise.reject({ status: 404, message: "Article does not exist." })
    }
  }).then(() => {
    return db.query(queryString, [id]).then((result) => {
      return result.rows;
    });
  })
};

exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
  const lowerCaseOrder = order.toLowerCase();
  const validSortBy = [
    "author",
    "title",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];
  const validOrder = ["asc", "desc"];
  const validTopic = [];
  const queryValues = [];
  let topicString = `SELECT topic FROM articles`;

  if (!validSortBy.includes(sort_by) || !validOrder.includes(lowerCaseOrder)) {
    return Promise.reject({ status: 400, message: "Bad Request." });
  }

  return db
    .query(topicString)
    .then((result) => {
      result.rows.forEach((row) => {
        validTopic.push(row.topic);
      });
    })
    .then(() => {
      let queryString = `SELECT articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
      COUNT(comments.article_id) AS comment_count 
      FROM articles 
      LEFT JOIN comments ON articles.article_id = comments.article_id`;

      if (topic && !validTopic.includes(topic)) {
        return Promise.reject({ status: 400, message: "Bad Request." });
      }

      if (topic) {
        queryString += ` WHERE articles.topic = %L`;
        queryValues.push(topic);
      }
      queryValues.push(sort_by, lowerCaseOrder);

      queryString += ` GROUP BY articles.article_id ORDER BY %I %s;`;

      const formattedQuery = format(queryString, ...queryValues);

      return db.query(formattedQuery);
    })
    .then((result) => {
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
