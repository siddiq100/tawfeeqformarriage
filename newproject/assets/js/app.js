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

  // Homepage banner carousel
  const bannerCarousel = document.getElementById('bannerCarousel');
  if (bannerCarousel){
    (async ()=>{
      try{
        const res = await api.getBanners();
        const banners = res.banners || [];
        // find first with images or imageUrl
        let imgs = [];
        if (banners.length){
          for (const b of banners){
            if (Array.isArray(b.images) && b.images.length) { imgs = imgs.concat(b.images); }
            else if (b.imageUrl) imgs.push(b.imageUrl);
          }
        }
        if (imgs.length === 0) return;

        // Build simple carousel
        bannerCarousel.innerHTML = `
          <div class="carousel">
            <button class="prev">◀</button>
            <div class="slides"></div>
            <button class="next">▶</button>
          </div>`;
        const slides = bannerCarousel.querySelector('.slides');
        imgs.forEach((src,i)=>{
          const img = document.createElement('img');
          img.src = src;
          img.alt = `banner-${i}`;
          img.className = 'carousel-image';
          slides.appendChild(img);
        });
        let idx = 0;
        const images = slides.querySelectorAll('img');
        const show = (i)=>{
          images.forEach((im,j)=> im.style.display = j===i ? 'block' : 'none');
        };
        show(0);
        bannerCarousel.querySelector('.prev').addEventListener('click', ()=>{ idx = (idx-1+images.length)%images.length; show(idx); });
        bannerCarousel.querySelector('.next').addEventListener('click', ()=>{ idx = (idx+1)%images.length; show(idx); });
        // autoplay
        setInterval(()=>{ idx = (idx+1)%images.length; show(idx); }, 5000);
      }catch(err){ console.warn('carousel load error', err); }
    })();
  }

  // Admin: banner upload UI
  const uploadBtn = document.getElementById('uploadBtn');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminArea = document.getElementById('adminArea');
  const adminLogoutBtn = document.getElementById('adminLogout');

  // show/hide admin area based on token
  const checkAuth = ()=>{
    const token = localStorage.getItem('tawfeeq_token');
    if (token){ adminArea.style.display = ''; if (adminLoginForm) adminLoginForm.style.display='none'; }
    else { if (adminArea) adminArea.style.display='none'; if (adminLoginForm) adminLoginForm.style.display='block'; }
  };
  checkAuth();

  if (adminLogoutBtn){ adminLogoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('tawfeeq_token'); checkAuth(); }); }

  if (adminLoginForm){
    adminLoginForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const fd = new FormData(adminLoginForm);
      const data = Object.fromEntries(fd.entries());
      try{
        const res = await api.adminLogin(data);
        if (res && res.token){ localStorage.setItem('tawfeeq_token', res.token); document.getElementById('loginMessage').textContent = res.message || 'تم الدخول'; checkAuth(); }
        else { document.getElementById('loginMessage').textContent = res.message || 'خطأ في الاستجابة'; }
      }catch(err){ document.getElementById('loginMessage').textContent = err.message || 'خطأ'; }
    });
  }
  if (uploadBtn){
    const filesInput = document.getElementById('bannerFiles');
    const preview = document.getElementById('preview');
    const titleInput = document.getElementById('bannerTitle');
    const descInput = document.getElementById('bannerDesc');

    filesInput.addEventListener('change', ()=>{
      preview.innerHTML = '';
      Array.from(filesInput.files).forEach(f=>{
        const url = URL.createObjectURL(f);
        const img = document.createElement('img');
        img.src = url; img.style.maxWidth='160px'; img.style.margin='6px';
        preview.appendChild(img);
      });
    });

    uploadBtn.addEventListener('click', async ()=>{
      const files = Array.from(filesInput.files || []);
      if (files.length === 0){ document.getElementById('adminMessage').textContent = 'اختر صورة واحدة على الأقل'; return; }
      uploadBtn.disabled = true; document.getElementById('adminMessage').textContent = 'جاري الرفع...';
      try{
        const uploaded = [];
        for (const f of files){
          const r = await api.uploadBannerImage(f);
          if (r && r.imageUrl) uploaded.push(r.imageUrl);
        }
        const payload = { images: uploaded, title: titleInput.value || '', description: descInput.value || '' };
        await api.saveBanners(payload);
        document.getElementById('adminMessage').textContent = 'تم حفظ البنرات بنجاح';
        filesInput.value = '';
        preview.innerHTML = '';
      }catch(err){ document.getElementById('adminMessage').textContent = 'خطأ أثناء الرفع: '+(err.message||err); }
      finally{ uploadBtn.disabled = false; }
    });
  }

});
