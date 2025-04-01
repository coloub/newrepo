const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const baseController = require("./baseController");

const invCont = {};

// Function to get classifications
invCont.getClassifications = baseController.handleErrors(async function (req, res, next) {
    const classifications = await invModel.getClassifications(); // Fetch classifications from the model
    res.json(classifications); // Return classifications as JSON

});

// Function to render the management view
invCont.renderManagementView = baseController.handleErrors(async function (req, res, next) {
    const flashMessage = req.flash('success'); // Assuming you're using connect-flash
    const nav = await utilities.getNav();
    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        flashMessage: flashMessage.length > 0 ? flashMessage[0] : null,
    });
});

// Function to render the add classification view
invCont.renderAddClassificationView = baseController.handleErrors(async function (req, res, next) {
    const flashMessage = req.flash('error');
    const nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        flashMessage: flashMessage.length > 0 ? flashMessage[0] : null,
    });
});

// Function to handle adding a classification
invCont.addClassification = baseController.handleErrors(async function (req, res, next) {
    const { classificationName } = req.body;
    await invModel.addClassification(classificationName); // Assuming this function exists in the model
    req.flash('success', 'Classification added successfully!');
    res.redirect('/inv/');
});

// Function to render the add inventory view
invCont.renderAddInventoryView = baseController.handleErrors(async function (req, res, next) {
    const flashMessage = req.flash('error');
    const nav = await utilities.getNav();
    res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        flashMessage: flashMessage.length > 0 ? flashMessage[0] : null,
    });
});

// Function to handle adding a vehicle
invCont.addInventory = baseController.handleErrors(async function (req, res, next) {
    const { vehicleMake, vehicleModel, classification_id, imagePath } = req.body;
    await invModel.addInventory(vehicleMake, vehicleModel, classification_id, imagePath); // Assuming this function exists in the model
    req.flash('success', 'Vehicle added successfully!');
    res.redirect('/inv/');
});


// Function to handle POST request for adding a new classification
invCont.addClassification = baseController.handleErrors(async function (req, res, next) {
    const { classification_name } = req.body;
    // Validate classification name
    if (!classification_name || !/^[a-zA-Z0-9]+$/.test(classification_name)) {
        req.flash('error', 'El nombre de la clasificación solo puede contener letras y números.');
        return res.redirect('/inv/add-classification');
    }
    // Insert classification into the database
    await invModel.addClassification(classification_name);
    req.flash('success', 'Clasificación agregada exitosamente.');
    res.redirect('/inv');
});

// Function to handle POST request for adding a new inventory item
invCont.addInventory = baseController.handleErrors(async function (req, res, next) {
    const { inv_make, inv_model, classification_id } = req.body;
    // Validate inputs
    if (!inv_make || !inv_model || !classification_id) {
        req.flash('error', 'Por favor, complete todos los campos.');
        return res.redirect('/inv/add-inventory');
    }
    // Insert inventory item into the database
    await invModel.addInventory(inv_make, inv_model, classification_id);
    req.flash('success', 'Vehículo agregado exitosamente.');
    res.redirect('/inv');
});

/* ***************************
 *  Get vehicle detail view
 * ************************** */
invCont.getVehicleDetail = baseController.handleErrors(async function (req, res, next) {
  const vehicleId = req.params.id;
  const vehicleData = await invModel.getVehicleById(vehicleId);
  if (vehicleData.length > 0) {
    const nav = await utilities.getNav();
    res.render("./inventory/detail", {
      title: vehicleData[0].inv_make + " " + vehicleData[0].inv_model,
      nav,
      vehicle: vehicleData[0],
    });
  } else {
    res.status(404).render("errors/404", { title: "Vehicle Not Found" });
  }
});

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = baseController.handleErrors(async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
});

/* ***************************
 *  Show inventory management view
 * ************************** */
invCont.showManagementView = baseController.handleErrors(async function (req, res, next) {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications(); // Fetch classifications
    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');
    const flashMessage = [...successMessages, ...errorMessages].join(' '); // Concatenate messages
    res.render("./inventory/management", {
        title: "Gestión de Inventario",
        nav,
        classifications, // Pass classifications to the view
        flashMessage,
    });
});

/* ***************************
 *  Show add classification view
 * ************************** */
invCont.showAddClassificationView = baseController.handleErrors(async function (req, res, next) {
    const nav = await utilities.getNav();
    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');
    const flashMessage = [...successMessages, ...errorMessages].join(' ');
    
    res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        flashMessage,
        errors: null,
    });
});

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.addClassification = baseController.handleErrors(async function (req, res, next) {
    const { classification_name } = req.body;
    
    // Server-side validation
    if (!classification_name || !/^[a-zA-Z0-9]+$/.test(classification_name)) {
        req.flash('error', 'Classification name can only contain letters and numbers (no spaces or special characters)');
        // Return to form with entered value (sticky form)
        return res.status(400).render("./inventory/add-classification", {
            title: "Add Classification",
            nav: await utilities.getNav(),
            flashMessage: 'Classification name can only contain letters and numbers (no spaces or special characters)',
            classification_name // Make the form sticky
        });
    }
    
    try {
        // Check if classification already exists
        const classifications = await invModel.getClassifications();
        const exists = classifications.rows.some(
            classification => classification.classification_name.toLowerCase() === classification_name.toLowerCase()
        );
        
        if (exists) {
            req.flash('error', `"${classification_name}" classification already exists`);
            return res.status(409).render("./inventory/add-classification", {
                title: "Add Classification",
                nav: await utilities.getNav(),
                flashMessage: `"${classification_name}" classification already exists`,
                classification_name // Make the form sticky
            });
        }
        
        // Add classification to database
        await invModel.addClassification(classification_name);
        
        // Build new navigation with the new classification
        const newNav = await utilities.getNav();
        
        // Set success message and redirect to inventory management
        req.flash('success', `"${classification_name}" classification added successfully`);
        return res.redirect('/inv');
    } catch (error) {
        console.error("Error in addClassification:", error);
        req.flash('error', 'Sorry, there was an error processing the request');
        
        // Return to form with entered value (sticky form)
        return res.status(500).render("./inventory/add-classification", {
            title: "Add Classification",
            nav: await utilities.getNav(),
            flashMessage: 'An error occurred. Please try again.',
            classification_name // Make the form sticky
        });
    }
});

/* ***************************
 *  Show add inventory view with classification list
 * ************************** */
invCont.showAddInventoryView = baseController.handleErrors(async function (req, res, next) {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');
    const flashMessage = [...successMessages, ...errorMessages].join(' ');
    
    res.render("./inventory/add-inventory", {
        title: "Add Vehicle",
        nav,
        classificationSelect,
        flashMessage,
        errors: null,
    });
});

/* ***************************
 *  Process Add Inventory Form
 * ************************** */
invCont.addInventory = baseController.handleErrors(async function (req, res, next) {
    const {
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    } = req.body;

    // Validate inputs (basic validation)
    if (!inv_make || !inv_model || !classification_id) {
        req.flash('error', 'Please complete all required fields');
        // Send back form with entered values for sticky form
        res.status(400).render("./inventory/add-inventory", {
            title: "Add Vehicle",
            nav: await utilities.getNav(),
            classificationSelect: await utilities.buildClassificationList(classification_id),
            flashMessage: 'Please complete all required fields',
            // Include all form values to make the form sticky
            inv_make, inv_model, inv_year, inv_description, 
            inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
        });
        return;
    }

    try {
        // Add inventory to database
        await invModel.addInventory(
            inv_make, inv_model, inv_year, inv_description,
            inv_image, inv_thumbnail, inv_price, inv_miles,
            inv_color, classification_id
        );
        
        // Set success message and redirect
        req.flash('success', `${inv_make} ${inv_model} added to inventory`);
        res.redirect('/inv');
    } catch (error) {
        console.error("Error in addInventory:", error);
        req.flash('error', 'Sorry, there was an error processing the request');
        
        // Return to form with entered values (sticky form)
        res.status(500).render("./inventory/add-inventory", {
            title: "Add Vehicle",
            nav: await utilities.getNav(),
            classificationSelect: await utilities.buildClassificationList(classification_id),
            flashMessage: 'An error occurred. Please try again.',
            // Include all form values to make the form sticky
            inv_make, inv_model, inv_year, inv_description, 
            inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
        });
    }
});

module.exports = invCont;
