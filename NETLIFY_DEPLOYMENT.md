# Netlify Deployment Guide

This guide covers deploying the Phronos monorepo (Homepage + IDE) as a single project on Netlify.

## 📁 Project Structure

```
phronos-ai-race/
├── homepage/          # Marketing website
├── ide/              # Phronos IDE
├── build-all.sh      # Build script
└── netlify.toml      # Netlify configuration
```

After build, both projects are merged:
```
homepage/dist/
├── index.html        # Homepage
├── assets/           # Homepage assets
└── ide/             # IDE (nested)
    ├── index.html
    └── assets/
```

## 🚀 Deployment Steps

### 1. Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to your GitHub repository
4. Select the `phronos-ai-race` repository

### 2. Configure Build Settings

**Netlify will automatically detect the `netlify.toml` file**, but verify these settings:

- **Base directory**: Leave empty (root)
- **Build command**: `bash build-all.sh`
- **Publish directory**: `homepage/dist`
- **Production branch**: `main` (or your default branch)

### 3. Set Environment Variables

In Netlify dashboard, go to:
**Site settings** → **Environment variables** → **Add a variable**

Add this variable:
```
Key: VITE_OPENROUTER_API_KEY
Value: your_openrouter_api_key_here
```

⚠️ **Important**: This is for the IDE only. The homepage doesn't need it.

### 4. Deploy!

Click **"Deploy site"**

Netlify will:
1. Run `bash build-all.sh`
2. Build homepage
3. Build IDE
4. Merge IDE into `homepage/dist/ide`
5. Deploy `homepage/dist`

## 🌐 URL Structure

After deployment:
- **Homepage**: `https://your-site.netlify.app/`
- **IDE**: `https://your-site.netlify.app/ide`

All homepage buttons will open the IDE in a new tab at `/ide`.

## ✅ What's Already Configured

The `netlify.toml` file includes:

✅ Build command and publish directory  
✅ SPA routing for both homepage and IDE  
✅ Security headers  
✅ Asset caching  
✅ Redirects for `/ide/*` routes  

## 🔧 Troubleshooting

### Build fails with "bash: build-all.sh: Permission denied"
The script should be executable. Run locally:
```bash
chmod +x build-all.sh
git add build-all.sh
git commit -m "Make build script executable"
git push
```

### IDE pages show 404
Check that the redirect rules in `netlify.toml` are correct:
```toml
[[redirects]]
  from = "/ide/*"
  to = "/ide/index.html"
  status = 200
```

### Environment variable not working
1. Go to Site settings → Environment variables
2. Make sure `VITE_OPENROUTER_API_KEY` is set
3. Trigger a new deploy: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### Homepage shows old content
Clear Netlify cache:
1. Go to **Site settings** → **Build & deploy** → **Post processing**
2. Click **Clear cache and retry deploy**

## 🔄 Continuous Deployment

Every push to your main branch will automatically:
1. Trigger a build
2. Run `build-all.sh`
3. Deploy both projects

## 📊 Build Time

Expected build times:
- Homepage: ~1 minute
- IDE: ~1-2 minutes
- **Total**: ~2-3 minutes

## 🎯 Custom Domain (Optional)

To use a custom domain:
1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow Netlify's DNS instructions
4. Your site will be available at `yourdomain.com`
5. IDE will be at `yourdomain.com/ide`

## 📝 Additional Notes

- The build uses `npm ci --legacy-peer-deps` to avoid dependency conflicts
- Both projects are built in production mode
- Source maps are excluded from builds for security
- Assets are cached for 1 year (immutable)

## 🆘 Need Help?

Check the deploy logs in Netlify dashboard:
**Deploys** → Click on latest deploy → **View deploy log**

Common issues:
- Missing dependencies → Check `package.json`
- Build timeouts → Contact Netlify support for increased limits
- Environment variables → Verify they're set correctly

---

**Ready to deploy?** Just push to your repository and Netlify will handle the rest! 🚀

