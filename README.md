# fypquiz 🧠

Transform your study materials into engaging, TikTok-style quiz experiences with AI-generated commentary. Perfect for Gen Z students who want to make learning fun and viral!

## 🚀 Features

- **AI-Powered Quiz Generation**: Upload any document and let AI create engaging quiz questions
- **AI-Generated Commentary**: Get entertained by AI-generated commentary that makes learning fun
- **TikTok-Style Interface**: Modern, engaging UI designed for Gen Z
- **Voice Integration**: High-quality AI voice generation for quiz commentary
- **Study Set Management**: Save and retake your favorite quizzes
- **Real-time Feedback**: Get instant feedback on your answers

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Backend**: Node.js + Supabase
- **AI**: OpenAI GPT-4o for quiz generation
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage for audio files
- **UI Components**: Lucide React icons + Framer Motion

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd icantfocus
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hzihfhnojzqeutenpked.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6aWhmaG5vanpxZXV0ZW5wa2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzYzNDMsImV4cCI6MjA2OTU1MjM0M30.BpVYl0MzwLAExePR4MD2jFHknL27KFr6O_lrgshnK90
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6aWhmaG5vanpxZXV0ZW5wa2VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk3NjM0MywiZXhwIjoyMDY5NTUyMzQzfQ.FmZ4zwqsPviBDhcFo5itpd0gldIzuf546PsK35Jlhjw

# AI Services
OPEN_AI_API_KEY=
ELEVENLABS_API_KEY=
RUNWAY_API_KEY=

# Application Configuration
NODE_ENV=development
```

**Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key. Note that the environment variable is named `OPEN_AI_API_KEY` (with underscore).

### 4. Set up Supabase

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `supabase/migrations/001_initial_schema.sql`

### 5. Add media files

Place your background videos in the `public/videos/` directory:
- `minecraft-parkour.mp4`
- `lofi-study.mp4`
- `nature-scene.mp4`

Place your audio clips in the `public/audio/` directory:
- `q1.mp3` through `q5.mp3`

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
icantfocus/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── quiz/              # Quiz page
├── components/            # React components
│   ├── AuthProvider.tsx   # Authentication context
│   ├── BackgroundVideo.tsx # Background video component
│   ├── FileUploader.tsx   # File upload component
│   ├── QuestionCard.tsx   # Question display component
│   └── QuizPlayer.tsx     # Main quiz player
├── lib/                   # Utility libraries
│   └── supabase.ts        # Supabase client
├── public/                # Static assets
│   ├── audio/             # Audio clips
│   └── videos/            # Background videos
├── supabase/              # Database migrations
└── package.json           # Dependencies
```

## 🎯 Usage

### 1. Authentication
- Sign up with your email and password
- Sign in to access the app

### 2. Create a Study Set
- Upload a document (PDF, DOCX, or TXT)
- AI will analyze the content and generate quiz questions
- Choose a background video and voice option
- Start the quiz experience

### 3. Take the Quiz
- Listen to AI-generated commentary
- Answer multiple choice questions
- Get immediate feedback with funny responses
- View your final score

### 4. Save to Collection
- Save your favorite quizzes to your personal collection
- Access them later for review

## 🔧 API Routes

- `POST /api/generate-quiz`: Generates quiz questions using OpenAI
- `POST /api/save-study-set`: Saves study sets to Supabase

## 🎨 Customization

### Adding New Background Videos
1. Add your video file to `public/videos/`
2. Update the `backgroundVideos` array in `app/quiz/page.tsx`

### Adding New Voice Options
1. Update the `voiceOptions` array in `app/quiz/page.tsx`
2. Add corresponding audio files to `public/audio/`

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `app/globals.css` for custom styles

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your environment variables are set correctly
3. Ensure Supabase is properly configured
4. Check that all media files are in the correct locations

## 🎉 What's Next?

- [ ] Real audio generation using ElevenLabs API
- [ ] Video generation using Runway API
- [ ] More voice options and characters
- [ ] Social sharing features
- [ ] Leaderboards and achievements
- [ ] Mobile app version

---

Made with ❤️ for Gen Z students who can't focus (but want to learn anyway!) 