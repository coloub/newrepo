// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Ruta para la vista de gestión de inventario
router.get("/inv", invController.showManagementView);

router.post("/add-classification", invController.addClassification); // Route to handle adding a new classification
router.get("/add-classification", invController.showAddClassificationView); // Route to show add classification view

router.post("/add-inventory", invController.addInventory); // Route to handle adding a new inventory item
router.get("/add-inventory", invController.showAddInventoryView); // Route to show add inventory view

// Route to get inventory by classification
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to get vehicle detail view
router.get("/detail/:id", invController.getVehicleDetail);

module.exports = router;
