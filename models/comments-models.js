const db = require("../db/connection");

exports.removeComment = (id) => {
  const commentExists = `SELECT * FROM comments WHERE comment_id = $1`;

  return db
    .query(commentExists, [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, message: "Comment not found." });
      }
      const queryString = `DELETE FROM comments WHERE comment_id = $1`;
      return db.query(queryString, [id]);
    })
};
