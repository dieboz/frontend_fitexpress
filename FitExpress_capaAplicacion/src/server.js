const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const db = require('./models');
const users = require('./api/users');
const posts = require('./api/posts');
const companies = require('./api/companies');
const chats = require('./api/chats');
const messages = require('./api/messages');
const products = require('./api/products');
const mongoose = require('mongoose');

// Configurar CORS para desarrollo y producción
app.use(cors({
  origin: [
    'http://localhost:4200',  // Desarrollo local
    'http://localhost',        // Docker frontend en puerto 80
    'http://localhost:80'      // Docker frontend alternativo
  ],
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Ruta de estado del API
app.get('/api', (req, res) => {
    res.json({
        message: 'FitExpress API está funcionando correctamente',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            posts: '/api/posts',
            companies: '/api/companies',
            products: '/api/products',
            chats: '/api/chats',
            messages: '/api/messages'
        }
    });
});

app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/companies', companies);
app.use('/api/products', products);
app.use('/api/chats', chats);
app.use('/api/messages', messages);

//puerto de escucha
const PORT = process.env.PORT || 3000;

//ruta principal
app.get('/', (req,res) => {
    res.send('Enviando mensaje desde el servidor de FitExpress');
});

//Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`)
})

