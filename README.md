# AI Pricelist Monitor - Windows Setup Guide

A complete AI-powered system for monitoring and consolidating pricelists into OpenCart-compatible format.

## 🚀 Quick Start for Windows

### Prerequisites
- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **Git**: Download from [git-scm.com](https://git-scm.com/)
- **Supabase Account**: Sign up at [supabase.com](https://supabase.com/)

### Installation

1. **Run PowerShell as Administrator**
2. **Execute setup script:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/setup-windows.ps1
   ```

3. **Configure environment variables:**
   Edit `.env.local` with your actual values:
   ```env
   NEXTAUTH_SECRET=your-unique-secret-key
   NEXTAUTH_URL=http://localhost:3000
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
   ADMIN_PASSWORD=your-secure-password
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Or double-click `start-windows.bat`

### 🌐 Deployment to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add all environment variables from `.env.local`

### 🔧 OpenCart Integration

#### Option 1: Password-Protected Page
1. Deploy to Vercel
2. Add the URL to your OpenCart admin as a custom page
3. Password protect with the `ADMIN_PASSWORD` from your environment

#### Option 2: Direct Integration
```php
// In your OpenCart admin, create a custom page:
echo '<iframe src="https://your-app.vercel.app" width="100%" height="800px"></iframe>';
```

### 📊 Features

- **🤖 AI-Powered Processing**: Intelligent format detection and data extraction
- **📁 Multi-Format Support**: Excel (.xlsx, .xls, .xlsm) and PDF files
- **🎯 Smart Price Detection**: Retail vs cost, VAT included vs excluded
- **🏷️ Brand Extraction**: Automatic brand identification
- **📂 Category Assignment**: Intelligent product categorization
- **🔄 Real-time Processing**: Live upload and processing feedback
- **📈 Dashboard Analytics**: Processing statistics and data quality metrics
- **🔐 Secure Access**: Password-protected admin interface
- **📤 Export Options**: Excel, CSV, and JSON export for OpenCart

### 🗂️ Project Structure

```
ai-pricelist-monitor/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Next.js pages and API routes
│   ├── lib/                # AI processing libraries
│   └── styles/             # CSS and styling
├── scripts/                # Windows setup scripts
├── package.json            # Dependencies
├── vercel.json            # Deployment configuration
├── .env.template          # Environment template
└── README.md              # This file
```

### 🔍 AI Processing Intelligence

The system includes advanced AI capabilities:

- **Format Detection**: Automatically adapts to different Excel structures
- **Supplier Recognition**: Identifies suppliers from filenames
- **Price Type Detection**: Distinguishes between retail/cost and VAT status
- **Brand Extraction**: Recognizes brand names from product data
- **Category Assignment**: Automatically categorizes products
- **Confidence Scoring**: Quality assessment for each processed product

### 📋 Supported File Formats

#### Excel Files (.xlsx, .xls, .xlsm)
- Multi-sheet support
- Intelligent header detection
- Price column recognition
- Brand-specific sheet processing

#### PDF Files (.pdf)
- Text extraction
- Table recognition
- Price pattern detection

### 🛠️ Development

#### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

#### Adding New Suppliers
Edit `src/lib/ai-processor.ts`:
```typescript
static detectSupplierFromFilename(filename: string): string {
  // Add your supplier patterns here
  if (name.includes('your-supplier')) return 'Your Supplier';
}
```

### 🚨 Troubleshooting

#### Common Issues

**1. Permission Errors**
- Run PowerShell as Administrator
- Set execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**2. Node.js Issues**
- Ensure Node.js 18+ is installed
- Clear npm cache: `npm cache clean --force`

**3. Supabase Connection**
- Verify environment variables
- Check Supabase project settings
- Ensure service role key has proper permissions

**4. File Upload Issues**
- Check file size (max 50MB)
- Verify file format support
- Ensure tmp directory exists

### 📞 Support

For technical support or questions:
- Check the troubleshooting section
- Review error messages in browser console
- Verify all environment variables are set correctly

### 🔄 Updates

To update the system:
```bash
git pull origin main
npm install
npm run build
```

### 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ready to deploy!** 🚀 This system will intelligently process your 58 pricelist files and prepare them for seamless OpenCart integration.