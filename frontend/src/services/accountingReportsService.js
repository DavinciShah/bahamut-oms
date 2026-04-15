import api from './integrationService';

export const getProfitLoss = (params) => api.get('/api/accounting-reports/profit-loss', { params });
export const getBalanceSheet = (params) => api.get('/api/accounting-reports/balance-sheet', { params });
export const getCashFlow = (params) => api.get('/api/accounting-reports/cash-flow', { params });
export const getTrialBalance = (params) => api.get('/api/accounting-reports/trial-balance', { params });
export const getJournalEntries = (params) => api.get('/api/accounting-reports/journal', { params });
export const getGeneralLedger = (params) => api.get('/api/accounting-reports/ledger', { params });
export const getChartOfAccounts = () => api.get('/api/accounting-reports/accounts');
