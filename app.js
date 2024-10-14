const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics-controllers");

app.get("/api/topics", getTopics);

app.use((err, request, response, next) => {
  response.status(500).send({ msg: "Internal Server Error." });
});

app.all("*", (request, response, next) => {
  response.status(404).send({ msg: "Path not found." });
});

module.exports = app;
