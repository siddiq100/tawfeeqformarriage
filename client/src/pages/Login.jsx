import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '3rem auto' }}>
      <div className="card">
        <h1>تسجيل الدخول</h1>
        
        {error && <div className="error" style={{ marginBottom: '1rem', fontSize: '1rem', color: '#d32f2f' }}>⚠️ {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور"
            />
          </div>

          <button type="submit" className="primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'جاري التسجيل...' : 'دخول'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          ليس لديك حساب؟ <a href="/register" style={{ color: '#8B4789', textDecoration: 'none' }}>سجل الآن</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
