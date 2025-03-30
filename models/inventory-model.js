const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  const result = await pool.query('SELECT * FROM public.classification ORDER BY classification_name');
  return result;
}

/* ***************************
 *  Add a new classification
 * ************************** */
async function addClassification(classificationName) {
  const result = await pool.query(
    'INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *',
    [classificationName]
  );
  return result.rows[0]; // Return the newly created classification
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
  }
}

/* ***************************
 *  Get vehicle by ID
 * ************************** */
async function getVehicleById(vehicleId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [vehicleId]
    );
    return data.rows;
  } catch (error) {
    console.error("getVehicleById error " + error);
  }
}

/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        inv_make, inv_model, inv_year, inv_description, inv_image, 
        inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`;
    
    const result = await pool.query(sql, [
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
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error("addInventory error: " + error);
    throw error;
  }
}


module.exports = { getClassifications, addClassification, getInventoryByClassificationId, getVehicleById,addInventory};
