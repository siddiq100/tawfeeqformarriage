import React, { useState } from 'react';
import apiClient from '../utils/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await apiClient.post('/api/contact', formData);
      setMessage('✅ تم إرسال رسالتك بنجاح. سنرد عليك قريباً.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setMessage('❌ حدث خطأ في إرسال الرسالة. الرجاء المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="card">
        <h1>اتصل بنا</h1>
        <p>لديك سؤال أو اقتراح؟ نود أن نسمع منك!</p>

        {message && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>الاسم</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسمك"
              required
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
              required
            />
          </div>

          <div className="form-group">
            <label>الموضوع</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="ما موضوع رسالتك؟"
              required
            />
          </div>

          <div className="form-group">
            <label>الرسالة</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="اكتب رسالتك..."
              rows="6"
              required
            />
          </div>

          <button type="submit" className="primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #ddd' }}>
          <h3>طرق التواصل الأخرى</h3>
          <p>📧 البريد: info@marriage-app.com</p>
          <p>📱 الهاتف: +20 100 000 0000</p>
          <p>📍 العنوان: القاهرة، مصر</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
