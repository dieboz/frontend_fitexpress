const db = require('../models');
const express = require('express');
const router = express.Router();

// Crear un nuevo post - CREATE
router.post('/', async (req, res) => {
    const { user_id, content, image } = req.body;
    
    try {
        const nuevoPost = await db.post.create({
            user_id,
            content,
            image
        });
        
        res.status(201).json({ 
            mensaje: "Post creado exitosamente",
            post: nuevoPost
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Error al crear post",
            detalle: error.message
        });
    }
});

// Obtener todos los posts - READ
router.get('/all', async (req, res) => {
    try {
        const posts = await db.post.find()
            .populate('user_id', 'name email')
            .populate('likes', 'name')
            .populate('comments.user_id', 'name')
            .sort({ created_at: -1 });
        
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Error al obtener posts",
            detalle: error.message
        });
    }
});

// Obtener posts de un usuario específico
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const posts = await db.post.find({ user_id: userId })
            .populate('user_id', 'name email')
            .populate('likes', 'name')
            .populate('comments.user_id', 'name')
            .sort({ created_at: -1 });
        
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Error al obtener posts del usuario",
            detalle: error.message
        });
    }
});

// Obtener un post específico por ID
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;
    
    try {
        const post = await db.post.findById(postId)
            .populate('user_id', 'name email')
            .populate('likes', 'name')
            .populate('comments.user_id', 'name');
        
        if (!post) {
            return res.status(404).json({ error: "Post no encontrado" });
        }
        
        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Error al obtener post",
            detalle: error.message
        });
    }
});

// Actualizar un post - UPDATE
router.patch('/:postId', async (req, res) => {
    const { postId } = req.params;
    const { content, image } = req.body;
    
    try {
        const postActualizado = await db.post.findByIdAndUpdate(
            postId,
            { content, image },
            { new: true, runValidators: true }
        );
        
        if (!postActualizado) {
            return res.status(404).json({ error: "Post no encontrado" });
        }
        
        res.status(200).json({
            mensaje: "Post actualizado exitosamente",
            post: postActualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al actualizar post",
            detalle: error.message
        });
    }
});

// Dar like a un post
router.post('/:postId/like', async (req, res) => {
    const { postId } = req.params;
    const { user_id } = req.body;
    
    try {
        const post = await db.post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ error: "Post no encontrado" });
        }
        
        // Verificar si ya dio like
        if (post.likes.includes(user_id)) {
            return res.status(400).json({ error: "Ya diste like a este post" });
        }
        
        post.likes.push(user_id);
        await post.save();
        
        res.status(200).json({
            mensaje: "Like agregado exitosamente",
            post
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al dar like",
            detalle: error.message
        });
    }
});

// Quitar like de un post
router.delete('/:postId/like', async (req, res) => {
    const { postId } = req.params;
    const { user_id } = req.body;
    
    try {
        const post = await db.post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ error: "Post no encontrado" });
        }
        
        post.likes = post.likes.filter(id => id.toString() !== user_id);
        await post.save();
        
        res.status(200).json({
            mensaje: "Like eliminado exitosamente",
            post
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al quitar like",
            detalle: error.message
        });
    }
});

// Agregar comentario a un post
router.post('/:postId/comment', async (req, res) => {
    const { postId } = req.params;
    const { user_id, text } = req.body;
    
    try {
        const post = await db.post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ error: "Post no encontrado" });
        }
        
        post.comments.push({ user_id, text });
        await post.save();
        
        res.status(201).json({
            mensaje: "Comentario agregado exitosamente",
            post
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al agregar comentario",
            detalle: error.message
        });
    }
});

// Eliminar un post - DELETE
router.delete('/:postId', async (req, res) => {
    const { postId } = req.params;
    
    try {
        const postEliminado = await db.post.findByIdAndDelete(postId);
        
        if (!postEliminado) {
            return res.status(404).json({ error: "Post no encontrado" });
        }
        
        res.status(200).json({
            mensaje: "Post eliminado exitosamente",
            post: postEliminado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al eliminar post",
            detalle: error.message
        });
    }
});

module.exports = router;
