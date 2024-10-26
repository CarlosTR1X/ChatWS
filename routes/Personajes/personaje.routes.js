const express = require('express');
const dbConexion = require('../../dbConnection'); // Sin destructuración
const routerPersonaje = express.Router();

routerPersonaje.get('/listar', async (req, res) => {

  const db = await dbConexion();
  const personajes = await db.collection('personajes').find().toArray();
  res.json(personajes);

});

module.exports = routerPersonaje;
