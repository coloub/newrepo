const pool = require('../database/index');

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
        return 'Database connection was refused. Please check your database server.';
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
        return 'There was an error with the fields provided. Please check your input.';
    } else {
        return 'An unexpected error occurred. Please try again later.';
    }

  }
}

module.exports = {
  registerAccount
};
