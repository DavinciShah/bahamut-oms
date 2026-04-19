const getProfitLoss = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const { from, to } = req.query;
    const params = [];
    let dateFilter = '';
    if (from) { params.push(from); dateFilter += ` AND o.created_at >= $${params.length}`; }
    if (to)   { params.push(to);   dateFilter += ` AND o.created_at <= $${params.length}`; }

    const { rows: revenue } = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
       FROM orders o WHERE status != 'cancelled'${dateFilter}`, params
    );
    res.json({
      report: 'profit_loss',
      period: { from: from || null, to: to || null },
      revenue: parseFloat(revenue[0].total_revenue),
      expenses: 0,
      netProfit: parseFloat(revenue[0].total_revenue),
    });
  } catch (err) {
    next(err);
  }
};

const getBalanceSheet = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const [inventory, orders] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(stock_quantity * price), 0) AS value FROM products'),
      pool.query("SELECT COALESCE(SUM(total_amount), 0) AS value FROM orders WHERE status = 'completed'"),
    ]);
    res.json({
      report: 'balance_sheet',
      assets: {
        inventory: parseFloat(inventory.rows[0].value),
        accountsReceivable: 0,
        cash: parseFloat(orders.rows[0].value),
      },
      liabilities: { accountsPayable: 0 },
    });
  } catch (err) {
    next(err);
  }
};

const getCashFlow = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const { rows } = await pool.query(`
      SELECT DATE_TRUNC('month', created_at) AS month,
             COALESCE(SUM(total_amount), 0) AS cash_in
      FROM orders WHERE status = 'completed'
      GROUP BY month ORDER BY month DESC LIMIT 12
    `);
    res.json({ report: 'cash_flow', cashFlow: rows });
  } catch (err) {
    next(err);
  }
};

const getTrialBalance = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const { rows } = await pool.query(`
      SELECT status AS account,
             COALESCE(SUM(total_amount), 0) AS debit,
             0 AS credit
      FROM orders GROUP BY status
    `);
    res.json({ report: 'trial_balance', accounts: rows });
  } catch (err) {
    next(err);
  }
};

const getJournal = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const { rows } = await pool.query(`
      SELECT id, created_at AS date, 'Order' AS entry_type,
             total_amount AS amount, status AS description
      FROM orders ORDER BY created_at DESC LIMIT 100
    `);
    res.json({ report: 'journal', entries: rows });
  } catch (err) {
    next(err);
  }
};

const getLedger = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const { rows } = await pool.query(`
      SELECT status AS account,
             COUNT(*) AS transactions,
             COALESCE(SUM(total_amount), 0) AS balance
      FROM orders GROUP BY status
    `);
    res.json({ report: 'ledger', accounts: rows });
  } catch (err) {
    next(err);
  }
};

const getAccounts = async (req, res, next) => {
  try {
    res.json({
      report: 'chart_of_accounts',
      accounts: [
        { code: '1000', name: 'Cash', type: 'asset' },
        { code: '1100', name: 'Accounts Receivable', type: 'asset' },
        { code: '1200', name: 'Inventory', type: 'asset' },
        { code: '2000', name: 'Accounts Payable', type: 'liability' },
        { code: '3000', name: 'Owner Equity', type: 'equity' },
        { code: '4000', name: 'Sales Revenue', type: 'revenue' },
        { code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
      ],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfitLoss, getBalanceSheet, getCashFlow,
  getTrialBalance, getJournal, getLedger, getAccounts,
};
