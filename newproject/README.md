New static project 'newproject' generated from the original Tawfeeq app.

Serve locally:

```bash
cd newproject
python -m http.server 3003
```

Open: http://localhost:3003/index.html

Configure `assets/js/config.js` to point `API_BASE_URL` to your backend.

If you serve `newproject` from the same server origin as the API, the default setting will use the current host automatically.