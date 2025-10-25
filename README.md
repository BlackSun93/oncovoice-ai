# OncoVoice AI - Clinical Discussion Intelligence

**AI-powered voice analysis platform for oncology professionals**

Built with Next.js 14, TypeScript, Tailwind CSS, and OpenAI APIs.
Powered by **Cortex Innovative Solutions**.

---

## Features

- **Team-based workflow**: 5 teams can upload recordings independently
- **Multi-language support**: Handles Arabic-English mixed conversations
- **AI-powered transcription**: Using OpenAI Whisper API
- **Intelligent analysis**: GPT-4 generates summaries, conclusions, and critical comparisons
- **PDF comparison**: Compares discussions with scientific PDF sources
- **Real-time dashboard**: Auto-refreshing results display
- **Beautiful UI**: Minimal, modern design optimized for projector display
- **High performance**: Built for reliability during live events

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** (type safety)
- **Tailwind CSS** (styling)
- **Framer Motion** (animations)
- **React Dropzone** (file uploads)
- **Lucide React** (icons)

### Backend
- **Next.js API Routes** (serverless functions)
- **OpenAI Whisper API** (audio transcription)
- **OpenAI GPT-4** (content analysis)
- **pdf-parse** (PDF text extraction)

### Deployment
- **Vercel** (hosting, storage, KV database)

---

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **OpenAI API key** (with Whisper and GPT-4 access)

### Installation

```bash
# Clone the repository
cd oncovoice-ai

# Install dependencies
npm install

# Set up environment variables
# Edit .env.local and add your OpenAI API key
# (Already configured for development)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

### Local Development

Already configured in `.env.local`:
```env
OPENAI_API_KEY=sk-proj-...
```

### Production Deployment (Vercel)

Add these in Vercel dashboard:
```env
OPENAI_API_KEY=sk-proj-...
# Vercel Blob & KV are auto-configured
```

---

## Project Structure

```
oncovoice-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home (team selection)
│   │   ├── upload/[team]/page.tsx   # Upload page
│   │   ├── results/page.tsx         # Results dashboard
│   │   ├── api/
│   │   │   ├── upload/route.ts      # File upload endpoint
│   │   │   ├── transcribe/route.ts  # Whisper transcription
│   │   │   ├── analyze/route.ts     # GPT-4 analysis
│   │   │   └── results/route.ts     # Fetch all results
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── FileUploadZone.tsx       # Drag-and-drop upload
│   │   ├── ProcessingModal.tsx      # Processing progress
│   │   ├── TeamResultCard.tsx       # Result preview card
│   │   └── FullResultsModal.tsx     # Full analysis modal
│   ├── lib/
│   │   ├── constants.ts             # App constants
│   │   ├── openai.ts                # OpenAI integration
│   │   ├── pdf-processor.ts         # PDF text extraction
│   │   └── storage.ts               # Data storage (KV/in-memory)
│   └── types/
│       └── index.ts                 # TypeScript types
├── public/
│   └── images/
│       └── cortex-logo.png          # Company logo
├── .env.local                       # Environment variables
├── .env.example                     # Example env file
└── tailwind.config.ts               # Tailwind config
```

---

## How It Works

### 1. Team Selection
- User selects their team (1-5) on home page
- Each team has unique color coding

### 2. File Upload
- Upload **audio file** (MP3, M4A, WAV, up to 25MB)
- Upload **PDF scientific source** (up to 10MB)
- Drag-and-drop or click to browse

### 3. Processing (3-5 minutes)
1. **Upload**: Files stored on server
2. **Transcription**: OpenAI Whisper converts audio to text
3. **PDF Extraction**: Text extracted from PDF
4. **Analysis**: GPT-4 generates:
   - Summary of the discussion
   - Conclusion and key takeaways
   - Critical analysis comparing discussion with PDF source

### 4. Results Dashboard
- All 5 teams' results displayed in grid
- Auto-refreshes every 30 seconds
- Click "View Full" for complete analysis
- Download report as text file

---

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub and push
git remote add origin https://github.com/yourusername/oncovoice-ai.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure project**:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Add environment variable**:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

6. **Click "Deploy"**

### Step 3: Set Up Custom Domain (Optional)

1. In Vercel dashboard → **Domains**
2. **Add your custom domain** (e.g., `oncovoice.yourdomain.com`)
3. **Update DNS records** as instructed by Vercel
4. Wait for SSL certificate (automatic)

---

## Costs

### OpenAI API Costs
**Per event (5 teams, 30-min recordings each):**
- Whisper: $0.006/min × 30 min × 5 teams = **$0.90**
- GPT-4: ~$0.12 per team × 5 teams = **$0.60**
- **Total: ~$1.50 per event**

### Hosting (Vercel Free Tier)
- **Bandwidth**: 100GB/month ✅
- **Serverless Executions**: 100GB-hours ✅
- **Storage**: 500MB ✅
- **Cost**: **$0/month** (stays within free tier)

---

## File Size Limits

- **Audio**: 25MB (OpenAI Whisper API limit)
- **PDF**: 10MB

**Tip**: For 30-min audio, use M4A format (smaller than MP3)

---

## Supported File Formats

- **Audio**: MP3, M4A, WAV, WEBM
- **PDF**: PDF only

---

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (responsive design)

---

## Performance Tips

### For Best Results:
1. **Audio quality**: Use clear recordings (minimal background noise)
2. **PDF format**: Use text-based PDFs (not scanned images)
3. **Internet**: Stable connection during upload
4. **Projector display**: Dark mode optimized for visibility

---

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### OpenAI API Errors
- Check API key is correct in `.env.local`
- Verify you have GPT-4 and Whisper API access
- Check OpenAI account has sufficient credits

### File Upload Issues
- Ensure file sizes are within limits
- Check file formats are supported
- Verify internet connection

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## License

Proprietary - Cortex Innovative Solutions

---

## Support

For event day support or technical issues, contact:
**Cortex Innovative Solutions**

---

## Credits

- **Built by**: Claude Code (Anthropic)
- **Company**: Cortex Innovative Solutions
- **AI Models**: OpenAI Whisper & GPT-4
- **Framework**: Next.js by Vercel

---

**Ready for your event! 🚀**
