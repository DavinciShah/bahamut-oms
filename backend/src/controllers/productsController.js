const productsService = require('../services/productsService');

const getProducts = async (req, res, next) => {
  try {
    const { page, limit, category, search } = req.query;
    const result = await productsService.getAllProducts(page, limit, category, search);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productsService.getProductById(parseInt(req.params.id));
    res.status(200).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productsService.createProduct(req.body);
    res.status(201).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productsService.updateProduct(parseInt(req.params.id), req.body);
    res.status(200).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const result = await productsService.deleteProduct(parseInt(req.params.id));
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const product = await productsService.updateStock(parseInt(req.params.id), req.body.quantity);
    res.status(200).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

const getStockInfo = async (req, res, next) => {
  try {
    const stock = await productsService.getStockInfo(parseInt(req.params.id));
    res.status(200).json({ success: true, data: { stock } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, updateStock, getStockInfo };
