const mongoose = require('mongoose');

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://fit_express_db:27017/fit_express';

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('✓ Conectado a MongoDB:', MONGODB_URI))
    .catch(err => console.error('✗ Error al conectar a MongoDB:', err));

// Manejar eventos de conexión
mongoose.connection.on('connected', () => {
    console.log('Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Error de conexión de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose desconectado de MongoDB');
});

// Importar modelos
const User = require('./user');
const Company = require('./company');
const Chat = require('./chat');
const Message = require('./message');
const Post = require('./post');
const Product = require('./product');

// ✅ VERIFICAR QUE TODOS LOS MODELOS SE IMPORTEN CORRECTAMENTE
console.log('=== MODELOS CARGADOS ===');
console.log('User:', User ? '✅' : '❌');
console.log('Company:', Company ? '✅' : '❌');
console.log('Chat:', Chat ? '✅' : '❌');
console.log('Message:', Message ? '✅' : '❌');
console.log('Post:', Post ? '✅' : '❌');
console.log('Product:', Product ? '✅' : '❌');  // ← VERIFICAR ESTE

module.exports = {
    user: User,
    company: Company,
    chat: Chat,
    message: Message,
    post: Post,
    product: Product,  // ← SIN ESPACIOS EXTRA
    mongoose
};

