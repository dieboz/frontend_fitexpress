const db = require('../models');
const express = require('express');
const router = express.Router();

// Obtener TODOS los chats (para debug/admin)
router.get('/', async (req, res) => {
    try {
        const chats = await db.chat.find()
            .populate('participants', 'name email profile_picture')
            .populate('last_message.sender_id', 'name')
            .sort({ 'last_message.created_at': -1 });
        
        res.status(200).json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener chats",
            detalle: error.message
        });
    }
});

// Crear un nuevo chat - CREATE
router.post('/', async (req, res) => {
    const { participants } = req.body;
    
    try {
        // Verificar si ya existe un chat entre estos participantes
        const chatExistente = await db.chat.findOne({
            participants: { $all: participants, $size: participants.length }
        });
        
        if (chatExistente) {
            return res.status(200).json({
                mensaje: "Chat ya existe",
                chat: chatExistente
            });
        }
        
        const nuevoChat = await db.chat.create({
            participants
        });
        
        res.status(201).json({
            mensaje: "Chat creado exitosamente",
            chat: nuevoChat
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al crear chat",
            detalle: error.message
        });
    }
});

router.post('/find-or-create', async (req, res) => {
    const { user1_id, user2_id } = req.body;
    
    try {
        // Buscar si ya existe un chat entre estos usuarios
        let chat = await db.chat.findOne({
            participants: { $all: [user1_id, user2_id] }
        });
        
        // Si no existe, crear uno nuevo
        if (!chat) {
            chat = await db.chat.create({
                participants: [user1_id, user2_id]
            });
        }
        
        res.status(200).json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al buscar o crear chat",
            detalle: error.message
        });
    }
});

// Obtener todos los chats de un usuario
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const chats = await db.chat.find({
            participants: userId
        })
        .populate('participants', 'name email profile_picture')
        .populate('last_message.sender_id', 'name')
        .sort({ 'last_message.created_at': -1 });
        
        res.status(200).json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener chats",
            detalle: error.message
        });
    }
});

// Obtener un chat específico por ID
router.get('/:chatId', async (req, res) => {
    const { chatId } = req.params;
    
    try {
        const chat = await db.chat.findById(chatId)
            .populate('participants', 'name email profile_picture')
            .populate('last_message.sender_id', 'name');
        
        if (!chat) {
            return res.status(404).json({ error: "Chat no encontrado" });
        }
        
        res.status(200).json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener chat",
            detalle: error.message
        });
    }
});

// Actualizar último mensaje del chat
router.patch('/:chatId/last-message', async (req, res) => {
    const { chatId } = req.params;
    const { sender_id, content } = req.body;
    
    try {
        const chatActualizado = await db.chat.findByIdAndUpdate(
            chatId,
            {
                last_message: {
                    sender_id,
                    content,
                    created_at: new Date()
                }
            },
            { new: true }
        ).populate('participants', 'name email');
        
        if (!chatActualizado) {
            return res.status(404).json({ error: "Chat no encontrado" });
        }
        
        res.status(200).json({
            mensaje: "Chat actualizado exitosamente",
            chat: chatActualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al actualizar chat",
            detalle: error.message
        });
    }
});

// Eliminar un chat - DELETE
router.delete('/:chatId', async (req, res) => {
    const { chatId } = req.params;
    
    try {
        const chatEliminado = await db.chat.findByIdAndDelete(chatId);
        
        if (!chatEliminado) {
            return res.status(404).json({ error: "Chat no encontrado" });
        }
        
        // Eliminar todos los mensajes asociados
        await db.message.deleteMany({ chat_id: chatId });
        
        res.status(200).json({
            mensaje: "Chat eliminado exitosamente",
            chat: chatEliminado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al eliminar chat",
            detalle: error.message
        });
    }
});

module.exports = router;