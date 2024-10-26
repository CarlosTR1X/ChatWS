const express = require('express');
const routerPlanetas = express.Router();
const dbConexion = require('../../dbConnection');


routerPlanetas.get('/listar', async (req, res) => {

  const db = await dbConexion();
  const personajes = await db.collection('planetas').find().toArray();
  res.json(personajes);

});



//exports always in the end
module.exports = routerPlanetas