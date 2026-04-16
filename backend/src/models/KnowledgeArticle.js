const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

class KnowledgeArticle {
  static async create({ tenant_id, title, content, tags, created_by }) {
    const result = await pool.query(
      `INSERT INTO knowledge_articles (tenant_id, title, content, tags, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tenant_id, title, content, JSON.stringify(tags || []), created_by]
    );
    return result.rows[0];
  }

  static async findByTenant(tenant_id, options = {}) {
    const { limit = 20, offset = 0 } = options;
    const result = await pool.query(
      `SELECT * FROM knowledge_articles WHERE tenant_id = $1
       ORDER BY views DESC, created_at DESC LIMIT $2 OFFSET $3`,
      [tenant_id, limit, offset]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM knowledge_articles WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async search(tenant_id, query) {
    const result = await pool.query(
      `SELECT *, ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', $2)) AS rank
       FROM knowledge_articles
       WHERE tenant_id = $1
         AND to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $2)
       ORDER BY rank DESC
       LIMIT 20`,
      [tenant_id, query]
    );
    return result.rows;
  }

  static async update(id, fields) {
    const allowed = ['title', 'content', 'tags'];
    const updates = Object.keys(fields).filter(k => allowed.includes(k));
    if (!updates.length) return KnowledgeArticle.findById(id);
    const sets = updates.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...updates.map(k => k === 'tags' ? JSON.stringify(fields[k]) : fields[k])];
    const result = await pool.query(
      `UPDATE knowledge_articles SET ${sets} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      `DELETE FROM knowledge_articles WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async incrementViews(id) {
    const result = await pool.query(
      `UPDATE knowledge_articles SET views = views + 1 WHERE id = $1 RETURNING views`,
      [id]
    );
    return result.rows[0];
  }

  static async markHelpful(id) {
    const result = await pool.query(
      `UPDATE knowledge_articles SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING helpful_count`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = KnowledgeArticle;
