const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((results) => {
    return results.rows;
  });
};

exports.selectArticleById = (id) => {
    return db.query("SELECT * FROM articles WHERE article_id = $1", [id]).then((result) => {
        return result.rows
    })
}

exports.selectArticles = () => {
    return db.query("SELECT * FROM articles ORDER BY created_at DESC").then((result) => {
        return result.rows
    })
}