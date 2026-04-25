const Product = require('../models/Product');
const { createError } = require('../utils/errorHandler');

const getAllProducts = async (page = 1, limit = 10, category, search) => {
  return await Product.findAll({ page: parseInt(page), limit: parseInt(limit), category, search });
};

const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw createError('Product not found', 404);
  return product;
};

const createProduct = async (data) => {
  if (data.sku) {
    const existing = await Product.findBySku(data.sku);
    if (existing) throw createError('SKU already in use', 409);
  }
  return await Product.create(data);
};

const updateProduct = async (id, data) => {
  const product = await Product.findById(id);
  if (!product) throw createError('Product not found', 404);

  if (data.sku && data.sku !== product.sku) {
    const existing = await Product.findBySku(data.sku);
    if (existing) throw createError('SKU already in use', 409);
  }

  return await Product.update(id, data);
};

const deleteProduct = async (id) => {
  const product = await Product.delete(id);
  if (!product) throw createError('Product not found', 404);
  return { message: 'Product deleted successfully' };
};

const updateStock = async (id, quantity) => {
  const product = await Product.findById(id);
  if (!product) throw createError('Product not found', 404);

  const updated = await Product.updateStock(id, quantity);
  return updated;
};

const getStockInfo = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw createError('Product not found', 404);
  return { id: product.id, name: product.name, stock: product.stock, sku: product.sku };
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, updateStock, getStockInfo };
