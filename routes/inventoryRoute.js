// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const validate = require("../middleware/validate"); // If using validation middleware
const { checkEmployeeAdmin } = require("../middleware/auth") // Importa el middleware

// Route for inventory management view
router.get("/", invController.showManagementView);

// Routes for classification management
router.get("/add-classification", invController.showAddClassificationView);
router.post(
    "/add-classification", 
    validate.classificationRules(), // Only if using express-validator
    validate.checkClassificationData, // Only if using express-validator
    invController.addClassification
);

// Routes for inventory management
router.get("/add-inventory", invController.showAddInventoryView);
router.post("/add-inventory", invController.addInventory);

// Routes for viewing inventory
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:id", invController.getVehicleDetail);

// API route for classifications (for AJAX requests if needed)
router.get("/api/classifications", invController.getClassifications);

// Rutas protegidas (solo para empleados y admin)
router.get("/add-classification", checkEmployeeAdmin, invController.showAddClassificationView);
router.post(
    "/add-classification", 
    checkEmployeeAdmin,
    validate.classificationRules(), 
    validate.checkClassificationData, 
    invController.addClassification
);

router.get("/add-inventory", checkEmployeeAdmin, invController.showAddInventoryView);
router.post("/add-inventory", checkEmployeeAdmin, invController.addInventory);

// Las rutas de visualización no necesitan protección
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:id", invController.getVehicleDetail);

module.exports = router;