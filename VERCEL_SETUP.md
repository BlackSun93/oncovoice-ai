# Vercel Production Setup Guide

This guide will help you set up Vercel Blob and KV storage for your OncoVoice AI app to work in production.

## Prerequisites

- Vercel account (free tier works)
- Project deployed to Vercel (or ready to deploy)

---

## Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm i -g vercel
vercel login
```

---

## Step 2: Link Your Project to Vercel

If you haven't deployed yet:

```bash
vercel link
```

Follow the prompts to link to your existing Vercel project or create a new one.

---

## Step 3: Set Up Vercel Blob Storage

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on the **Storage** tab
4. Click **Create Database** or **Connect Store**
5. Select **Blob** from the list
6. Click **Create** and give it a name (e.g., "oncovoice-files")
7. Click **Connect to Project** and select your project
8. Environment variables will be **automatically added** to your project

### Option B: Using Vercel CLI

```bash
# Create Blob store
vercel blob create

# Follow the prompts
# Name: oncovoice-files
# Link to project: Yes
# Select your project
```

### Verify Blob Setup

After setup, your project should have this environment variable automatically configured:
- `BLOB_READ_WRITE_TOKEN`

You can verify by going to:
Project → Settings → Environment Variables

---

## Step 4: Set Up Vercel KV (Redis) Storage

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on the **Storage** tab
4. Click **Create Database** or **Connect Store**
5. Select **KV** from the list
6. Click **Create** and give it a name (e.g., "oncovoice-results")
7. Click **Connect to Project** and select your project
8. Environment variables will be **automatically added** to your project

### Option B: Using Vercel CLI

```bash
# Create KV store
vercel kv create

# Follow the prompts
# Name: oncovoice-results
# Link to project: Yes
# Select your project
```

### Verify KV Setup

After setup, your project should have these environment variables automatically configured:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

You can verify by going to:
Project → Settings → Environment Variables

---

## Step 5: Set OpenAI API Key in Vercel

You need to add your OpenAI API key as an environment variable:

### Using Vercel Dashboard:

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Add:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-proj-...`)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

### Using Vercel CLI:

```bash
vercel env add OPENAI_API_KEY
# Paste your OpenAI API key when prompted
# Select: Production, Preview, Development
```

---

## Step 6: Redeploy Your Application

After setting up storage and environment variables, you need to trigger a new deployment:

### Option A: Push to Git (Recommended)

```bash
git add .
git commit -m "Configure Vercel Blob and KV storage"
git push
```

Vercel will automatically deploy the new version.

### Option B: Manual Deployment

```bash
vercel --prod
```

---

## Step 7: Verify Everything is Working

1. Go to your production URL (e.g., `https://your-app.vercel.app`)
2. Select a team
3. Upload an audio file and PDF
4. Watch the console logs in Vercel:
   - Go to your project in Vercel Dashboard
   - Click **Deployments**
   - Click on the latest deployment
   - Click **Functions** tab to see real-time logs

### Expected Log Output:

```
✅ Uploading files for team 1...
✅ Audio uploaded to Blob: https://...
✅ PDF uploaded to Blob: https://...
✅ Fetching audio file from URL: https://...
✅ Calling OpenAI transcription model (whisper-1)...
✅ Transcription successful with XXXX characters
✅ Fetching PDF from URL: https://...
✅ PDF uploaded successfully. File ID: file-XXX
✅ Analysis completed successfully
✅ Result saved successfully for team 1
```

### If You See Errors:

**Error: "BLOB_READ_WRITE_TOKEN is not defined"**
- Vercel Blob not properly linked
- Go back to Step 3 and ensure you clicked "Connect to Project"

**Error: "KV_REST_API_URL is not defined"**
- Vercel KV not properly linked
- Go back to Step 4 and ensure you clicked "Connect to Project"

**Error: "OPENAI_API_KEY environment variable is not set"**
- OpenAI API key not set
- Go back to Step 5 and add the environment variable
- Redeploy your app

**Error: "Failed to fetch file from [Blob URL]"**
- Blob store might not be public
- Check Blob settings: files should have `access: "public"` (already set in code)

---

## Step 8: Local Development Setup (Optional)

To test Blob and KV storage locally:

### 1. Pull Environment Variables

```bash
vercel env pull .env.local
```

This will download all production environment variables to your `.env.local` file.

### 2. Verify .env.local

Open `.env.local` and ensure you have:

```env
OPENAI_API_KEY=sk-proj-...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

### 3. Run Development Server

```bash
npm run dev
```

Now your local environment will use the production Blob and KV stores!

---

## Architecture Overview

### Before (Broken in Production):
```
Upload → Local Filesystem → ❌ File Lost
                ↓
        Transcribe Fails (File Not Found)
```

### After (Production-Ready):
```
Upload → Vercel Blob Storage → ✅ File Persisted (Public URL)
                ↓
        Transcribe Fetches from Blob URL → ✅ Success
                ↓
        Analysis Fetches PDF from Blob URL → ✅ Success
                ↓
        Results Saved to Vercel KV → ✅ Persisted
```

---

## Cost Breakdown (Vercel Free Tier)

| Service | Free Tier Limit | Your Usage (Per Event) | Status |
|---------|-----------------|------------------------|--------|
| **Vercel Blob** | 500 MB storage | ~150 MB (5 teams × 30 MB) | ✅ Within limit |
| **Vercel KV** | 256 MB storage | ~1 MB (text results only) | ✅ Within limit |
| **Serverless Functions** | 100 GB-hours/month | ~5 minutes per event | ✅ Within limit |
| **Bandwidth** | 100 GB/month | ~500 MB per event | ✅ Within limit |

**Total Vercel Cost**: $0/month (stays within free tier)

**OpenAI Costs** (per event):
- Whisper: $0.006/min × 30 min × 5 = $0.90
- GPT-4: ~$0.60
- **Total**: ~$1.50 per event

---

## Troubleshooting

### Issue: "Blob storage quota exceeded"

**Solution**: Files are stored indefinitely. Clean up old files:

```bash
# List all blobs
vercel blob list

# Delete old blobs
vercel blob delete <blob-url>
```

Or use the Vercel Dashboard → Storage → Blob → Delete files.

### Issue: "KV storage quota exceeded"

**Solution**: Results are stored forever. Clear old results:

```bash
# Using Vercel CLI
vercel kv del team-1
vercel kv del team-2
# ... etc
```

Or use the Vercel Dashboard → Storage → KV → Browse → Delete keys.

### Issue: "Function timeout after 10 seconds"

**Cause**: Vercel Hobby (free) tier has 10-second timeout for serverless functions.

**Solution**:
- For 30-minute audio files, transcription might take 2-3 minutes
- Upgrade to Vercel Pro ($20/month) for 60-second timeout
- OR: Split processing into smaller chunks

**Quick Fix**: Test with shorter audio files (5-10 minutes) on free tier.

---

## Next Steps

1. ✅ Complete Steps 1-7 above
2. Test with real audio files and PDFs
3. Set up custom domain (optional):
   - Vercel Dashboard → Project → Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed
4. Monitor usage:
   - Vercel Dashboard → Usage
   - Check Blob storage, KV storage, bandwidth

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Blob Docs**: https://vercel.com/docs/storage/vercel-blob
- **Vercel KV Docs**: https://vercel.com/docs/storage/vercel-kv
- **OpenAI Docs**: https://platform.openai.com/docs

---

**Last Updated**: 2025-10-25
**Version**: 1.0
