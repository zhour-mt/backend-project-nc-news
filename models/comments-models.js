const db = require("../db/connection");

exports.removeComment = (id) => {
  const commentExists = `SELECT * FROM comments WHERE comment_id = $1`;

  return db.query(commentExists, [id]).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, message: "Comment not found." });
    }
    const queryString = `DELETE FROM comments WHERE comment_id = $1`;
    return db.query(queryString, [id]);
  });
};

exports.updateCommentById = (inc_votes, id) => {
  const commentExists = `SELECT * FROM comments WHERE comment_id = $1;`;
  if (!inc_votes || typeof inc_votes !== "number") {
    return Promise.reject({ status: 400, message: "Bad request." });
  }

  return db
    .query(commentExists, [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, message: "Comment not found." });
      }
      const queryString = `SELECT * FROM comments WHERE comment_id = $1;`;
      return db.query(queryString, [id]);
    })
    .then((result) => {
      const comment = result.rows[0];
      comment.votes += inc_votes;
      return result.rows
    });
};
