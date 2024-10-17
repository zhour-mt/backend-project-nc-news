const { selectUsers, selectUser } = require("../models/users-models");

exports.getUsers = (request, response, next) => {
  selectUsers()
    .then((userData) => {
      response.status(200).send({ users: userData });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUserByUsername = (request, response, next) => {
  const { username } = request.params;
  selectUser(username).then((userData) => {
    response.status(200).send({user: userData})
  }).catch((err) => {
    next(err)
  })
};
