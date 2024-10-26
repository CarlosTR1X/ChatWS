const express = require('express');
const routerPlanetas = require('./Planetas/planetas.routes');
const routerPersonaje = require('./Personajes/personaje.routes');
const router = express.Router();




router.use('/personajes/',routerPersonaje )
router.use('/planetas/',routerPlanetas )


module.exports = router