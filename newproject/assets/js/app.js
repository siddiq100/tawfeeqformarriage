import * as api from './api.js';
import { API_BASE_URL } from './config.js';

// Simple form handling and page-specific bootstrap
document.addEventListener('DOMContentLoaded', ()=>{
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const fd = new FormData(registerForm);
      const data = Object.fromEntries(fd.entries());
      try{
        const res = await api.register(data);
        document.getElementById('message').textContent = res.message || 'تم التسجيل';
      }catch(err){ document.getElementById('message').textContent = err.message }
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm){
    loginForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const fd=new FormData(loginForm);
      const data=Object.fromEntries(fd.entries());
      try{
        const res = await api.login(data);
        if (res.token) localStorage.setItem('tawfeeq_token', res.token);
        document.getElementById('loginMessage').textContent = res.message || 'تم الدخول';
        window.location.href='dashboard.html';
      }catch(err){ document.getElementById('loginMessage').textContent = err.message }
    });
  }

  const verifyForm = document.getElementById('verifyForm');
  if (verifyForm){
    verifyForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const fd = new FormData(verifyForm);
      const data = Object.fromEntries(fd.entries());
      try{ const res = await api.verifyEmail(data); document.getElementById('verifyMessage').textContent = res.message }catch(err){ document.getElementById('verifyMessage').textContent = err.message }
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm){
    contactForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const fd = new FormData(contactForm);
      const data = Object.fromEntries(fd.entries());
      try{ await api.sendContact(data); document.getElementById('contactMessage').textContent='تم الإرسال'; contactForm.reset() }catch(err){ document.getElementById('contactMessage').textContent=err.message }
    });
  }

  const profilesDiv = document.getElementById('profiles');
  if (profilesDiv){
    (async()=>{
      try{
        const res = await api.getProfiles(localStorage.getItem('tawfeeq_token'));
        const users = res.users || [];
        profilesDiv.innerHTML = users.map(u=>`<div class="profile-card"><h4>${u.name}</h4><p>${u.email || ''}</p></div>`).join('') || '<p>لا توجد ملفات</p>';
      }catch(err){ profilesDiv.textContent = 'خطأ في جلب الملفات' }
    })();
  }

  const sendMessageForm = document.getElementById('sendMessageForm');
  if (sendMessageForm){
    sendMessageForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const fd = new FormData(sendMessageForm);
      const data = Object.fromEntries(fd.entries());
      try{
        const token = localStorage.getItem('tawfeeq_token');
        await fetch(`${API_BASE_URL}/api/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(data)
        });
        alert('تم الإرسال');
      }catch(err){ alert('خطأ في الإرسال') }
    });
  }

});
