import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Browse from './pages/Browse';
import Messages from './pages/Messages';
import Contact from './pages/Contact';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <nav style={navStyle}>
          <div style={navContainerStyle}>
            <Link to="/" style={logoStyle}>
              <span style={logoIconStyle}>💍</span>
              <span style={logoTextStyle}>توفيق للزواج</span>
            </Link>
            <ul style={navLinksStyle}>
              <li><Link to="/" style={linkStyle}>الرئيسية</Link></li>
              <li><Link to="/browse" style={linkStyle}>استكشف</Link></li>
              <li><Link to="/messages" style={linkStyle}>الرسائل</Link></li>
              <li><Link to="/profile" style={linkStyle}>الملف الشخصي</Link></li>
              <li><Link to="/about" style={linkStyle}>من نحن</Link></li>
              <li><Link to="/contact" style={linkStyle}>اتصل بنا</Link></li>
              <li><Link to="/admin" style={linkStyle}>🔐 إدارة</Link></li>
              <li><Link to="/login" style={loginLinkStyle}>دخول</Link></li>
              <li><Link to="/register" style={registerLinkStyle}>تسجيل</Link></li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        <footer style={footerStyle}>
          <p>&copy; 2026 توفيق للزواج. جميع الحقوق محفوظة.</p>
        </footer>
      </Router>
    </AuthProvider>
  );
}

const navStyle = {
  backgroundColor: 'rgba(10, 14, 32, 0.95)',
  padding: '1rem 0',
  color: 'white',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
};

const navContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingRight: '2rem'
};

const logoStyle = {
  fontFamily: "Ruqaa, Rakkas, 'Noto Sans Arabic', sans-serif",
  fontSize: '1.15rem',
  fontWeight: '700',
  textDecoration: 'none',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.55rem',
  padding: '0.6rem 1rem',
  borderRadius: '999px',
  background: 'linear-gradient(135deg, rgba(214, 30, 255, 0.95), rgba(145, 20, 150, 0.9))',
  boxShadow: '0 0 20px rgba(214, 30, 255, 0.35)',
  letterSpacing: '0.03em',
  textShadow: '0 0 10px rgba(255, 255, 255, 0.18)'
};

const logoIconStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  background: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.9), rgba(214, 30, 255, 0.3))',
  boxShadow: '0 0 18px rgba(214, 30, 255, 0.4)',
  color: '#ffffff',
  fontSize: '1rem'
};

const logoTextStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const navLinksStyle = {
  display: 'flex',
  listStyle: 'none',
  gap: '0.6rem',
  margin: 0,
  padding: 0,
  flexWrap: 'nowrap',
  alignItems: 'center',
  overflowX: 'auto'
};

const linkStyle = {
  color: '#f8f5ff',
  textDecoration: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.65rem 0.9rem',
  minWidth: '75px',
  borderRadius: '999px',
  background: 'rgba(151, 16, 152, 0.18)',
  boxShadow: '0 0 14px rgba(214, 30, 255, 0.18)',
  border: '1px solid rgba(214, 30, 255, 0.35)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  textShadow: '0 0 5px rgba(255, 255, 255, 0.16)',
  whiteSpace: 'nowrap'
};

const loginLinkStyle = {
  ...linkStyle,
  padding: '0.6rem 0.9rem',
  border: '1px solid rgba(214, 30, 255, 0.45)',
  background: 'rgba(214, 30, 255, 0.16)',
  color: '#ffffff'
};

const registerLinkStyle = {
  ...linkStyle,
  backgroundColor: 'rgba(214, 30, 255, 0.25)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  textShadow: '0 0 8px rgba(255, 255, 255, 0.22)'
};

const footerStyle = {
  backgroundColor: 'rgba(10, 14, 32, 0.95)',
  color: '#c8d3ff',
  textAlign: 'center',
  padding: '2rem',
  marginTop: '4rem',
  borderTop: '1px solid rgba(255,255,255,0.08)'
};

export default App;
