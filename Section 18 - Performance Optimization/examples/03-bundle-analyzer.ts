// next.config.ts
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer({
  // ...rest of your Next.js config
});

// Run with: ANALYZE=true npm run build
// Opens an interactive treemap of what's actually in your client bundles.
