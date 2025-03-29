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

module.exports = { getClassifications, addClassification, getInventoryByClassificationId, getVehicleById };
