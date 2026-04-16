const KnowledgeArticle = require('../models/KnowledgeArticle');

const knowledgeBaseService = {
  async createArticle(tenantId, data, userId) {
    return KnowledgeArticle.create({ ...data, tenant_id: tenantId, created_by: userId });
  },

  async getArticles(tenantId, options = {}) {
    return KnowledgeArticle.findByTenant(tenantId, options);
  },

  async searchArticles(tenantId, query) {
    return KnowledgeArticle.search(tenantId, query);
  },

  async getArticleById(id) {
    return KnowledgeArticle.findById(id);
  },

  async updateArticle(id, fields) {
    return KnowledgeArticle.update(id, fields);
  },

  async deleteArticle(id) {
    return KnowledgeArticle.delete(id);
  },

  async incrementViews(id) {
    return KnowledgeArticle.incrementViews(id);
  },

  async markHelpful(id) {
    return KnowledgeArticle.markHelpful(id);
  }
};

module.exports = knowledgeBaseService;
