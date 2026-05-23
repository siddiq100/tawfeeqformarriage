import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1>مرحبا بك في لوحة التحكم</h1>
        <p>الرجاء <a href="/login">تسجيل الدخول</a> أولاً</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>مرحبا، {user.name}! 👋</h1>
      {user.status === 'pending' && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', color: '#856404' }}>
          حسابك حاليًا في انتظار موافقة الإدارة. يرجى الانتظار حتى يتم تفعيل الحساب، وسيتم إعلامك عبر البريد الإلكتروني.
        </div>
      )}
      <div className="grid">
        <div className="card" style={{ cursor: 'pointer' }}>
          <h3>📝 ملفك الشخصي</h3>
          <p>أكمل وحدّث معلومات ملفك الشخصي</p>
          <a href="/profile" style={{ color: '#8B4789' }}>اذهب الآن →</a>
        </div>

        <div className="card" style={{ cursor: 'pointer' }}>
          <h3>👥 استكشف الملفات</h3>
          <p>ابحث عن أشخاص متوافقين معك</p>
          <a href="/browse" style={{ color: '#8B4789' }}>ابدأ البحث →</a>
        </div>

        <div className="card" style={{ cursor: 'pointer' }}>
          <h3>💬 رسائلك</h3>
          <p>تواصل مع الأشخاص المهتمين</p>
          <a href="/messages" style={{ color: '#8B4789' }}>اذهب الآن →</a>
        </div>
      </div>

      <div className="card" style={{ backgroundColor: '#f0e6f0', marginTop: '2rem' }}>
        <h3>ℹ️ نصائح للنجاح</h3>
        <ul>
          <li>أضف صور واضحة وجميلة لملفك الشخصي</li>
          <li>كتب وصفاً جيداً عن نفسك واهتماماتك</li>
          <li>كن صريحاً عن ما تبحث عنه</li>
          <li>تواصل باحترام وأدب مع الآخرين</li>
          <li>تحقق من ملفات الأشخاص بعناية</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
