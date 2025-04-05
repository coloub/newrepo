const express = require('express');
const router = express.Router();
const utilities = require('../utilities/index');
const invController = require('../controllers/invController');
const invValidate = require('../utilities/inventory-validation');

// Route to inventory management view
router.get("/", utilities.checkAdminEmployee, utilities.handleErrors(invController.buildManagement));

// Route to add classification view
router.get("/add-classification", utilities.checkAdminEmployee, utilities.handleErrors(invController.buildAddClassification));

// Process the add classification form
router.post("/add-classification", 
  utilities.checkAdminEmployee, 
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to add inventory view
router.get("/add-inventory", utilities.checkAdminEmployee, utilities.handleErrors(invController.buildAddInventory));

// Process the add inventory form
router.post("/add-inventory", 
  utilities.checkAdminEmployee, 
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Route to edit inventory view
router.get("/edit/:inv_id", utilities.checkAdminEmployee, utilities.handleErrors(invController.buildEditInventory));

// Process the edit inventory form
router.post("/update", 
  utilities.checkAdminEmployee, 
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to delete inventory view
router.get("/delete/:inv_id", utilities.checkAdminEmployee, utilities.handleErrors(invController.buildDeleteInventory));

// Process the delete inventory form
router.post("/delete", 
  utilities.checkAdminEmployee, 
  utilities.handleErrors(invController.deleteInventory)
);

// Route to get inventory data for AJAX requests
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

module.exports = router;
