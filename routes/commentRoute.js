const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const utilities = require('../utilities/');

// Route to add a new comment
router.post(
    '/comment/add',
    utilities.checkLogin,
    utilities.handleErrors(commentController.addComment)
);

// Route to delete a comment
router.post(
    '/comment/delete/:commentId',
    utilities.checkLogin,
    utilities.handleErrors(commentController.deleteComment)
);

module.exports = router;
