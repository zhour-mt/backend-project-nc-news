const { user } = require("pg/lib/defaults");
const db = require("../db/connection");

exports.selectUsers = () => {
  return db.query("SELECT * FROM users;").then((results) => {
    return results.rows;
  });
};

exports.selectUser = (username) => {
  const usernameExists = `SELECT * FROM users WHERE username = $1`;
  return db
    .query(usernameExists, [username])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, message: "User not found." });
      }
    })
    .then(() => {
      return db.query("SELECT * FROM users WHERE username = $1", [username]);
    })
    .then((result) => {
      return result.rows;
    });
};
