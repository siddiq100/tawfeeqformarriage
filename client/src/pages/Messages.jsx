import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
    loadUsers();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await apiClient.get('/api/messages');
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('خطأ في تحميل الرسائل', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiClient.get('/api/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/messages', {
        receiverId: selectedUser._id,
        content: newMessage
      });
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('خطأ في إرسال الرسالة', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedMessages = [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <h1>الدردشة مع الأعضاء</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>اختر عضوًا للدردشة</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {users.map(user => (
            <button
              key={user._id}
              type="button"
              onClick={() => setSelectedUser(user)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '999px',
                border: selectedUser?._id === user._id ? '2px solid #8B4789' : '1px solid rgba(123, 15, 143, 0.25)',
                backgroundColor: selectedUser?._id === user._id ? '#8B4789' : 'white',
                color: selectedUser?._id === user._id ? 'white' : '#7b0f8f',
                cursor: 'pointer'
              }}
            >
              {user.name} {user.isOnline ? '🟢' : '🔴'}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>إرسال رسالة جديدة</h3>
        <form onSubmit={handleSendMessage}>
          <div className="form-group">
            <label>المستلم</label>
            <input
              type="text"
              value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : ''}
              disabled
              placeholder="اختر مستخدمًا من الأعلى"
            />
          </div>

          <div className="form-group">
            <label>الرسالة</label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب رسالتك..."
              rows="4"
            />
          </div>

          <button type="submit" className="primary" disabled={loading || !selectedUser}>
            {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
          </button>
        </form>
      </div>

      <div>
        <h3>سجل المحادثات</h3>
        {sortedMessages.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <p>لا توجد رسائل بعد</p>
          </div>
        ) : (
          sortedMessages.map(message => (
            <div key={message._id} className="message-item" style={{ marginBottom: '1rem' }}>
              <div className="message-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{message.senderId._id === localStorage.getItem('userId') ? 'أنت' : message.senderId.name}</strong>
                  {' '}→{' '}
                  <strong>{message.receiverId._id === localStorage.getItem('userId') ? 'أنت' : message.receiverId.name}</strong>
                </div>
                <span>{new Date(message.createdAt).toLocaleDateString('ar')}</span>
              </div>
              <div className="message-content" style={{ padding: '1rem', backgroundColor: '#ffffff', color: '#7b0f8f', borderRadius: '8px' }}>
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;
