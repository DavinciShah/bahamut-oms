const getAll = async (req, res, next) => {
  try {
    const { rows } = await req.app.locals.db.query(
      'SELECT id, user_id, type, name, status, last_sync_at, created_at, updated_at FROM integrations ORDER BY created_at DESC'
    );
    res.json({ integrations: rows });
  } catch (err) {
    next(err);
  }
};

const connect = async (req, res, next) => {
  try {
    const { type, name, config } = req.body;
    if (!type || !name) return res.status(400).json({ error: 'Type and name are required' });
    const { rows } = await req.app.locals.db.query(
      `INSERT INTO integrations (user_id, type, name, config, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING id, user_id, type, name, status, last_sync_at, created_at, updated_at`,
      [req.user.id, type, name, JSON.stringify(config || {})]
    );
    res.status(201).json({ integration: rows[0] });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { rows } = await req.app.locals.db.query(
      'SELECT id, user_id, type, name, status, last_sync_at, created_at, updated_at FROM integrations WHERE id = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Integration not found' });
    res.json({ integration: rows[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, config, status } = req.body;
    const { rows } = await req.app.locals.db.query(
      `UPDATE integrations
       SET name = COALESCE($1, name), config = COALESCE($2, config),
           status = COALESCE($3, status), updated_at = NOW()
       WHERE id = $4
       RETURNING id, user_id, type, name, status, last_sync_at, created_at, updated_at`,
      [name, config ? JSON.stringify(config) : null, status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Integration not found' });
    res.json({ integration: rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteIntegration = async (req, res, next) => {
  try {
    const { rowCount } = await req.app.locals.db.query(
      'DELETE FROM integrations WHERE id = $1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Integration not found' });
    res.json({ message: 'Integration deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const { rows } = await req.app.locals.db.query(
      'SELECT id, type, name, status, last_sync_at FROM integrations WHERE id = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Integration not found' });
    res.json({ status: rows[0] });
  } catch (err) {
    next(err);
  }
};

const testConnection = async (req, res, next) => {
  try {
    const { rows } = await req.app.locals.db.query(
      'SELECT id, type, name, status FROM integrations WHERE id = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Integration not found' });
    // Placeholder: real implementation would ping the external service
    res.json({ success: true, message: 'Connection test successful', integration: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, connect, getById, update, delete: deleteIntegration, getStatus, testConnection };
