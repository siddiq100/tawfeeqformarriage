# Vercel Web Analytics Setup Guide

## Current Project Status

**⚠️ IMPORTANT:** This repository currently contains only configuration files and documentation. The actual `client/` and `server/` directories with application code are not present. This guide is prepared for when the application code exists.

## Installation Instructions (For Future Implementation)

Based on the official Vercel Analytics documentation (retrieved May 24, 2026), here's how to set up Web Analytics once the React client code exists:

### 1. Install the Package

Navigate to the client directory and install `@vercel/analytics`:

```bash
cd client
npm install @vercel/analytics
```

### 2. Add Analytics Component (React Application)

Since this is a React application (not Next.js based on the project structure), you need to add the Analytics component to your main App component.

**For React (Pages Router or Standard React App):**

Edit `client/src/App.jsx` or your main application component:

```jsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Your existing app components */}
      <Analytics />
    </>
  );
}

export default App;
```

**Alternative: If using index.jsx/index.js as entry point:**

You can also add it in `client/src/index.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Analytics } from '@vercel/analytics/react';

ReactDOM.render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>,
  document.getElementById('root')
);
```

### 3. Update package.json

Add the dependency to `client/package.json` in the dependencies section:

```json
{
  "dependencies": {
    "@vercel/analytics": "^1.1.1",
    // ... other dependencies
  }
}
```

### 4. Environment Configuration (Optional)

If you need to configure analytics differently for development vs production, you can use environment variables:

Create or update `client/.env.local`:

```env
# Optional: Set analytics mode
# VERCEL_ANALYTICS_MODE=production
```

### 5. Enable in Vercel Dashboard

Before deployment:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Navigate to Settings → Analytics
4. Enable "Web Analytics"
5. Deploy your application using `vercel deploy`

### 6. Verify Installation

After deployment, you can verify analytics are working:

1. Visit your deployed application
2. Navigate through a few pages
3. Return to Vercel Dashboard → Analytics
4. You should see page views and visitor data appearing (may take a few minutes)

## Framework-Specific Notes

This project uses **React** (standard React, not Next.js), so:
- Import from `'@vercel/analytics/react'`
- Add `<Analytics />` component to your main App or root component
- The component should be rendered once at the root level

## Build and Deployment

After adding analytics:

1. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Test locally:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Deploy to Vercel:**
   ```bash
   vercel deploy
   ```

## Additional Configuration Options

### Debug Mode

For debugging, you can enable debug mode:

```jsx
import { Analytics } from '@vercel/analytics/react';

<Analytics debug={true} />
```

### Development Mode

To test analytics in development:

```jsx
import { Analytics } from '@vercel/analytics/react';

<Analytics mode="development" />
```

## Expected File Structure After Implementation

```
marriage-app/
├── client/
│   ├── src/
│   │   ├── App.jsx              ← Add <Analytics /> here
│   │   ├── index.jsx
│   │   └── ...
│   ├── package.json             ← @vercel/analytics added here
│   └── .env.local               ← Optional config
├── server/
│   └── ...
└── package.json
```

## Troubleshooting

### Analytics Not Showing Data

1. Ensure Web Analytics is enabled in Vercel Dashboard
2. Check that `<Analytics />` component is rendered
3. Verify the application is deployed to Vercel
4. Wait 5-10 minutes for initial data to appear
5. Check browser console for any errors

### Development vs Production

- Analytics work differently in development vs production
- For testing, use `mode="development"` prop
- Production analytics only work on Vercel-deployed sites

## Resources

- Official Documentation: https://vercel.com/docs/analytics/quickstart
- React Integration: https://vercel.com/docs/analytics/package
- Package Repository: https://www.npmjs.com/package/@vercel/analytics

## Next Steps

Once the `client/` directory with React application code exists:

1. Navigate to the client directory
2. Run `npm install @vercel/analytics`
3. Add the `<Analytics />` component to your App.jsx
4. Test the build with `npm run build`
5. Deploy to Vercel
6. Enable Web Analytics in Vercel Dashboard

---

**Document Created:** May 24, 2026  
**Status:** Ready for implementation once application code exists  
**Framework:** React (Standard)  
**Package Version:** @vercel/analytics (latest stable)
