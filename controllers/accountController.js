const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()
const utilities = require('../utilities/index')

const accountController = {};
const accountModel = require('../models/account-model'); // Import account model

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async (req, res, next) => {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
    });
};

/* ****************************************
*  Deliver account management view
* *************************************** */
accountController.buildAccountManagement = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      loggedin: req.session.loggedin,
      accountData: req.session.accountData
  });
};


/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async (req, res, next) => {
    let nav = await utilities.getNav();
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    });
};

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async (req, res) => {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password, account_type } = req.body;

  // Validate account_type
  const validAccountTypes = ["Client", "Employee", "Admin"];
  if (!validAccountTypes.includes(account_type)) {
    req.flash("notice", "Invalid account type selected. Please try again.");
    return res.status(400).render("account/register", {
      title: "Registration",
      nav,
      errors: [{ msg: "Invalid account type selected." }],
    });
  }

  // Hash the password before storing
  let hashedPassword = await bcrypt.hash(account_password, 10);
  
  const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword,
      account_type // Pass the selected account type to the model
  );

  if (typeof regResult === 'string') {
      req.flash("notice", regResult);
      res.status(501).render("account/register", {
          title: "Registration",
          nav,
          errors: regResult
      });
      return;
  }

  req.flash("success", `Congratulations, you\'re registered as a ${account_type}, ${account_firstname}. Please log in.`);
  res.status(201).render("account/login", {
      title: "Login",
      nav,
  });
};

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async (req, res) => {
    try {
      let nav = await utilities.getNav()
      const { account_email, account_password } = req.body
      
      const accountData = await accountModel.getAccountByEmail(account_email)
      
      if (!accountData) {
        return res.render("account/login", {
          title: "Login",
          nav,
          loginError: true,
          account_email,
        })
      }
      
      const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
      
      if (passwordMatch) {
        delete accountData.account_password
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
        
        if(process.env.NODE_ENV === 'development') {
          res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        } else {
          res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }
        
        // Set session variables
        req.session.loggedin = 1
        req.session.accountData = accountData
        
        return res.redirect("/account")
      } else {
        return res.render("account/login", {
          title: "Login",
          nav,
          loginError: true,
          account_email,
        })
      }
  } catch (error) {
    console.error("Login error:", error)
    req.flash("notice", "An error occurred during login. Please try again.")
    let nav = await utilities.getNav()
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: req.body.account_email,
    })
  }
}



/* ****************************************
*  Deliver account update view
* *************************************** */
accountController.buildAccountUpdate = async (req, res, next) => {
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  
  let nav = await utilities.getNav()
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    accountData,
  })
};

/* ****************************************
*  Process Account Update
* *************************************** */
accountController.updateAccount = async (req, res, next) => {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  
  try {
    const updateResult = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id
    );
    
    // Get updated account data
    const accountData = await accountModel.getAccountById(account_id);
    
    // Update session
    req.session.accountData = accountData;
    
    req.flash("success", "Account information updated successfully");
    return res.redirect("/account/");
  } catch (error) {
    console.error("Account update error:", error);
    
    // Prepare error-specific messages
    let message = "Update failed. Please try again.";
    if (error.message.includes("Email already exists")) {
      message = "That email is already in use. Please use a different email.";
    }
    
    req.flash("notice", message);
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: { 
        account_id,
        account_firstname,
        account_lastname,
        account_email
      },
    });
  }
};

/* ****************************************
*  Process Password Update
* *************************************** */
accountController.updatePassword = async (req, res, next) => {
  let nav = await utilities.getNav();
  const { account_password, account_id } = req.body;
  
  try {
    // Validate password meets requirements
    if (account_password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(account_password, 10);
    
    const updateResult = await accountModel.updatePassword(hashedPassword, account_id);
    
    req.flash("success", "Password updated successfully");
    return res.redirect("/account/");
  } catch (error) {
    console.error("Password update error:", error);
    
    // Get account data for the form
    const accountData = await accountModel.getAccountById(account_id);
    
    // Prepare error message
    let message = "Password update failed. Please try again.";
    if (error.message.includes("at least 8 characters")) {
      message = "Password must be at least 8 characters long.";
    }
    
    req.flash("notice", message);
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData,
    });
  }
};

/* ****************************************
*  Process logout request
* *************************************** */
accountController.accountLogout = (req, res) => {
  res.clearCookie("jwt")
  req.session.loggedin = 0
  delete req.session.accountData
  req.flash("success", "You have been logged out")
  res.redirect("/")
}


module.exports = accountController;
