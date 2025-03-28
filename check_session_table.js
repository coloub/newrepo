const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    ssl: {
        rejectUnauthorized: false,
    },

    connectionString: process.env.DATABASE_URL,
});

async function checkSessionTable() {
    try {
        const res = await pool.query("SELECT to_regclass('session');");
        if (res.rows[0].to_regclass) {
            console.log("Session table exists.");
        } else {
            console.log("Session table does not exist.");
        }
    } catch (err) {
        console.error("Error checking session table:", err);
    } finally {
        await pool.end();
    }
}

checkSessionTable();
