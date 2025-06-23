/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['bkjjilneuivsindlwhyb.supabase.co'], // Your Supabase project domain
  }
};

module.exports = nextConfig; 