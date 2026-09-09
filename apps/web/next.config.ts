import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Amazon product images (book covers from Amazon)
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images-eu.ssl-images-amazon.com",
        pathname: "/**",
      },
      // Cloudinary (avatar & book image uploads)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Gravatar (user avatars)
      {
        protocol: "https",
        hostname: "www.gravatar.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gravatar.com",
        pathname: "/**",
      },
      // Google user profile photos
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      // Open Library (book cover fallbacks)
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        pathname: "/**",
      },
      // Picsum placeholder images (dev/testing)
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      // UI Avatars (generated initials avatars)
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      // Local API server (dev uploads served statically)
      {
        protocol: "http",
        hostname: "localhost",
        port: "5005",
        pathname: "/**",
      },
      // Unsplash (marketing / placeholder images)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // placehold.co (placeholder images used in dev/fallbacks)
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      // via.placeholder.com (legacy placeholder images)
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      // Google Books API thumbnails
      {
        protocol: "https",
        hostname: "books.google.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
