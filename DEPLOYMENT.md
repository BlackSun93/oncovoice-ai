# OncoVoice AI - Deployment Guide

## Quick Start (Local Testing)

The app is **already running** at: **http://localhost:3000**

Open your browser and start testing!

---

## What You've Built

### ✅ **App Name**: OncoVoice AI
**Tagline**: Clinical Discussion Intelligence

### ✅ **Features**:
- 5-team workflow with color-coded UI
- Arabic-English audio transcription (Whisper API)
- PDF text extraction and comparison
- GPT-4 powered analysis (Summary, Conclusion, Criticism)
- Real-time results dashboard
- Download reports
- Cortex branding throughout

### ✅ **Tech Stack**:
- Next.js 14 + TypeScript
- Tailwind CSS (dark theme, Cortex colors)
- OpenAI Whisper + GPT-4
- Vercel-ready deployment

---

## Testing Locally

### 1. **Home Page** (http://localhost:3000)
- See 5 team selection cards
- Click any team to upload files

### 2. **Upload Page** (http://localhost:3000/upload/1)
- Drag-and-drop audio file (MP3, M4A, WAV - max 25MB)
- Drag-and-drop PDF file (max 10MB)
- Click "Start Analysis"
- Watch processing modal (3-5 minutes)

### 3. **Results Dashboard** (http://localhost:3000/results)
- See all teams' results
- Auto-refreshes every 30 seconds
- Click "View Full Analysis" for details
- Download reports

---

## Deploy to Vercel (Production)

### Option 1: GitHub → Vercel (Recommended)

```bash
# 1. Initialize git
cd "/Users/mohamedosama/Breast 360 AI/oncovoice-ai"
git init
git add .
git commit -m "Initial commit: OncoVoice AI by Cortex"

# 2. Create GitHub repo (go to github.com/new)
# Name: oncovoice-ai

# 3. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/oncovoice-ai.git
git branch -M main
git push -u origin main

# 4. Deploy on Vercel
# - Go to vercel.com
# - Click "Add New Project"
# - Import your GitHub repo
# - Add environment variable: OPENAI_API_KEY
# - Deploy!
```

### Option 2: Vercel CLI (Quick Deploy)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (will prompt for login)
cd "/Users/mohamedosama/Breast 360 AI/oncovoice-ai"
vercel

# Set environment variable
vercel env add OPENAI_API_KEY

# Deploy to production
vercel --prod
```

---

## Custom Domain Setup

After deploying to Vercel:

1. Go to Vercel dashboard → Your project → **Settings** → **Domains**
2. Add your custom domain (e.g., `oncovoice.cortex.com`)
3. Update DNS records at your domain provider:
   - Type: `CNAME`
   - Name: `oncovoice` (or `@` for root)
   - Value: `cname.vercel-dns.com`
4. Wait 5-30 minutes for DNS propagation
5. SSL certificate auto-generated ✅

---

## Environment Variables

### Local (.env.local) - ✅ Already Configured
```env
OPENAI_API_KEY=your-openai-api-key-here
```

### Production (Vercel Dashboard)
```env
OPENAI_API_KEY=your-openai-api-key-here
```

**Note**: Vercel Blob & KV are auto-configured on deployment.

---

## Pre-Event Checklist

### 1 Week Before Event:
- [ ] Deploy to Vercel
- [ ] Set up custom domain
- [ ] Test with sample 30-min Arabic-English audio
- [ ] Test with sample PDF (scientific paper)
- [ ] Verify OpenAI API credits are sufficient ($5-10 recommended)
- [ ] Test on projector (check visibility, colors)
- [ ] Bookmark dashboard URL for moderator

### 1 Day Before Event:
- [ ] Check OpenAI API status (status.openai.com)
- [ ] Check Vercel status (vercel-status.com)
- [ ] Test full workflow end-to-end
- [ ] Prepare backup plan (offline slides if API fails)

### Event Day:
- [ ] Open dashboard on projector display
- [ ] Share upload links with teams
- [ ] Monitor results dashboard
- [ ] Download reports after event

---

## Costs Breakdown

### Per Event (5 teams, 30-min recordings):
- **Whisper API**: $0.90
- **GPT-4 API**: $0.60
- **Total**: ~**$1.50**

### Hosting (Vercel Free Tier):
- **$0/month** (100GB bandwidth, unlimited serverless functions)

### Domain (Optional):
- **$10-15/year** (one-time cost)

---

## Troubleshooting

### "Upload failed"
- Check file sizes (Audio ≤25MB, PDF ≤10MB)
- Verify internet connection
- Try different file format (M4A smaller than MP3)

### "Transcription failed"
- Check OpenAI API key is correct
- Verify API has credits
- Confirm you have Whisper API access

### "Analysis failed"
- Check you have GPT-4 API access
- Verify PDF is text-based (not scanned image)
- Check OpenAI API rate limits

### Dashboard not updating
- Click "Refresh" button manually
- Check browser console for errors
- Verify API routes are working (/api/results)

---

## Support & Monitoring

### During Event:
- **Monitor**: Vercel dashboard → Your project → **Logs**
- **OpenAI usage**: platform.openai.com/usage
- **Errors**: Check browser console (F12)

### After Event:
- **Download reports**: Results dashboard → View Full → Download
- **Export data**: Results stored in Vercel KV (persistent)

---

## Backup Plan (If APIs Fail)

1. **Manual transcription**: Use Google Speech-to-Text or manual typing
2. **Manual analysis**: Have experts review and summarize
3. **Offline mode**: Prepare template slides for results presentation

---

## Next Steps

### Enhancements for Future Events:
- [ ] Add team authentication (passwords)
- [ ] Email notifications when processing completes
- [ ] Real-time audio recording in browser
- [ ] Export results as PDF (not just TXT)
- [ ] Admin panel for moderators
- [ ] Analytics dashboard (processing times, success rates)
- [ ] Multi-language support (Spanish, French, etc.)

---

## File Locations

```
Project folder:  /Users/mohamedosama/Breast 360 AI/oncovoice-ai
Logo:           /Users/mohamedosama/Breast 360 AI/oncovoice-ai/public/images/cortex-logo.png
Documentation:  /Users/mohamedosama/Breast 360 AI/CLAUDE.md
```

---

## Important URLs

- **Local dev**: http://localhost:3000
- **Vercel dashboard**: https://vercel.com/dashboard
- **OpenAI dashboard**: https://platform.openai.com
- **GitHub (after push)**: https://github.com/YOUR_USERNAME/oncovoice-ai

---

## Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod

# View logs (production)
vercel logs
```

---

**Built with ❤️ by Cortex Innovative Solutions**

**Questions? Issues?** Check README.md or CLAUDE.md for detailed documentation.

---

## Success! 🎉

Your OncoVoice AI platform is **ready to use**!

1. **Test locally** at http://localhost:3000
2. **Deploy to Vercel** when ready for production
3. **Share the URL** with your teams
4. **Monitor the dashboard** during your event

**Good luck with your event!** 🚀
