import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!email) {
      setMessage('يرجى إدخال البريد الإلكتروني و رمز التأكيد المرسل إليك.');
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !code) {
      setError('يجب إدخال البريد الإلكتروني و رمز التحقق');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-email`, { email, code });
      setMessage(response.data.message || 'تم تأكيد البريد الإلكتروني بنجاح');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل التحقق من البريد الإلكتروني');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');

    if (!email) {
      setError('يجب إدخال البريد الإلكتروني لإعادة الإرسال');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-verification`, { email });
      setMessage(response.data.message || 'تم إرسال رمز التحقق مرة أخرى');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إعادة إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '3rem auto' }}>
      <div className="card">
        <h1>تأكيد البريد الإلكتروني</h1>

        {message && <div style={{ marginBottom: '1rem', fontSize: '1rem', color: '#388e3c', backgroundColor: '#e8f5e9', padding: '1rem', borderRadius: '4px' }}>✅ {message}</div>}
        {error && <div style={{ marginBottom: '1rem', fontSize: '1rem', color: '#d32f2f' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label>رمز التحقق</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="أدخل رمز التحقق"
            />
          </div>

          <button type="submit" className="primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'جاري التحقق...' : 'تأكيد البريد الإلكتروني'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ marginBottom: '0.75rem', color: '#666' }}>لم يصلك الرمز؟ يمكنك إعادة الإرسال هنا:</p>
          <button type="button" onClick={handleResend} className="secondary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'جاري الإرسال...' : 'إعادة إرسال رمز التحقق'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
