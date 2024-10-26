const express = require('express')
const router = require('./routes/index.routes')
const app = express()
const path = require('path')
const morgan = require('morgan')
app.use(express.json())
const jwt = require('jsonwebtoken')
const env = require('dotenv').configDotenv()
const dbUser = require('./dbUser');



app.use(express.urlencoded({extended: false}))
app.use('/', router)
app.use(morgan('dev'))

app.get('/login', (req, res) => {
  // Envía el archivo HTML cuando se accede a la raíz
  res.sendFile(path.join(__dirname, '/public/index.html'));
 
});

app.get('/api', validaToken, (req, res) => {
  // Envía el archivo HTML cuando se accede a la raíz
  res.sendFile(path.join(__dirname, '/public/index.html'));
 
});

async function autenticarUsuario(username, password) {
  try {
    const db = await dbUser();
    const usuariosCollection = db.collection('usuario');

    // Buscar el usuario por nombre de usuario y contraseña
    const user = await usuariosCollection.findOne({ username, password });

    if (user) {
      return { success: true, message: "Autenticación exitosa" };
    } else {
      return { success: false, message: "Usuario o contraseña incorrectos" };
    }
  } catch (error) {
    console.error("Error al autenticar usuario:", error);
    throw new Error("Error de autenticación");
  }
}

app.post('/auth', (req, res) => {
   const {username, password} = req.body
   if (autenticarUsuario(username, password)) {
     const user = {password: password}
     const accessToken = generateAaccessToken(user)
      res.header('authorization', accessToken).json({
       message:'usuario autenticado',
       token: accessToken
     })
   }
  //consulto base de datos para validar existencia de usuario.
}); 



function generateAaccessToken(user){
  return jwt.sign(user, process.env.SECRET, {expiresIn: '1m'})
}

function validaToken(req, res, next){
 const accessToken = req.header['authorization'] ||  req.query.accessToken
 if (!accessToken) res.send('Acceso denegado')
  jwt.verify(accessToken, process.env.SECRET, (err, user)=> {
    if (err) {
      res.send('acceso denegado, token expirado o incorrecto')
    }else{
      next()
    }    
  })

}


const port = 3000
app.listen(port, () => {
  console.log("SERVICIO ACTIVO")
})
