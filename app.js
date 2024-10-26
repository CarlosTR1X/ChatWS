const express = require('express');
const router = require('./routes/index.routes');
const app = express();
const path = require('path');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();
const dbUser = require('./dbUser');
const http = require('http'); 
const { Server } = require('socket.io');
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());

// Crear un servidor HTTP
const server = http.createServer(app);

// Configurar Socket.io
const io = new Server(server, {

    cors: {
        origin: '*', // Cambia el puerto según tu aplicación frontend
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true
    }

});

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    // Manejar eventos de Socket.io
    socket.on('message', (msg) => {
        console.log('Mensaje recibido:', msg);
        // Emitir el mensaje a todos los clientes
        io.emit('message', msg);
    });

    // Evento de desconexión
    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado');
    });
});
// Rutas
app.use('/', router);

app.get('/login',  (req, res) => {
    // Envía el archivo HTML cuando se accede a la raíz
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/api', validaToken, (req, res) => {
    // Envía el archivo HTML cuando se accede a la raíz
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Función para autenticar usuarios
async function autenticarUsuario(username, password) {
    try {
        const db = await dbUser();
        const usuariosCollection = db.collection('usuario');
        console.log(username, password)
        
        
        // Buscar el usuario por nombre de usuario y contraseña
        const user = await usuariosCollection.findOne({user: username, pass: password});
        console.log(user)
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

// Ruta para autenticación
app.post('/auth', async (req, res) => {
    const { username, password } = req.body;
    const authResult = await autenticarUsuario(username, password);
    if (authResult.success) {
        const user = { password: password };
        const accessToken = generateAccessToken(user);
        res.header('authorization', accessToken).json({
            message: 'usuario autenticado',
            token: accessToken
        });
    } else {
        res.status(401).json({ message: authResult.message });
    }
});

// Generar un token de acceso
function generateAccessToken(user) {
    return jwt.sign(user, process.env.SECRET, { expiresIn: '10m' });
}

// Middleware para validar el token
function validaToken(req, res, next) {
    const accessToken = req.header['authorization'] || req.query.accessToken;
    if (!accessToken) return res.status(403).send('Acceso denegado');
    
    jwt.verify(accessToken, process.env.SECRET, (err, user) => {
        if (err) {
            return res.status(403).send('acceso denegado, token expirado o incorrecto');
        } else {
            next();
        }
    });
}

// Iniciar el servidor
const port = 3000;
server.listen(port, () => {
    console.log("SERVICIO ACTIVO");
    console.log(`Socket.io está escuchando en el puerto ${port}`);
});
