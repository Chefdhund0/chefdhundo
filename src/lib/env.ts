export const env = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_Y2xlcmsuY2hlZmRodW5kby5jb20k',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
};

// Validate required environment variables
export function validateEnv() {
  if (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.warn('Missing required environment variable: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }
}

// Call validation in development
if (process.env.NODE_ENV === 'development') {
  validateEnv();
}
