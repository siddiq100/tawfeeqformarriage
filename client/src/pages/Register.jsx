import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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

    if (!formData.name || !formData.email || !formData.password || !formData.gender) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.name, formData.gender);
      setMessage('✅ تم التسجيل بنجاح! تم إرسال رمز التحقق إلى بريدك الإلكتروني.');
      setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`), 2000);
    } catch (err) {
      setError(err.message || 'خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '3rem auto' }}>
      <div className="card">
        <h1>إنشاء حساب جديد</h1>
        
        {error && <div className="error" style={{ marginBottom: '1rem', fontSize: '1rem', color: '#d32f2f' }}>⚠️ {error}</div>}
        {message && <div style={{ marginBottom: '1rem', fontSize: '1rem', color: '#388e3c', backgroundColor: '#e8f5e9', padding: '1rem', borderRadius: '4px' }}>✅ {message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>الاسم الكامل</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسمك الكامل"
            />
          </div>

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
            <label>النوع</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">اختر النوع</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
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

          <div className="form-group">
            <label>تأكيد كلمة المرور</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور مجددا"
            />
          </div>

          <button type="submit" className="primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          هل لديك حساب؟ <a href="/login" style={{ color: '#8B4789', textDecoration: 'none' }}>دخول</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
