const express = require('express');
const routerPersonaje = express.Router();
const dbConexion = require('../../dbConnection'); // Sin destructuración

routerPersonaje.get('/listar', async (req, res) => {

  const db = await dbConexion();
  const personajes = await db.collection('personajes').find().toArray();
  res.json(personajes);

});

module.exports = routerPersonaje;
