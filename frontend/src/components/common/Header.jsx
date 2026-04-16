import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  return (
    <header style={{ background: '#1e293b', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link to="/" style={{ color: '#f8fafc', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>Bahamut OMS</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && <span style={{ color: '#94a3b8', fontSize: 14 }}>{user.name || user.email}</span>}
        {user && <button onClick={logout} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Logout</button>}
      </div>
    </header>
  );
}
