import React from 'react';

const About = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>من نحن</h1>
        <p>
          منصة الزواج هي منصة حديثة وآمنة مخصصة للبحث عن الشريك المناسب والزواج. 
          نؤمن بأهمية إيجاد علاقات جادة وصحية مبنية على الاحترام والتفاهم المتبادل.
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <h3>🎯 رسالتنا</h3>
          <p>
            تقديم منصة آمنة وموثوقة تساعد الناس على إيجاد شريك حياتهم وتحقيق السعادة الزوجية.
          </p>
        </div>

        <div className="card">
          <h3>💎 رؤيتنا</h3>
          <p>
            أن نصبح أكبر منصة زواج في العالم العربي، حيث يلتقي ملايين الأشخاص ويجدون حبهم الحقيقي.
          </p>
        </div>

        <div className="card">
          <h3>✨ القيم</h3>
          <p>
            الأمان والموثوقية والاحترام والشفافية والسرية والعدل.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>لماذا اختيار منصتنا؟</h2>
        <ul style={{ fontSize: '1.1rem', lineHeight: '2' }}>
          <li>✅ منصة آمنة مع التحقق من الهوية</li>
          <li>✅ نظام تطابق ذكي ومتقدم</li>
          <li>✅ فريق دعم عملاء متخصص</li>
          <li>✅ رسوم عادلة وشفافة</li>
          <li>✅ سرية تامة للبيانات الشخصية</li>
          <li>✅ مجتمع آمن وموثوق</li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: '2rem', backgroundColor: '#f0e6f0' }}>
        <h2>تواصل معنا</h2>
        <p>📧 البريد: support@marriage-app.com</p>
        <p>📱 الهاتف: +20 100 000 0000</p>
        <p>🕐 ساعات العمل: السبت - الخميس، 9:00 ص - 9:00 م</p>
      </div>
    </div>
  );
};

export default About;
