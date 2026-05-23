import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/api';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    age: '',
    location: '',
    bio: '',
    religion: '',
    interests: [],
    profilePicture: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  const interests = ['السفر', 'الرياضة', 'القراءة', 'الطبخ', 'الموسيقى', 'الفن', 'التكنولوجيا', 'الطبيعة'];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiClient.get('/api/user/profile');
        const profile = response.data.profile || {};
        setProfileData({
          age: profile.age || '',
          location: profile.location || '',
          bio: profile.bio || '',
          religion: profile.religion || '',
          interests: profile.interests || [],
          profilePicture: response.data.user.profilePicture || ''
        });
      } catch (error) {
        console.error('خطأ في تحميل الملف الشخصي', error);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const uploadPhoto = async () => {
    if (!photoFile) return null;

    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await apiClient.post('/api/profiles/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data.profilePicture;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const photoUrl = await uploadPhoto();
      const payload = {
        ...profileData
      };
      if (photoUrl) payload.images = [photoUrl];

      await apiClient.post('/api/profiles', payload);
      setMessage('✅ تم حفظ الملف الشخصي بنجاح');
    } catch (error) {
      console.error(error);
      setMessage('❌ خطأ في حفظ الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1>الرجاء تسجيل الدخول</h1>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="card">
        <h1>ملفك الشخصي</h1>

        {message && <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>{message}</div>}

        {profileData.profilePicture && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <img src={profileData.profilePicture} alt="الصورة الشخصية" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>رفع صورة شخصية</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>

          <div className="form-group">
            <label>الاسم</label>
            <input type="text" value={user.name} disabled />
          </div>

          <div className="form-group">
            <label>السن</label>
            <input
              type="number"
              name="age"
              value={profileData.age}
              onChange={handleChange}
              placeholder="أدخل سنك"
            />
          </div>

          <div className="form-group">
            <label>المدينة</label>
            <input
              type="text"
              name="location"
              value={profileData.location}
              onChange={handleChange}
              placeholder="مثال: القاهرة"
            />
          </div>

          <div className="form-group">
            <label>الديانة</label>
            <select name="religion" value={profileData.religion} onChange={handleChange}>
              <option value="">اختر الديانة</option>
              <option value="muslim">مسلم</option>
              <option value="christian">مسيحي</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div className="form-group">
            <label>نبذة عنك</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              placeholder="أخبرنا عن نفسك..."
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>اهتماماتك</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {interests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: profileData.interests.includes(interest) ? '2px solid #8B4789' : '1px solid #ddd',
                    backgroundColor: profileData.interests.includes(interest) ? '#8B4789' : 'white',
                    color: profileData.interests.includes(interest) ? 'white' : '#7b0f8f',
                    cursor: 'pointer'
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'جاري الحفظ...' : 'حفظ الملف الشخصي'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
