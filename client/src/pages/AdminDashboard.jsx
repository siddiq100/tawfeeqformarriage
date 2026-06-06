import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';

const AdminDashboard = () => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [restrictionTarget, setRestrictionTarget] = useState('');
  const [activationDuration, setActivationDuration] = useState(30);
  const [activationUnit, setActivationUnit] = useState('days');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [multiBannerFiles, setMultiBannerFiles] = useState([]);
  const [multiPreviewUrls, setMultiPreviewUrls] = useState([]);
  const [managerMessages, setManagerMessages] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const statusLabels = {
    approved: 'مفعل',
    pending: 'قيد الانتظار',
    suspended: 'معلق',
    banned: 'محظور'
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      loadAllUsers();
      loadPendingUsers();
      loadAdminUsers();
      loadBannerSettings();
      loadManagerMessages();
    }
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiClient.post('/api/admin/login', {
        email: adminEmail,
        password: adminPassword
      });

      localStorage.setItem('adminToken', response.data.token);
      setIsLoggedIn(true);
      setMessage('✅ تم تسجيل دخول الإدارة بنجاح');
      await loadAllUsers();
      await loadPendingUsers();
      await loadAdminUsers();
      await loadBannerSettings();
      await loadManagerMessages();
    } catch (error) {
      setMessage('❌ بيانات تسجيل الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token}` };
  };

  const isErrorMessage = (msg) => msg && String(msg).trim().startsWith('❌');
  const isSuccessMessage = (msg) => msg && String(msg).trim().startsWith('✅');
  const messageBoxStyle = (msg) => {
    if (isErrorMessage(msg)) {
      return { padding: '1rem', marginBottom: '1rem', backgroundColor: '#ffebee', color: '#b00020', borderRadius: '8px', border: '1px solid rgba(244,67,54,0.18)' };
    }
    if (isSuccessMessage(msg)) {
      return { padding: '1rem', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#1b5e20', borderRadius: '8px', border: '1px solid rgba(46,125,50,0.12)' };
    }
    return { padding: '1rem', marginBottom: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' };
  };

  const loadBannerSettings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/home-banner', { headers: getAuthHeaders() });
      const banner = response.data.banner || {};
      setBannerImageUrl(banner.imageUrl || '');
      setBannerTitle(banner.title || '');
      setBannerDescription(banner.description || '');
    } catch (error) {
      console.error('خطأ في تحميل إعدادات البنر:', error);
      setMessage('❌ خطأ في تحميل إعدادات البنر');
    } finally {
      setLoading(false);
    }
  };

  const handleMultiFilesChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setMultiBannerFiles(files);
    setMultiPreviewUrls(files.map(f => URL.createObjectURL(f)));
  };

  const handleSaveMultiBanners = async (e) => {
    e.preventDefault();
    if (multiBannerFiles.length === 0) {
      setMessage('❌ اختر ملفًا واحدًا على الأقل');
      return;
    }
    setLoading(true);
    try {
      const uploaded = [];
      for (const f of multiBannerFiles) {
        const formData = new FormData();
        formData.append('bannerImage', f);
        const uploadRes = await apiClient.post('/api/admin/home-banner/upload', formData, { headers: getAuthHeaders() });
        if (uploadRes.data && uploadRes.data.imageUrl) uploaded.push(uploadRes.data.imageUrl);
      }
      await apiClient.post('/api/admin/home-banners', { images: uploaded, title: bannerTitle, description: bannerDescription }, { headers: getAuthHeaders() });
      setMessage('✅ تم حفظ بنرات الكاروسيل بنجاح');
      setMultiBannerFiles([]);
      setMultiPreviewUrls([]);
      await loadBannerSettings();
    } catch (error) {
      console.error('خطأ في رفع بنرات الكاروسيل:', error);
      setMessage('❌ فشل رفع بنرات الكاروسيل');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBannerImageFile(e.target.files[0]);
    }
  };

  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    if (!bannerImageUrl && !bannerImageFile) {
      setMessage('❌ أدخل رابط صورة أو اختر ملف صورة');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = bannerImageUrl;

      if (bannerImageFile) {
        const formData = new FormData();
        formData.append('bannerImage', bannerImageFile);
        const uploadResponse = await apiClient.post('/api/admin/home-banner/upload', formData, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data.imageUrl;
      }

      await apiClient.post('/api/admin/home-banner', {
        imageUrl,
        title: bannerTitle,
        description: bannerDescription
      }, { headers: getAuthHeaders() });

      setMessage('✅ تم حفظ إعدادات البنر بنجاح');
      setBannerImageFile(null);
      await loadBannerSettings();
    } catch (error) {
      console.error('خطأ في حفظ إعدادات البنر:', error);
      setMessage('❌ فشل حفظ إعدادات البنر');
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/all-users', { headers: getAuthHeaders() });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين:', error);
      setMessage('❌ خطأ في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/admins', { headers: getAuthHeaders() });
      setAdminUsers(response.data.admins || []);
    } catch (error) {
      console.error('خطأ في تحميل المشرفين:', error);
      setMessage('❌ خطأ في تحميل المشرفين');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/pending-users', { headers: getAuthHeaders() });
      setPendingUsers(response.data.users || []);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين المعلقين:', error);
      setMessage('❌ خطأ في تحميل المستخدمين المعلقين');
    } finally {
      setLoading(false);
    }
  };

  const execAdminAction = async (method, url, body) => {
    setLoading(true);
    try {
      await apiClient({ method, url, data: body, headers: getAuthHeaders() });
      setMessage('✅ تم تنفيذ العملية بنجاح');
      await loadAllUsers();
      await loadPendingUsers();
    } catch (error) {
      console.error('خطأ في تنفيذ العملية:', error);
      setMessage('❌ فشلت العملية');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = (userId) => {
    if (activationDuration && activationUnit) {
      return execAdminAction('post', `/api/admin/user/${userId}/activate-duration`, {
        duration: activationDuration,
        unit: activationUnit
      });
    }
    return execAdminAction('post', `/api/admin/user/${userId}/activate`);
  };
  const handleMatch = (userId) => execAdminAction('post', `/api/admin/user/${userId}/set-status`, { status: 'approved' });
  const handleSetPending = (userId) => execAdminAction('post', `/api/admin/user/${userId}/set-status`, { status: 'pending' });
  const handleSuspend = (userId) => execAdminAction('post', `/api/admin/user/${userId}/suspend`);
  const handleBan = (userId) => execAdminAction('post', `/api/admin/user/${userId}/ban`);
  const handleToggleHideOthers = async (userId, currentValue) => {
    try {
      await apiClient.post(`/api/admin/user/${userId}/hide-others`, { hideOthers: !currentValue }, { headers: getAuthHeaders() });
      setMessage('✅ تم تحديث عرض المستخدمين');
      await loadAllUsers();
    } catch (error) {
      console.error('خطأ في تحديث عرض المستخدمين:', error);
      setMessage('❌ فشل تحديث عرض المستخدمين');
    }
  };
  const handleDelete = (userId) => execAdminAction('delete', `/api/admin/user/${userId}`);
  const handleClearRestriction = (userId) => execAdminAction('post', `/api/admin/user/${userId}/clear-restriction`);

  const openEditCredentials = (user) => {
    setEditingUser(user);
    setEditEmail(user.email || '');
    setEditPassword('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editEmail.trim() && !editPassword.trim()) {
      setMessage('❌ ادخل بريدًا أو كلمة مرور لتحديثهما');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/api/admin/user/${editingUser._id}/update-credentials`, {
        email: editEmail.trim() || undefined,
        password: editPassword.trim() || undefined
      }, { headers: getAuthHeaders() });
      setMessage('✅ تم تحديث بيانات الدخول للمستخدم');
      setEditingUser(null);
      setEditEmail('');
      setEditPassword('');
      await loadAllUsers();
      await loadPendingUsers();
    } catch (error) {
      console.error('خطأ في تحديث بيانات الدخول:', error);
      setMessage(error.response?.data?.message || '❌ فشل تحديث بيانات الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleSetRestriction = async () => {
    if (!selectedUserId || !restrictionTarget) {
      setMessage('❌ اختر مستخدمًا وهدفًا للقيود');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/api/admin/user/${selectedUserId}/restrict`, {
        allowedContacts: [restrictionTarget]
      }, { headers: getAuthHeaders() });
      setMessage('✅ تم تقييد المستخدم بنجاح');
      await loadAllUsers();
    } catch (error) {
      console.error('خطأ في تقييد المستخدم:', error);
      setMessage('❌ فشل تقييد المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      setMessage('❌ أدخل رسالة للإشعار');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/admin/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage
      }, { headers: getAuthHeaders() });
      setMessage('✅ تم إرسال الإشعار للجميع');
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (error) {
      console.error('خطأ في إرسال الإشعار:', error);
      setMessage(error.response?.data?.message || '❌ فشل إرسال الإشعار');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      setMessage('❌ يجب إدخال اسم وبريد وكلمة مرور للمشرف');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/admin/admins', {
        email: newAdminEmail,
        password: newAdminPassword,
        name: newAdminName
      }, { headers: getAuthHeaders() });

      setMessage('✅ تم إنشاء مشرف جديد بنجاح');
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      await loadAdminUsers();
      await loadManagerMessages();
    } catch (error) {
      console.error('خطأ في إنشاء مشرف جديد:', error);
      setMessage(error.response?.data?.message || '❌ فشل إنشاء المشرف');
    } finally {
      setLoading(false);
    }
  };

  const loadManagerMessages = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/manager-messages', { headers: getAuthHeaders() });
      setManagerMessages(response.data.messages || []);
    } catch (error) {
      console.error('خطأ في تحميل رسائل المدير:', error);
    } finally {
      setLoading(false);
    }
  };

  const markManagerMessageRead = async (id) => {
    try {
      await apiClient.post(`/api/admin/manager-messages/${id}/read`, {}, { headers: getAuthHeaders() });
      setManagerMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
    } catch (error) {
      console.error('خطأ في وضع الرسالة كمقروءة:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setUsers([]);
    setPendingUsers([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="container" style={{ maxWidth: '500px', margin: '3rem auto' }}>
        <div className="card">
          <h1>🔐 لوحة تحكم الإدارة</h1>
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#1c032c', borderRadius: '16px', border: '1px solid rgba(214, 30, 255, 0.25)', color: '#f7f7ff' }}>
            <p style={{ margin: 0, fontWeight: '700' }}>بيانات تسجيل الدخول للمشرف:</p>
            <p style={{ margin: '0.5rem 0 0' }}><strong>البريد الإلكتروني:</strong> <code>siddiqa@tawfeeq.com</code></p>
            <p style={{ margin: '0.25rem 0 0' }}><strong>كلمة المرور:</strong> <code>admin123</code></p>
          </div>

          {message && <div style={messageBoxStyle(message)}>{message}</div>}

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@tawfeeq.com"
              />
            </div>
            <div className="form-group">
              <label>كلمة المرور</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
              />
            </div>
            <button className="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'جاري التحقق...' : 'دخول الإدارة'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>🔐 لوحة تحكم الإدارة - توفيق للزواج</h1>
        <button className="secondary" onClick={handleLogout}>تسجيل خروج</button>
      </div>

      {message && <div style={messageBoxStyle(message)}>{message}</div>}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>🔔 إشعارات المدير (مطابقات جديدة)</h2>
        {managerMessages.length === 0 && <p>لا توجد إشعارات جديدة.</p>}
        {managerMessages.map(msg => (
          <div key={msg._id} style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem', backgroundColor: msg.read ? '#f5f5f5' : '#fff8e1', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{msg.message}</strong>
                <div style={{ fontSize: '0.9rem', color: '#555' }}>{msg.score ? `Score: ${msg.score}` : ''}</div>
                {msg.newProfileId && <div style={{ fontSize: '0.85rem' }}>New: {msg.newProfileId.userId?.name || ''} — {msg.newProfileId.location || ''}</div>}
                {msg.matchedProfileId && <div style={{ fontSize: '0.85rem' }}>Matched: {msg.matchedProfileId.userId?.name || ''} — {msg.matchedProfileId.location || ''}</div>}
              </div>
              {!msg.read && <button className="secondary" onClick={() => markManagerMessageRead(msg._id)}>وضع كمقروءة</button>}
            </div>
          </div>
        ))}

        <h2>🕘 تفعيل العضو بالمدة</h2>
        <p>اختر مدة التفعيل بالأيام أو الأشهر قبل الضغط على زر التنشيط للمستخدم.</p>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group">
            <label>المدة</label>
            <input
              type="number"
              min="1"
              value={activationDuration}
              onChange={(e) => setActivationDuration(e.target.value)}
              placeholder="مثال: 30"
            />
          </div>
          <div className="form-group">
            <label>الوحدة</label>
            <select value={activationUnit} onChange={(e) => setActivationUnit(e.target.value)}>
              <option value="days">أيام</option>
              <option value="months">شهور</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>�️ إعداد صورة البنر في الصفحة الرئيسية</h2>
        <p>يمكنك تحديث الصورة والنص الذي يظهر في منتصف الصفحة الرئيسية.</p>
        <form onSubmit={handleUpdateBanner}>
          <div className="form-group">
            <label>رابط الصورة</label>
            <input
              type="text"
              value={bannerImageUrl}
              onChange={(e) => setBannerImageUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg"
            />
          </div>
          <div className="form-group">
            <label>رفع ملف صورة</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerFileChange}
            />
            {bannerImageFile && (
              <p style={{ color: '#c8d3ff', marginTop: '0.75rem' }}>تم اختيار: {bannerImageFile.name}</p>
            )}
          </div>
          <div className="form-group">
            <label>عنوان البنر</label>
            <input
              type="text"
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              placeholder="أضف عنوانًا موجزًا"
            />
          </div>
          <div className="form-group">
            <label>وصف البنر</label>
            <textarea
              value={bannerDescription}
              onChange={(e) => setBannerDescription(e.target.value)}
              placeholder="أضف وصفًا قصيرًا"
              rows="3"
            />
          </div>
          {bannerImageUrl && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>معاينة:</strong>
              <img
                src={bannerImageUrl}
                alt="banner preview"
                style={{ maxWidth: '100%', borderRadius: '18px', marginTop: '0.75rem', boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}
              />
            </div>
          )}
          <button className="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'جارٍ الحفظ...' : 'حفظ إعدادات البنر'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>🎚️ رفع عدة صور للبنر (Carousel)</h2>
        <p>حمّل عدة صور ليتم عرضها كـ carousel في الصفحة الرئيسية.</p>
        <form onSubmit={handleSaveMultiBanners}>
          <div className="form-group">
            <label>رفع ملفات متعددة</label>
            <input type="file" accept="image/*" multiple onChange={handleMultiFilesChange} />
          </div>
          {multiPreviewUrls.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {multiPreviewUrls.map((u, i) => (
                <img key={i} src={u} alt={`preview-${i}`} style={{ maxWidth: '160px', borderRadius: '8px', boxShadow: '0 8px 18px rgba(0,0,0,0.2)' }} />
              ))}
            </div>
          )}
          <button className="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'جارٍ الرفع...' : 'رفع وحفظ صور الكاروسيل'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>�📣 إشعار البث للمستخدمين</h2>
        <p>أرسل رسالة إشعار لكل المستخدمين المسجلين. يمكنك تخصيص العنوان والنص.</p>
        <form onSubmit={handleBroadcast}>
          <div className="form-group">
            <label>عنوان الإشعار (اختياري)</label>
            <input
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="مثال: إعلان هام من المنصة"
            />
          </div>
          <div className="form-group">
            <label>نص الإشعار</label>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="اكتب نص الإشعار الذي يصل للجميع"
              rows="4"
            />
          </div>
          <button className="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'جاري الإرسال...' : 'إرسال إشعار للبث'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>🛡️ إنشاء مشرف جديد</h2>
        <p>يمكن للمشرف الرئيسي siddiqa@tawfeeq.com إضافة مشرفين جدد ويتم منحهم صلاحية إدارة أخرى تلقائياً.</p>
        <form onSubmit={handleCreateAdmin}>
          <div className="form-group">
            <label>اسم المشرف</label>
            <input
              type="text"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              placeholder="مثال: أحمد"
            />
          </div>
          <div className="form-group">
            <label>البريد الإلكتروني للمشرف</label>
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="example@tawfeeq.com"
            />
          </div>
          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              placeholder="أدخل كلمة المرور للمشرف الجديد"
            />
          </div>
          <button className="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'جارٍ الإنشاء...' : 'إنشاء مشرف جديد'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>📌 تقييد وصول المستخدمين</h2>
        <p>يمكنك تحديد مستخدم واحد فقط يمكن لمستخدم معين التواصل معه.</p>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group">
            <label>اختر المستخدم</label>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              <option value="">اختر مستخدم</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>المستخدم المسموح له فقط</label>
            <select value={restrictionTarget} onChange={(e) => setRestrictionTarget(e.target.value)}>
              <option value="">اختر مستخدمًا</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>
        </div>
        <button className="primary" onClick={handleSetRestriction} disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'جارٍ التقييد...' : 'حفظ القيد'}
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>📋 جميع المستخدمين</h2>
        {loading ? (
          <div className="loading">جاري التحميل</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>الاسم</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>البريد</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>الحالة</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>الأونلاين</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>الوصول</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>خاصية العرض</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>ينتهي في</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#d61eff', fontWeight: '700' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '1rem' }}>{user.name}</td>
                    <td style={{ padding: '1rem' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}>{statusLabels[user.status] || user.status}</td>
                    <td style={{ padding: '1rem' }}>{user.isOnline ? '🟢 متصل' : '🔴 غير متصل'}</td>
                    <td style={{ padding: '1rem' }}>{user.accessMode === 'restricted' ? 'مقيد' : 'عام'}</td>
                    <td style={{ padding: '1rem' }}>{user.hideOthers ? 'خاص' : 'مرئي للجميع'}</td>
                    <td style={{ padding: '1rem' }}>{user.activationExpiresAt ? new Date(user.activationExpiresAt).toLocaleDateString('ar') : '—'}</td>
                    <td style={{ padding: '1rem', display: 'grid', gap: '0.5rem', justifyItems: 'center' }}>
                      <button className="primary" onClick={() => handleMatch(user._id)} style={{ width: '100%' }}>توفيق المستخدم</button>
                      <button className="primary" onClick={() => handleActivate(user._id)} style={{ width: '100%' }}>تنشيط بمدة</button>
                      <button className="secondary" onClick={() => handleSetPending(user._id)} style={{ width: '100%' }}>قيد الانتظار</button>
                      <button className="secondary" onClick={() => handleSuspend(user._id)} style={{ width: '100%' }}>تعليق</button>
                      <button className="secondary" onClick={() => openEditCredentials(user)} style={{ width: '100%' }}>تعديل بيانات الدخول</button>
                      <button className="secondary" onClick={() => handleDelete(user._id)} style={{ width: '100%', backgroundColor: '#f44336', color: 'white' }}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingUser && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid #3f51b5' }}>
          <h2>✏️ تعديل بيانات الدخول للمستخدم</h2>
          <p>يمكنك تعديل البريد الإلكتروني وكلمة المرور للمستخدم التالي.</p>
          <form onSubmit={handleSaveCredentials}>
            <div className="form-group">
              <label>المستخدم</label>
              <input type="text" value={`${editingUser.name} — ${editingUser.email}`} readOnly />
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني الجديد</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="أدخل البريد الجديد إذا رغبت"
              />
            </div>
            <div className="form-group">
              <label>كلمة المرور الجديدة</label>
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="اتركها فارغة إذا لم ترغب بالتغيير"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="primary" type="submit" disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button className="secondary" type="button" onClick={() => setEditingUser(null)}>
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>🧑‍💼 المشرفون الحاليون</h2>
        {loading ? (
          <div className="loading">جاري التحميل</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>الاسم</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>البريد</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>صلاحية إنشاء مشرف</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map(admin => (
                  <tr key={admin._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '1rem' }}>{admin.name || 'بدون اسم'}</td>
                    <td style={{ padding: '1rem' }}>{admin.email}</td>
                    <td style={{ padding: '1rem' }}>{admin.canCreateAdmins ? '✅ نعم' : '❌ لا'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>🕒 المستخدمون المعلقون</h2>
        {pendingUsers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>لا توجد حسابات معلقة حالياً</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>الاسم</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>البريد</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>النوع</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#d61eff', fontWeight: '700' }}>التاريخ</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#d61eff', fontWeight: '700' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '1rem' }}>{user.name}</td>
                    <td style={{ padding: '1rem' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}>{user.gender === 'male' ? '👨 ذكر' : '👩 أنثى'}</td>
                    <td style={{ padding: '1rem' }}>{new Date(user.createdAt).toLocaleDateString('ar')}</td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button className="primary" onClick={() => handleActivate(user._id)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>✅ قبول</button>
                      <button className="secondary" onClick={() => handleDelete(user._id)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>🗑️ حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
