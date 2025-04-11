const Comment = require('../models/comment-model');
const utilities = require('../utilities/');

const commentController = {
    // Add a new comment
    async addComment(req, res, next) {
        try {
            const { vehicleId, comment } = req.body;
            const userId = req.session.accountData?.account_id;

            if (!userId) {
                req.flash("notice", "Please login to add a comment");
                return res.redirect('/account/login');
            }

            if (!comment) {
                req.flash("notice", "Please provide a comment");
                return res.redirect('back');
            }

            await Comment.addComment(userId, vehicleId, comment);
            req.flash("success", "Comment added successfully");
            res.redirect('back');
        } catch (error) {
            next(error);
        }
    },

    // Delete a comment
    async deleteComment(req, res, next) {
        try {
            const { commentId } = req.params;
            const userId = req.session.accountData?.account_id;

            if (!userId) {
                req.flash("notice", "Please login to delete a comment");
                return res.redirect('/account/login');
            }

            const deletedComment = await Comment.deleteComment(commentId, userId);
            
            if (!deletedComment) {
                req.flash("notice", "Comment not found or you're not authorized to delete it");
                return res.redirect('back');
            }

            req.flash("success", "Comment deleted successfully");
            res.redirect('back');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = commentController;
