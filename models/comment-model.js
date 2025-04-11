const pool = require('../database/');

class Comment {
    // Get all comments for a specific vehicle
    static async getVehicleComments(vehicleId) {
        try {
            const query = `
                SELECT c.*, a.account_firstname, a.account_lastname 
                FROM comments c
                JOIN account a ON c.user_id = a.account_id
                WHERE c.vehicle_id = $1
                ORDER BY c.created_at DESC
            `;
            const result = await pool.query(query, [vehicleId]);
            return result.rows;
        } catch (error) {
            console.error('getVehicleComments error: ' + error);
            throw error;
        }
    }

    // Add a new comment
    static async addComment(userId, vehicleId, comment) {
        try {
            const query = `
                INSERT INTO comments (user_id, vehicle_id, comment)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await pool.query(query, [userId, vehicleId, comment]);
            return result.rows[0];
        } catch (error) {
            console.error('addComment error: ' + error);
            throw error;
        }
    }

    // Delete a comment
    static async deleteComment(commentId, userId) {
        try {
            const query = `
                DELETE FROM comments 
                WHERE comment_id = $1 AND user_id = $2
                RETURNING *
            `;
            const result = await pool.query(query, [commentId, userId]);
            return result.rows[0];
        } catch (error) {
            console.error('deleteComment error: ' + error);
            throw error;
        }
    }
}

module.exports = Comment;
