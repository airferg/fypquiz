// Environment variable configuration with validation
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  openai: {
    apiKey: process.env.OPEN_AI_API_KEY,
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY,
  },
  runway: {
    apiKey: process.env.RUNWAY_API_KEY,
  },
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
}

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPEN_AI_API_KEY',
  'ELEVENLABS_API_KEY',
  'RUNWAY_API_KEY',
]

const optionalEnvVars = [
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
]

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
const missingOptionalEnvVars = optionalEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.warn(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
  console.warn('Some features may not work properly without these variables set')
}

if (missingOptionalEnvVars.length > 0) {
  console.warn(`Missing optional environment variables: ${missingOptionalEnvVars.join(', ')}`)
  console.warn('Google OAuth will not work without these variables set')
}

export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production' 