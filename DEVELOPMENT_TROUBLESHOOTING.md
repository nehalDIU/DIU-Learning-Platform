# Development Troubleshooting Guide

## Common Issues and Solutions

### 🔄 Code Changes Not Reflecting

**Problem**: Code changes don't show up immediately or revert after page refresh.

**Solutions**:

1. **Clear Development Cache**:
   ```bash
   npm run clear-cache
   npm run dev
   ```

2. **Use Fresh Development Mode**:
   ```bash
   npm run dev:fresh
   ```

3. **Hard Refresh Browser**:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

4. **Clear Browser Cache**:
   - Open DevTools (F12)
   - Right-click refresh button → "Empty Cache and Hard Reload"

### 🗄️ Database Changes Not Showing

**Problem**: Database updates aren't reflected in the application.

**Solutions**:

1. **Check Supabase Connection**:
   - Verify `.env.local` has correct Supabase credentials
   - Check Supabase dashboard for recent changes

2. **Clear API Cache**:
   ```bash
   # The development config now disables API caching
   npm run dev:fresh
   ```

3. **Verify RLS Policies**:
   - Check if Row Level Security policies are blocking data access
   - Test queries directly in Supabase SQL editor

4. **Check Network Tab**:
   - Open DevTools → Network tab
   - Look for failed API requests (red entries)
   - Check response data

### ⚡ Performance Issues

**Problem**: Slow loading or compilation times.

**Solutions**:

1. **Use Development Optimizations**:
   ```bash
   # Development mode now has optimized settings
   npm run dev
   ```

2. **Clear Node Modules Cache**:
   ```bash
   npm run clear-cache
   rm -rf node_modules/.cache
   npm run dev
   ```

3. **Check Memory Usage**:
   ```bash
   # Debug mode with memory inspection
   npm run dev:debug
   ```

### 🚨 Next.js 15 Async Params Errors

**Problem**: Errors about `params.id` needing to be awaited.

**Status**: ✅ **FIXED** - Updated all API routes to use async params properly.

**What was fixed**:
- `/api/courses/[id]/topics/route.ts`
- `/api/semesters/[id]/courses/route.ts`
- `/api/videos/[id]/route.ts`
- `/api/slides/[id]/route.ts`

### 🔧 Development Scripts

**Available Scripts**:

- `npm run dev` - Standard development server
- `npm run dev:fresh` - Clear cache and start fresh
- `npm run clear-cache` - Clear all development caches
- `npm run dev:debug` - Start with debugging enabled

### 📱 Browser Caching Issues

**Development Configuration**:
- Cache headers are now disabled in development mode
- API responses have `no-cache` headers in development
- Static assets don't cache in development

### 🔍 Debugging Tips

1. **Check Terminal Output**:
   - Look for compilation errors
   - Check for API route errors
   - Monitor hot reload status

2. **Use Browser DevTools**:
   - Console tab for JavaScript errors
   - Network tab for API failures
   - Application tab to clear storage

3. **Supabase Debugging**:
   - Check Supabase logs in dashboard
   - Test queries in SQL editor
   - Verify table permissions

### 🚀 Quick Fix Checklist

When experiencing issues, try these in order:

1. ✅ Hard refresh browser (`Ctrl+Shift+R`)
2. ✅ Clear development cache (`npm run clear-cache`)
3. ✅ Restart development server (`npm run dev`)
4. ✅ Check browser console for errors
5. ✅ Check network tab for failed requests
6. ✅ Verify Supabase connection in dashboard

### 📞 Still Having Issues?

If problems persist:

1. Check the terminal output for specific error messages
2. Look at browser DevTools console
3. Verify your `.env.local` file has correct values
4. Test API endpoints directly in browser or Postman
5. Check Supabase dashboard for database connectivity

### 🔄 Environment Variables

Make sure your `.env.local` contains:
```
SUPABASE_URL=https://bpfsnwfaxmhtsdjcjeju.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_URL=https://bpfsnwfaxmhtsdjcjeju.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```
