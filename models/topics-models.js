const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((results) => {
    return results.rows;
  });
};

exports.insertTopic = (body) => {
  let insertTopicQuery = "";
  const queryValues = [];
  const topicExistsQuery = "SELECT * FROM topics";

  return db
    .query(topicExistsQuery)
    .then((result) => {
      const topicExists = result.rows.map((topic) => {
        return topic.slug;
      });

      if (topicExists.includes(body.slug)) {
        return Promise.reject({ status: 400, message: "Bad request." });
      }

      if (body.description) {
        insertTopicQuery =
          "INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *";

        queryValues.push(body.slug, body.description);
      } else {
        insertTopicQuery = "INSERT INTO topics (slug) VALUES ($1) RETURNING *";
        queryValues.push(body.slug);
      }
      return db.query(insertTopicQuery, queryValues);
    })
    .then((result) => {
      return result.rows;
    });
};
