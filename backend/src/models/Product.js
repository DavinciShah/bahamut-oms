class Product {
  static async findAll(pool, filters = {}) {
    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (filters.category) {
      params.push(filters.category);
      conditions.push(`category = $${params.length}`);
    }
    if (filters.search) {
      params.push(`%${filters.search}%`);
      conditions.push(`(name ILIKE $${params.length} OR sku ILIKE $${params.length})`);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async findById(pool, id) {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async create(pool, productData) {
    const { name, description, sku, price, stock_quantity = 0, category } = productData;
    const { rows } = await pool.query(
      `INSERT INTO products (name, description, sku, price, stock_quantity, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, sku, price, stock_quantity, category]
    );
    return rows[0];
  }

  static async update(pool, id, productData) {
    const { name, description, sku, price, stock_quantity, category } = productData;
    const { rows } = await pool.query(
      `UPDATE products
       SET name = COALESCE($1, name), description = COALESCE($2, description),
           sku = COALESCE($3, sku), price = COALESCE($4, price),
           stock_quantity = COALESCE($5, stock_quantity), category = COALESCE($6, category),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, sku, price, stock_quantity, category, id]
    );
    return rows[0] || null;
  }

  static async delete(pool, id) {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return rowCount > 0;
  }

  static async updateStock(pool, id, quantity) {
    const { rows } = await pool.query(
      `UPDATE products SET stock_quantity = stock_quantity + $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, stock_quantity`,
      [quantity, id]
    );
    return rows[0] || null;
  }

  static async getStockLevel(pool, id) {
    const { rows } = await pool.query(
      'SELECT id, name, sku, stock_quantity FROM products WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = Product;
