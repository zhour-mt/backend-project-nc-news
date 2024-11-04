const express = require("express");
const app = express();
const apiRouter = require("./routers/api-routers");
const cors = require("cors");

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

// ------------ ERROR MIDDLEWARE ---------------

app.all("/*", (request, response, next) => {
  response.status(404).send({ message: "Path not found." });
  next(err);
});

app.use((err, request, response, next) => {
  if (err.code === "23502" || err.code === "22P02" || err.status === 400) {
    response.status(400).send({ message: "Bad request." });
  }
  next(err);
});

app.use((err, request, response, next) => {
  if (err.status === 404) {
    response.status(404).send({ message: err.message });
  }
  next(err);
});

app.use((err, request, response, next) => {
  response.status(500).send({ message: "Internal Server Error." });
});

module.exports = app;
