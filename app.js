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


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());


const server = http.createServer(app);

const io = new Server(server, {

    cors: {
        origin: '*', 
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true
    }

});

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

   
    socket.on('message', (msg) => {
        console.log('Mensaje recibido:', msg);
        
        io.emit('message', msg);
    });

   
    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado');
    });
});

app.use('/', router);

app.get('/login',  (req, res) => {
    
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/api', validaToken, (req, res) => {
   
    res.sendFile(path.join(__dirname, '/public/index.html'));
});


async function autenticarUsuario(username, password) {
    try {
        const db = await dbUser();
        const usuariosCollection = db.collection('usuario');
        console.log(username, password)
        
        
        
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


function generateAccessToken(user) {
    return jwt.sign(user, process.env.SECRET, { expiresIn: '10m' });
}


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


const port = 3000;
server.listen(port, () => {
    console.log("SERVICIO ACTIVO");
    console.log(`Socket.io está escuchando en el puerto ${port}`);
});
