const express = require("express");
const { getTopics } = require("../controllers/topics-controllers");
const topicsRouter = express.Router();

topicsRouter.get("", getTopics);

// topicsRouter.post("", postTopics)

// POST /api/topics

module.exports = topicsRouter;
