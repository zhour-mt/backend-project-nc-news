const { selectUsers } = require("../models/users-models");

exports.getUsers = (request, response, next) => {
    selectUsers()
    .then((userData) => {
      response.status(200).send({ users: userData });
    })
    .catch((err) => {
      next(err);
    });
};
