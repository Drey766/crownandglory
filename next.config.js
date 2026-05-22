/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },           // Supabase storage
      { protocol: "https", hostname: "static.wixstatic.com" },     // Scraped product images
      { protocol: "https", hostname: "images.unsplash.com" },      // Blog cover images
      { protocol: "https", hostname: "placehold.co" },             // Placeholder images
    ],
  },
};

module.exports = nextConfig;
