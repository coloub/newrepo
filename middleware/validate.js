// middleware/validate.js

const utilities = require("../utilities/");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

/*  **********************************
 *  Classification Validation Rules
 * ********************************* */
validate.classificationRules = () => {
    return [
        // Classification name is required and must only contain letters and numbers
        body("classification_name")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a classification name")
            .matches(/^[a-zA-Z0-9]+$/)
            .withMessage("Classification name can only contain letters and numbers (no spaces or special characters)")
            .custom(async (classification_name) => {
                const invModel = require("../models/inventory-model");
                const classifications = await invModel.getClassifications();
                const exists = classifications.rows.some(
                    classification => classification.classification_name.toLowerCase() === classification_name.toLowerCase()
                );
                if (exists) {
                    throw new Error(`"${classification_name}" classification already exists`);
                }
                return true;
            }),
    ];
};

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        const errorMessages = errors.array().map(error => error.msg);
        req.flash("error", errorMessages.join(' '));
        
        res.render("./inventory/add-classification", {
            title: "Add Classification",
            nav,
            flashMessage: errorMessages.join(' '),
            classification_name, // Make the form sticky
            errors,
        });
        return;
    }
    next();
};

/* **********************************
 *  Account Update Validation Rules
 * ********************************* */
validate.accountUpdateRules = () => {
    return [
      // First name validation
      body("account_firstname")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name")
        .isAlpha()
        .withMessage("First name can only contain letters"),
  
      // Last name validation
      body("account_lastname")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a last name")
        .isAlpha()
        .withMessage("Last name can only contain letters"),
  
      // Email validation
      body("account_email")
        .trim()
        .isEmail()
        .withMessage("A valid email is required")
        .normalizeEmail()
    ];
  };
  
  /* **********************************
   *  Password Update Validation Rules
   * ********************************* */
  validate.passwordUpdateRules = () => {
    return [
      // Password validation
      body("account_password")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[^a-zA-Z0-9]/)
        .withMessage("Password must contain at least one special character")
    ];
  };
  
  /* ******************************
   * Check Account Update Data
   * ***************************** */
  validate.checkUpdateData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_id } = req.body;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav();
      const accountData = await accountModel.getAccountById(account_id);
      
      req.flash("error", errors.array().map(error => error.msg).join(' '));
      
      return res.render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        accountData: {
          ...accountData,
          account_firstname,
          account_lastname,
          account_email
        }
      });
    }
    next();
  };
  
  /* ******************************
   * Check Password Update Data
   * ***************************** */
  validate.checkPasswordUpdate = async (req, res, next) => {
    const { account_password, account_id } = req.body;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav();
      const accountData = await accountModel.getAccountById(account_id);
      
      req.flash("error", errors.array().map(error => error.msg).join(' '));
      
      return res.render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        accountData
      });
    }
    next();
  };

module.exports = validate;