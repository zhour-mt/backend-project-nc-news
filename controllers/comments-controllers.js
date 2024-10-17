const { removeComment, updateCommentById } = require("../models/comments-models")

exports.deleteCommentById = (request, response, next) => {
    const {comment_id} = request.params
    removeComment(comment_id).then((result) => {
        response.status(204).send({})
    }).catch((err)=>{
        next(err)
    })
}

exports.patchCommentById = (request, response, next) => {
    const {inc_votes} = request.body
    const {comment_id} = request.params
    updateCommentById(inc_votes, comment_id).then((updatedComment) => {
        response.status(200).send({updatedComment})

    }).catch((err) => {
        next(err)
    })
}