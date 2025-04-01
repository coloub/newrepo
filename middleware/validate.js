// middleware/validate.js

const utilities = require("../utilities/");
const { body, validationResult } = require("express-validator");
const validate = {};

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

module.exports = validate;