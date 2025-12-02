const db = require('../models');
const express = require('express');
const router = express.Router();

// ✅ AGREGAR ESTE LOG PARA VERIFICAR
console.log('=== VERIFICANDO db.product ===');
console.log('db:', db);
console.log('db.product:', db.product);

// Crear un nuevo producto
router.post('/', async (req, res) => {
    const { name, description, price, image, category, stock, company_id } = req.body;
    
    console.log('=== CREANDO PRODUCTO ===');
    console.log('Datos recibidos:', { name, description, price, image, category, stock, company_id });
    console.log('db.product:', db.product);
    
    try {
        if (!db.product) {
            throw new Error('El modelo Product no está definido en db');
        }
        
        const nuevoProducto = await db.product.create({
            name,
            description,
            price,
            image,
            category,
            stock,
            company_id
        });
        
        res.status(201).json({
            mensaje: "Producto creado exitosamente",
            product: nuevoProducto
        });
    } catch (error) {
        console.error('❌ ERROR AL CREAR PRODUCTO:', error);
        res.status(500).json({
            error: "Error al crear producto",
            detalle: error.message
        });
    }
});

// Obtener productos de una empresa
router.get('/company/:companyId', async (req, res) => {
    const { companyId } = req.params;
    
    try {
        const productos = await db.product.find({ company_id: companyId })
            .populate('company_id', 'name logo')
            .sort({ createdAt: -1 });
        
        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener productos",
            detalle: error.message
        });
    }
});

// Obtener todos los productos
router.get('/all', async (req, res) => {
    try {
        const productos = await db.product.find()
            .populate('company_id', 'name logo')
            .sort({ createdAt: -1 });
        
        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener productos",
            detalle: error.message
        });
    }
});

// Obtener un producto específico
router.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    
    try {
        const producto = await db.product.findById(productId)
            .populate('company_id', 'name logo location');
        
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.status(200).json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al obtener producto",
            detalle: error.message
        });
    }
});

// Actualizar un producto
router.patch('/:productId', async (req, res) => {
    const { productId } = req.params;
    const { name, description, price, image, category, stock } = req.body;
    
    try {
        const productoActualizado = await db.product.findByIdAndUpdate(
            productId,
            { name, description, price, image, category, stock },
            { new: true, runValidators: true }
        );
        
        if (!productoActualizado) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.status(200).json({
            mensaje: "Producto actualizado exitosamente",
            product: productoActualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al actualizar producto",
            detalle: error.message
        });
    }
});

// Eliminar un producto
router.delete('/:productId', async (req, res) => {
    const { productId } = req.params;
    
    try {
        const productoEliminado = await db.product.findByIdAndDelete(productId);
        
        if (!productoEliminado) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.status(200).json({
            mensaje: "Producto eliminado exitosamente",
            product: productoEliminado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al eliminar producto",
            detalle: error.message
        });
    }
});

module.exports = router;