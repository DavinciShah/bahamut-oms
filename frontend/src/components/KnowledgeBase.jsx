import { useState, useEffect } from 'react';
import ticketService from '../services/ticketService';

export default function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    ticketService.getKBArticles().then(res => setArticles(res.data || [])).catch(console.error);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await ticketService.searchKB(searchQuery);
      setArticles(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleArticleClick = async (id) => {
    try {
      const res = await ticketService.getKBArticle(id);
      setSelected(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (selected) {
    return (
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginBottom: 16 }}>← Back to articles</button>
        <h2 style={{ marginBottom: 8 }}>{selected.title}</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 13, color: '#64748b' }}>
          <span>👁 {selected.views} views</span>
          <span>👍 {selected.helpful_count} helpful</span>
        </div>
        <div style={{ lineHeight: 1.7, fontSize: 15 }}>{selected.content}</div>
        <div style={{ marginTop: 24 }}>
          <span style={{ fontSize: 14, color: '#64748b' }}>Was this helpful?</span>
          <button onClick={() => ticketService.markHelpful?.(selected.id)}
            style={{ marginLeft: 12, padding: '4px 16px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 13 }}>
            👍 Yes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search knowledge base..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
        />
        <button type="submit" disabled={searching} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {searching ? 'Searching...' : 'Search'}
        </button>
        {searchQuery && (
          <button type="button" onClick={() => { setSearchQuery(''); ticketService.getKBArticles().then(r => setArticles(r.data || [])); }}
            style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {articles.map(article => (
          <div key={article.id} onClick={() => handleArticleClick(article.id)}
            style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'}>
            <h4 style={{ marginBottom: 8, color: '#1e293b' }}>{article.title}</h4>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {article.content}
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8' }}>
              <span>👁 {article.views}</span>
              <span>👍 {article.helpful_count}</span>
            </div>
          </div>
        ))}
        {articles.length === 0 && <div style={{ color: '#64748b' }}>No articles found</div>}
      </div>
    </div>
  );
}
