const express = require("express");
const apiRouter = express.Router();
const { getEndpoints } = require("../controllers/topics-controllers");
const app = require("../app");
const topicsRouter = require("./topics-routers");
const articlesRouter = require("./article-routers");
const commentsRouter = require("./comments-routers");
const usersRouter = require("./users-routers");


apiRouter.get("", getEndpoints);

apiRouter.use("/topics", topicsRouter)

apiRouter.use("/articles", articlesRouter)

apiRouter.use("/comments", commentsRouter)

apiRouter.use("/users", usersRouter);





module.exports = apiRouter;
