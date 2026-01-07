# Troubleshooting Guide

## If you see a blank page:

### 1. Check if the dev server is running

Open a terminal and run:

```bash
cd /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps/client
npm run dev
```

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 2. Open the correct URL

- **Frontend**: http://localhost:5173
- **Surveys page**: http://localhost:5173/surveys
- **Dashboard**: http://localhost:5173/dashboard

### 3. Check browser console for errors

1. Open your browser (Chrome/Firefox/Safari)
2. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
3. Go to the **Console** tab
4. Look for any red error messages
5. Share the error message with me

### 4. Common issues and fixes

#### Issue: "Cannot find module" or import errors
**Fix**: Make sure all dependencies are installed:
```bash
cd client
npm install
```

#### Issue: "Port already in use"
**Fix**: Kill the process using port 5173:
```bash
# Mac/Linux
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

#### Issue: Blank page with no errors
**Fix**: Check if you're logged in:
- Go to http://localhost:5173/login
- Login with any credentials (it's mocked)
- Then navigate to /surveys

#### Issue: TypeScript compilation errors
**Fix**: Check the terminal where `npm run dev` is running for TypeScript errors

### 5. Quick test - check if React is working

Try opening: http://localhost:5173/dashboard

If dashboard works but surveys doesn't, the issue is specific to the surveys page.

### 6. Reset everything

If nothing works, try a clean reset:

```bash
cd /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps/client

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

### 7. Check file permissions

Make sure you have read/write access to the project folder:
```bash
ls -la /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps
```

---

## Still not working?

Please share:
1. **What URL are you trying to open?**
2. **What do you see?** (blank page, error message, etc.)
3. **Any errors in browser console?** (F12 → Console tab)
4. **Any errors in terminal?** (where npm run dev is running)

