# Deployment Guide - AI Pricelist Monitor

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database tables created
- [ ] Admin password set

### 2. Local Testing
- [ ] Application runs locally (`npm run dev`)
- [ ] File uploads work correctly
- [ ] Authentication functions
- [ ] Database connections established

### 3. Vercel Deployment

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
vercel
```

#### Step 3: Configure Environment Variables
In Vercel dashboard, add:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your Vercel app URL)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

### 4. OpenCart Integration

#### Option A: Direct Integration
Add to your OpenCart admin template:
```html
<div class="tab-pane" id="pricelist-monitor">
    <iframe 
        src="https://your-app.vercel.app" 
        width="100%" 
        height="900px" 
        frameborder="0"
        style="border-radius: 4px;">
    </iframe>
</div>
```

#### Option B: Menu Link
Add to OpenCart admin menu:
```php
$data['menus'][] = array(
    'id'       => 'pricelist-monitor',
    'icon'     => 'fa-list-alt',
    'name'     => 'Pricelist Monitor',
    'href'     => 'https://your-app.vercel.app',
    'children' => array()
);
```

### 5. Security Configuration

#### Password Protection
The system uses session-based authentication with the `ADMIN_PASSWORD` environment variable.

#### HTTPS Only
Ensure your Vercel deployment uses HTTPS (default for Vercel).

### 6. Performance Optimization

#### File Upload Limits
- Maximum file size: 50MB
- Supported formats: .xlsx, .xls, .xlsm, .pdf
- Processing timeout: 5 minutes

#### Database Optimization
- Indexes on supplier, category, updated_at
- Pagination for large datasets
- Connection pooling via Supabase

### 7. Monitoring

#### Health Check Endpoint
Access `/api/health` to verify system status.

#### Error Logging
Check Vercel function logs for processing errors.

### 8. Custom Domain (Optional)
1. Add custom domain in Vercel dashboard
2. Update `NEXTAUTH_URL` environment variable
3. Test authentication flow

## 🚨 Troubleshooting

### Common Issues

**Deployment Fails**
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Ensure TypeScript types are correct

**Authentication Not Working**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Ensure cookies are enabled

**File Upload Errors**
- Check file size limits
- Verify tmp directory permissions
- Review function timeout settings

**Database Connection Issues**
- Verify Supabase credentials
- Check service role key permissions
- Ensure tables exist

### Support
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs

---

**Ready for Production!** 🚀