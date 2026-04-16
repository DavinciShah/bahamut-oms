'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const barcodeService = {
  /**
   * Generate a barcode string for a product.
   * format: 'EAN13' | 'QR' | 'CODE128'
   * Returns the barcode string (or a data URL if a barcode library is available).
   */
  async generateBarcode(productId, format = 'EAN13') {
    const { rows } = await pool.query(
      'SELECT id, sku, barcode FROM products WHERE id = $1',
      [productId]
    );
    const product = rows[0];
    if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });

    // If the product already has a barcode, return it
    if (product.barcode) return { barcode: product.barcode, format };

    // Generate a simple barcode value based on SKU / id
    const barcodeValue =
      format === 'EAN13'
        ? String(productId).padStart(12, '0').slice(0, 12) + '0'
        : product.sku || String(productId);

    await pool.query('UPDATE products SET barcode = $1 WHERE id = $2', [barcodeValue, productId]);

    return { barcode: barcodeValue, format, productId };
  },

  async lookupBarcode(barcode) {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE barcode = $1 OR sku = $1',
      [barcode]
    );
    return rows[0] || null;
  },

  async bulkLookup(barcodes) {
    if (!Array.isArray(barcodes) || !barcodes.length) return [];
    const placeholders = barcodes.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `SELECT * FROM products WHERE barcode IN (${placeholders}) OR sku IN (${placeholders})`,
      [...barcodes, ...barcodes]
    );
    return rows;
  },
};

module.exports = barcodeService;
