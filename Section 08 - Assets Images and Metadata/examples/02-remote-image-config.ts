// next.config.ts
// Remote images must be explicitly allowed before next/image will optimize them.

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.example.com" },
    ],
  },
};

export default nextConfig;

// Usage:
// <Image src="https://images.example.com/photo.jpg" alt="Photo" width={800} height={600} />
