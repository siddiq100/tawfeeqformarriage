import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartNow = () => {
    navigate('/register');
  };

  return (
    <div>
      <div className="hero">
        <h1>💍 توفيق للزواج</h1>
        <p>
          {user && user.status === 'pending'
            ? 'حسابك الآن في انتظار موافقة الإدارة. يرجى الانتظار حتى يتم تفعيل حسابك.'
            : 'ابحث عن شريك حياتك في بيئة آمنة وموثوقة'}
        </p>
        <button 
          className="primary" 
          style={{ fontSize: '1.1rem', padding: '1rem 2rem', cursor: 'pointer' }}
          onClick={handleStartNow}
        >
          ابدأ الآن
        </button>
      </div>

      <div className="container">
        <div className="grid">
          <div className="card">
            <h3>🔒 آمن وموثوق</h3>
            <p>منصة آمنة مع التحقق من الهوية والموافقة من الإدارة</p>
          </div>
          <div className="card">
            <h3>💬 تواصل سهل</h3>
            <p>رسائل خاصة وتواصل مباشر مع أشخاص متوافقين</p>
          </div>
          <div className="card">
            <h3>❤️ تطابق ذكي</h3>
            <p>نظام تطابق متقدم بناءً على المعايير والاهتمامات</p>
          </div>
          <div className="card">
            <h3>📱 متوفر على الجوال</h3>
            <p>استخدم التطبيق على أي جهاز وفي أي وقت</p>
          </div>
          <div className="card">
            <h3>👥 مجتمع نشط</h3>
            <p>آلاف الأعضاء يبحثون عن الزواج والعلاقات الجادة</p>
          </div>
          <div className="card">
            <h3>⚙️ سهل الاستخدام</h3>
            <p>واجهة بسيطة وسهلة الاستخدام للجميع</p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#f9f9f9', color: '#7b0f8f', padding: '2rem', marginTop: '2rem' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#7b0f8f' }}>كيفية البدء</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>1️⃣</div>
              <h4 style={{ color: '#7b0f8f' }}>إنشاء حساب</h4>
              <p>سجل حساب جديد بسهولة مع بيانات بسيطة</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>2️⃣</div>
              <h4 style={{ color: '#7b0f8f' }}>أكمل ملفك الشخصي</h4>
              <p>أضف صورتك ومعلومات شخصية عنك</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>3️⃣</div>
              <h4 style={{ color: '#7b0f8f' }}>انتظر الموافقة</h4>
              <p>سيتم فحص حسابك من قبل الإدارة</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>4️⃣</div>
              <h4 style={{ color: '#7b0f8f' }}>ابحث وتواصل</h4>
              <p>استكشف الملفات الشخصية وتواصل</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff0f5', color: '#7b0f8f', padding: '2rem', marginTop: '2rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#7b0f8f' }}>ملاحظة مهمة</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
            جميع الحسابات الجديدة تكون في حالة "قيد الانتظار" وتحتاج إلى موافقة من الإدارة قبل تفعيلها.
            هذا يضمن أمان وموثوقية منصتنا. سيتم إخطارك بحالة حسابك عبر البريد الإلكتروني.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
