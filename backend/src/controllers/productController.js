const Product = require('../models/Product');

const getAll = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.search) filters.search = req.query.search;
    const products = await Product.findAll(req.app.locals.db, filters);
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.app.locals.db, req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, sku, price, stock_quantity, category } = req.body;
    if (!name || !sku || price === undefined) {
      return res.status(400).json({ error: 'Name, SKU, and price are required' });
    }
    const product = await Product.create(req.app.locals.db, {
      name, description, sku, price, stock_quantity, category,
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await Product.update(req.app.locals.db, req.params.id, req.body);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.delete(req.app.locals.db, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) return res.status(400).json({ error: 'Quantity is required' });
    const product = await Product.updateStock(req.app.locals.db, req.params.id, quantity);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

const getStockLevel = async (req, res, next) => {
  try {
    const stock = await Product.getStockLevel(req.app.locals.db, req.params.id);
    if (!stock) return res.status(404).json({ error: 'Product not found' });
    res.json({ stock });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, delete: deleteProduct, updateStock, getStockLevel };
