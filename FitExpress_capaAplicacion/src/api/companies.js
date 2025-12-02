const db = require('../models');
const express = require('express');
const router = express.Router();

// Crear una nueva empresa - CREATE
router.post('/', async (req, res) => {
    const { name, description, email, logo, location, owner_id } = req.body;

    try{
        const nuevaEmpresa = await db.company.create({
            name,
            description,
            email,
            logo,
            location,
            owner_id
        });

        res.status(201).json({ 
            mensaje: "Empresa creada exitosamente",
            company: nuevaEmpresa
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Error al crear empresa",
            detalle: error.message
        });
    }
});

// Obtener todas las empresas - READ
router.get('/all', async (req, res) => {
    try {
        const empresas = await db.company.find()
            .populate('owner_id', 'name email')
            .populate('followers', 'name email');
        
        res.status(200).json(empresas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Error al obtener empresas",
            detalle: error.message
        });
    }
});

// Obtener una empresa por ID
router.get('/:companyId', async (req, res) => {
    const { companyId } = req.params;
    
    try {
        const empresa = await db.company.findById(companyId)
            .populate('owner_id', 'name email')
            .populate('followers', 'name email');
        
        if (!empresa) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }
        
        res.status(200).json(empresa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Error al obtener empresa",
            detalle: error.message
        });
    }
});

// Actualizar una empresa - UPDATE
router.patch('/:companyId', async (req, res) => {
    const { companyId } = req.params;
    const { name, description, email, logo, location } = req.body;
    
    try {
        const empresaActualizada = await db.company.findByIdAndUpdate(
            companyId,
            { name, description, email, logo, location },
            { new: true, runValidators: true }
        );
        
        if (!empresaActualizada) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }
        
        res.status(200).json({
            mensaje: "Empresa actualizada exitosamente",
            company: empresaActualizada
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al actualizar empresa",
            detalle: error.message
        });
    }
});

// Seguir una empresa
router.post('/:companyId/follow', async (req, res) => {
    const { companyId } = req.params;
    const { user_id } = req.body;
    
    try {
        const empresa = await db.company.findById(companyId);
        
        if (!empresa) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }
        
        if (empresa.followers.includes(user_id)) {
            return res.status(400).json({ error: "Ya sigues esta empresa" });
        }
        
        empresa.followers.push(user_id);
        await empresa.save();
        
        res.status(200).json({
            mensaje: "Ahora sigues esta empresa",
            company: empresa
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al seguir empresa",
            detalle: error.message
        });
    }
});

// Dejar de seguir una empresa
router.delete('/:companyId/follow', async (req, res) => {
    const { companyId } = req.params;
    const { user_id } = req.body;
    
    try {
        const empresa = await db.company.findById(companyId);
        
        if (!empresa) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }
        
        empresa.followers = empresa.followers.filter(id => id.toString() !== user_id);
        await empresa.save();
        
        res.status(200).json({
            mensaje: "Dejaste de seguir esta empresa",
            company: empresa
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al dejar de seguir empresa",
            detalle: error.message
        });
    }
});

// Eliminar una empresa - DELETE
router.delete('/:companyId', async (req, res) => {
    const { companyId } = req.params;
    
    try {
        const empresaEliminada = await db.company.findByIdAndDelete(companyId);
        
        if (!empresaEliminada) {
            return res.status(404).json({ error: "Empresa no encontrada" });
        }
        
        // Limpiar referencias en usuarios
        await db.user.updateMany(
            { company_id: companyId },
            { $set: { company_id: null } }
        );
        
        res.status(200).json({
            mensaje: "Empresa eliminada exitosamente",
            company: empresaEliminada
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al eliminar empresa",
            detalle: error.message
        });
    }
});

module.exports = router;