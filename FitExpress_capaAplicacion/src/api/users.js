const db = require('../models');
const express = require('express');
const router = express.Router();

// Crear un nuevo usuario - CREATE
router.post('/', async (req, res) => {
    const { name, nickname, email, password, profile_picture, bio, role, company_id } = req.body;
    
    try {
        // Verificar si el nickname ya existe
        const nicknameExistente = await db.user.findOne({ nickname });
        if (nicknameExistente) {
            return res.status(400).json({ 
                error: "Este nickname ya está en uso" 
            });
        }

        const nuevoUsuario = await db.user.create({
            name,
            nickname,
            email,
            password,
            profile_picture,
            bio,
            role,
            company_id
        });
        
        res.status(201).json({ 
            mensaje: "Usuario creado exitosamente",
            usuario: nuevoUsuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Error al crear usuario",
            detalle: error.message
        });
    }
});

// Obtener todos los usuarios - READ
router.get('/', async (req, res) => {
    try {
        const users = await db.user.find()
            // .select('-password')  // ← COMENTAR O ELIMINAR ESTA LÍNEA
            .populate('company_id', 'name email')
            .populate('followers', 'name nickname email')
            .populate('following', 'name nickname email');
        
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Error al obtener usuarios",
            detalle: error.message
        });
    }
});

// ⚠️ IMPORTANTE: Rutas específicas ANTES de /:userId

// Buscar usuarios por nickname o nombre
router.get('/search/:query', async (req, res) => {
    const { query } = req.params;
    
    try {
        const usuarios = await db.user.find({
            $or: [
                { nickname: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        })
        // .select('-password')  // ← COMENTAR
        .populate('company_id', 'name logo')
        .limit(20);
        
        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al buscar usuarios",
            detalle: error.message
        });
    }
});

// Obtener perfil público de usuario por nickname
router.get('/profile/:nickname', async (req, res) => {
    const { nickname } = req.params;
    
    try {
        const usuario = await db.user.findOne({ nickname: nickname })
            // .select('-password')  // ← COMENTAR
            .populate('company_id', 'name email logo')
            .populate('followers', 'name nickname profile_picture')
            .populate('following', 'name nickname profile_picture');
        
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Obtener posts del usuario
        const posts = await db.post.find({ user_id: usuario._id })
            .populate('user_id', 'name nickname profile_picture')
            .populate('likes', 'name nickname')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            usuario,
            posts,
            stats: {
                totalPosts: posts.length,
                followers: usuario.followers.length,
                following: usuario.following.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener perfil",
            detalle: error.message
        });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const usuario = await db.user.findOne({ email })
            .populate('company_id', 'name logo');
        
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Comparación directa de contraseñas
        if (usuario.password !== password) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const usuarioResponse = usuario.toObject();
        delete usuarioResponse.password;

        res.status(200).json({
            mensaje: "Login exitoso",
            usuario: usuarioResponse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al hacer login",
            detalle: error.message
        });
    }
});

// Obtener un usuario específico por ID
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const usuario = await db.user.findById(userId)
            // .select('-password')  // ← COMENTAR
            .populate('company_id', 'name email logo')
            .populate('followers', 'name nickname email profile_picture')
            .populate('following', 'name nickname email profile_picture');
        
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Error al obtener usuario",
            detalle: error.message
        });
    }
});

// Actualizar perfil de usuario - UPDATE
router.patch('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { name, nickname, email, profile_picture, bio, role, company_id } = req.body;
    
    try {
        const usuarioExistente = await db.user.findById(userId);
        
        if (!usuarioExistente) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Verificar email duplicado
        if (email && email !== usuarioExistente.email) {
            const emailDuplicado = await db.user.findOne({ 
                email: email,
                _id: { $ne: userId }
            });
            
            if (emailDuplicado) {
                return res.status(400).json({ 
                    error: "Este email ya está en uso por otro usuario" 
                });
            }
        }

        // Verificar nickname duplicado
        if (nickname && nickname !== usuarioExistente.nickname) {
            const nicknameDuplicado = await db.user.findOne({ 
                nickname: nickname,
                _id: { $ne: userId }
            });
            
            if (nicknameDuplicado) {
                return res.status(400).json({ 
                    error: "Este nickname ya está en uso por otro usuario" 
                });
            }
        }

        const updateData = {};
        if (name !== undefined && name !== '') updateData.name = name;
        if (nickname !== undefined && nickname !== '') updateData.nickname = nickname;
        if (email !== undefined && email !== '') updateData.email = email;
        if (profile_picture !== undefined && profile_picture !== '') updateData.profile_picture = profile_picture;
        if (bio !== undefined) updateData.bio = bio;
        if (role !== undefined) updateData.role = role;
        if (company_id !== undefined) updateData.company_id = company_id;
        
        const usuarioActualizado = await db.user.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: false }
        )
        // .select('-password')  // ← COMENTAR
        .populate('company_id', 'name email logo')
        .populate('followers', 'name nickname profile_picture')
        .populate('following', 'name nickname profile_picture');
        
        res.status(200).json({
            mensaje: "Usuario actualizado exitosamente",
            usuario: usuarioActualizado
        });
    } catch (error) {
        console.error('Error en actualización:', error);
        res.status(500).json({
            error: "Error al actualizar usuario",
            detalle: error.message
        });
    }
});

// Cambiar contraseña de un usuario - UPDATE
router.patch('/:userId/password', async (req, res) => {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    try {
        const usuario = await db.user.findById(userId);

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Comparación directa de contraseñas
        if (usuario.password !== currentPassword) {
            return res.status(401).json({ error: "Contraseña actual incorrecta" });
        }

        usuario.password = newPassword;
        await usuario.save();

        res.status(200).json({
            mensaje: "Contraseña actualizada exitosamente"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al cambiar contraseña",
            detalle: error.message
        });
    }
});

// Seguir a un usuario
router.post('/:userId/follow', async (req, res) => {
    const { userId } = req.params;
    const { follower_id } = req.body;
    
    try {
        const usuarioASeguir = await db.user.findById(userId);
        const seguidor = await db.user.findById(follower_id);
        
        if (!usuarioASeguir || !seguidor) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        if (usuarioASeguir.followers.includes(follower_id)) {
            return res.status(400).json({ error: "Ya sigues a este usuario" });
        }
        
        usuarioASeguir.followers.push(follower_id);
        await usuarioASeguir.save();
        
        seguidor.following.push(userId);
        await seguidor.save();
        
        res.status(200).json({
            mensaje: "Ahora sigues a este usuario",
            usuario: usuarioASeguir
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al seguir usuario",
            detalle: error.message
        });
    }
});

// Dejar de seguir a un usuario
router.delete('/:userId/unfollow', async (req, res) => {
    const { userId } = req.params;
    const { follower_id } = req.body;
    
    try {
        const usuarioADejarDeSeguir = await db.user.findById(userId);
        const seguidor = await db.user.findById(follower_id);
        
        if (!usuarioADejarDeSeguir || !seguidor) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        usuarioADejarDeSeguir.followers = usuarioADejarDeSeguir.followers.filter(
            id => id.toString() !== follower_id
        );
        await usuarioADejarDeSeguir.save();
        
        seguidor.following = seguidor.following.filter(
            id => id.toString() !== userId
        );
        await seguidor.save();
        
        res.status(200).json({
            mensaje: "Dejaste de seguir a este usuario",
            usuario: usuarioADejarDeSeguir
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al dejar de seguir usuario",
            detalle: error.message
        });
    }
});

// Eliminar un usuario - DELETE
router.delete('/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const usuarioEliminado = await db.user.findByIdAndDelete(userId);
        
        if (!usuarioEliminado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        await db.user.updateMany(
            { followers: userId },
            { $pull: { followers: userId } }
        );
        
        await db.user.updateMany(
            { following: userId },
            { $pull: { following: userId } }
        );

        await db.post.deleteMany({ user_id: userId });
        await db.message.deleteMany({
            $or: [{ sender_id: userId }, { receiver_id: userId }]
        });
        await db.chat.deleteMany({ participants: userId });

        res.status(200).json({
            mensaje: "Usuario eliminado exitosamente",
            usuario: usuarioEliminado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al eliminar usuario",
            detalle: error.message
        });
    }
});

module.exports = router;