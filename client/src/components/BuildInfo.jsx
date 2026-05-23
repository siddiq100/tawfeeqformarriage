import React from 'react';

/**
 * BuildInfo Component - يعرض معلومات البناء والإصدار
 */
const BuildInfo = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
      <h3>معلومات البناء</h3>
      <p><strong>الإصدار:</strong> 1.0.0</p>
      <p><strong>آخر تحديث:</strong> {new Date().toLocaleDateString('ar-SA')}</p>
      <p><strong>البيئة:</strong> {process.env.NODE_ENV}</p>
      <p><strong>وقت البناء:</strong> {process.env.REACT_APP_BUILD_TIME || 'معروف'}</p>
    </div>
  );
};

export default BuildInfo;
