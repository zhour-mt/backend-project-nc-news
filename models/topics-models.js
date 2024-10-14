const db = require("../db/connection");

exports.selectTopics = () => {
  console.log("bye");
  return db.query("SELECT * FROM topics;").then((results) => {
    return results.rows;
  });
};
