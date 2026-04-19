export default function Footer() {
  return (
    <footer style={{ background: '#1e293b', color: '#64748b', textAlign: 'center', padding: '16px', fontSize: 13 }}>
      &copy; {new Date().getFullYear()} Bahamut OMS. All rights reserved.
    </footer>
  );
}
