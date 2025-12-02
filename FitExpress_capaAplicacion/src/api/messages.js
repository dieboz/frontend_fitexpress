
const db = require('../models');
const express = require('express');
const router = express.Router();

// Obtener TODOS los mensajes (para debug/admin)
router.get('/', async (req, res) => {
    try {
        const mensajes = await db.message.find()
            .populate('chat_id')
            .populate('sender_id', 'name email profile_picture')
            .populate('receiver_id', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);
        
        res.status(200).json(mensajes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener mensajes",
            detalle: error.message
        });
    }
});

// Enviar un nuevo mensaje - CREATE
router.post('/', async (req, res) => {
    const { chat_id, sender_id, receiver_id, content } = req.body;
    
    try {
        const nuevoMensaje = await db.message.create({
            chat_id,
            sender_id,
            receiver_id,
            content
        });
        
        // Actualizar el último mensaje del chat
        await db.chat.findByIdAndUpdate(chat_id, {
            last_message: {
                sender_id,
                content,
                created_at: new Date()
            }
        });
        
        res.status(201).json({
            mensaje: "Mensaje enviado exitosamente",
            message: nuevoMensaje
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al enviar mensaje",
            detalle: error.message
        });
    }
});

// Obtener todos los mensajes de un chat
router.get('/chat/:chatId', async (req, res) => {
    const { chatId } = req.params;
    
    try {
        const mensajes = await db.message.find({ chat_id: chatId })
            .populate('sender_id', 'name email profile_picture')
            .populate('receiver_id', 'name email')
            .sort({ createdAt: 1 });
        
        res.status(200).json(mensajes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener mensajes",
            detalle: error.message
        });
    }
});

// Obtener mensajes no leídos de un usuario
router.get('/unread/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const mensajesNoLeidos = await db.message.find({
            receiver_id: userId,
            read: false
        })
        .populate('sender_id', 'name email profile_picture')
        .populate('chat_id')
        .sort({ createdAt: -1 });
        
        res.status(200).json(mensajesNoLeidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener mensajes no leídos",
            detalle: error.message
        });
    }
});

// Marcar mensaje como leído - UPDATE
router.patch('/:messageId/read', async (req, res) => {
    const { messageId } = req.params;
    
    try {
        const mensajeActualizado = await db.message.findByIdAndUpdate(
            messageId,
            { read: true },
            { new: true }
        );
        
        if (!mensajeActualizado) {
            return res.status(404).json({ error: "Mensaje no encontrado" });
        }
        
        res.status(200).json({
            mensaje: "Mensaje marcado como leído",
            message: mensajeActualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al actualizar mensaje",
            detalle: error.message
        });
    }
});

// Marcar todos los mensajes de un chat como leídos
router.patch('/chat/:chatId/read-all', async (req, res) => {
    const { chatId } = req.params;
    const { userId } = req.body;
    
    try {
        await db.message.updateMany(
            { 
                chat_id: chatId,
                receiver_id: userId,
                read: false
            },
            { read: true }
        );
        
        res.status(200).json({
            mensaje: "Todos los mensajes marcados como leídos"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al marcar mensajes como leídos",
            detalle: error.message
        });
    }
});

// Eliminar un mensaje - DELETE
router.delete('/:messageId', async (req, res) => {
    const { messageId } = req.params;
    
    try {
        const mensajeEliminado = await db.message.findByIdAndDelete(messageId);
        
        if (!mensajeEliminado) {
            return res.status(404).json({ error: "Mensaje no encontrado" });
        }
        
        res.status(200).json({
            mensaje: "Mensaje eliminado exitosamente",
            message: mensajeEliminado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al eliminar mensaje",
            detalle: error.message
        });
    }
});

module.exports = router;