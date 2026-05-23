import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';

const Browse = () => {
  const [profiles, setProfiles] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    ageMin: '',
    ageMax: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await apiClient.get('/api/profiles', {
        params: filters,
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfiles(response.data.profiles);
    } catch (error) {
      console.error('خطأ في تحميل الملفات');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProfiles();
  };

  return (
    <div className="container">
      <h1>استكشف الملفات الشخصية</h1>

      <div className="card">
        <h3>البحث والتصفية</h3>
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>المدينة</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="مثال: القاهرة"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>السن من</label>
            <input
              type="number"
              name="ageMin"
              value={filters.ageMin}
              onChange={handleFilterChange}
              placeholder="20"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>السن إلى</label>
            <input
              type="number"
              name="ageMax"
              value={filters.ageMax}
              onChange={handleFilterChange}
              placeholder="35"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="primary" style={{ width: '100%' }}>البحث</button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading">جاري التحميل</div>
      ) : profiles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>لم يتم العثور على ملفات شخصية تطابق بحثك</p>
        </div>
      ) : (
        <div className="grid">
          {profiles.map(profile => (
            <div key={profile._id || profile.userId._id} className="profile-card">
              <div style={{ height: '200px', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {profile.userId?.profilePicture ? (
                  <img
                    src={profile.userId.profilePicture}
                    alt={profile.userId.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '2rem' }}>📷</span>
                )}
                <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.4rem 0.7rem', borderRadius: '999px', backgroundColor: profile.userId?.isOnline ? '#4caf50' : '#f44336', color: 'white', fontSize: '0.9rem' }}>
                  {profile.userId?.isOnline ? 'متصل' : 'غير متصل'}
                </div>
              </div>
              <div className="profile-info">
                <div className="profile-name">{profile.userId?.name || 'مستخدم'} - {profile.age} سنة</div>
                <div className="profile-details">
                  📍 {profile.location}
                </div>
                <div className="profile-details" style={{ fontSize: '0.9rem' }}>
                  {profile.bio}
                </div>
                <div className="profile-actions">
                  <button className="primary">💬 إرسال رسالة</button>
                  <button className="secondary">❤️ إعجاب</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;
