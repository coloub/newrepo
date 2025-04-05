const pool = require('../database/index');

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    console.log(`Intentando registrar cuenta para: ${account_email}`);
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    console.log(`Cuenta registrada con éxito. ID: ${result.rows[0].account_id}`);
    return result;
  } catch (error) {
    console.error(`Error al registrar cuenta: ${error.message}, Código: ${error.code}`);
    if (error.code === '23505') {
        return 'Email already exists. Please use a different email.';
    } else if (error.code === 'ECONNREFUSED') {
        return 'Database connection was refused. Please check your database server.';
    } else if (error.code === '42P01') {
        return 'Table "account" does not exist. Please check your database setup.';
    } else {
        return `An unexpected error occurred: ${error.message}`;
    }
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    console.log(`Buscando cuenta con email: ${account_email}`);
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]);
    
    console.log(`Resultado de la búsqueda: ${result.rowCount} filas encontradas`);
    return result.rows[0];
  } catch (error) {
    console.error(`Error al buscar cuenta por email: ${error.message}`);
    return null;
  }
}

/* *****************************
* Get account by ID
* ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

/* *****************************
* Update account information
* ***************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  try {
    // First check if email exists for another account
    const emailCheck = await pool.query(
      'SELECT account_id FROM account WHERE account_email = $1 AND account_id != $2',
      [account_email, account_id]
    );
    
    if (emailCheck.rowCount > 0) {
      throw new Error('Email already exists');
    }

    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const result = await pool.query(sql, [
      account_firstname, 
      account_lastname, 
      account_email, 
      account_id
    ]);
    
    if (result.rowCount === 0) {
      throw new Error('No account found with that ID');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Account update error:', error);
    throw error; // Re-throw for controller to handle
  }
}

/* *****************************
* Update account password
* ***************************** */
async function updatePassword(account_password, account_id) {
  try {
    // Verify password is hashed (basic check)
    if (account_password.length < 60 || account_password.includes(' ')) {
      throw new Error('Password must be hashed before storage');
    }

    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const result = await pool.query(sql, [account_password, account_id]);
    
    if (result.rowCount === 0) {
      throw new Error('No account found with that ID');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Password update error:', error);
    throw error;
  }
}


module.exports = {
  registerAccount,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword
};
