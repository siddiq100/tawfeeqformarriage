import { API_BASE_URL } from './config.js';

async function request(path, options={}){
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, Object.assign({headers:{'Content-Type':'application/json'}}, options));
  if (!res.ok){
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  return res.json().catch(()=>null);
}

export async function register(data){
  return request('/api/auth/register',{method:'POST',body:JSON.stringify(data)});
}
export async function login(data){
  return request('/api/auth/login',{method:'POST',body:JSON.stringify(data)});
}
export async function adminLogin(data){
  return request('/api/admin/login',{method:'POST',body:JSON.stringify(data)});
}
export async function verifyEmail(data){
  return request('/api/auth/verify-email',{method:'POST',body:JSON.stringify(data)});
}
export async function getProfiles(token){
  return request('/api/users',{method:'GET',headers:Object.assign({'Authorization':token?`Bearer ${token}`:''},{})});
}
export async function sendContact(data){
  return request('/api/contact',{method:'POST',body:JSON.stringify(data)});
}
export async function getBanners(){
  return request('/api/home-banners',{method:'GET'});
}

export async function uploadBannerImage(file){
  const url = `${API_BASE_URL}/api/admin/home-banner/upload`;
  const fd = new FormData();
  fd.append('bannerImage', file);
  const res = await fetch(url, { method: 'POST', body: fd, headers: { 'Authorization': localStorage.getItem('tawfeeq_token') ? `Bearer ${localStorage.getItem('tawfeeq_token')}` : '' } });
  if (!res.ok) {
    const txt = await res.text(); throw new Error(txt || res.statusText);
  }
  return res.json();
}

export async function saveBanners(payload){
  return request('/api/admin/home-banners',{method:'POST',body:JSON.stringify(payload),headers:Object.assign({'Authorization':localStorage.getItem('tawfeeq_token')?`Bearer ${localStorage.getItem('tawfeeq_token')}`:''},{})});
}
export default {register,login,verifyEmail,getProfiles,sendContact};
