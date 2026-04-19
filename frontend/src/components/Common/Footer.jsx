import { APP_NAME } from '../../utils/constants';

function Footer() {
  return (
    <footer
      style={{
        textAlign: 'center',
        padding: '1rem',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--gray-400)',
        borderTop: '1px solid var(--gray-200)',
        marginLeft: 'var(--sidebar-width)',
        backgroundColor: 'white',
      }}
    >
      © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
    </footer>
  );
}

export default Footer;
