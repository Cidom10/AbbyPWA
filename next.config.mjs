import bundleAnalyzer from '@next/bundle-analyzer';
import nextPWA from 'next-pwa';

// Enable bundle analyzer only when ANALYZE=true
const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

// Enable PWA only in production
const withPWA = nextPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    // disable: process.env.NODE_ENV === "development",
});

// ✅ Merge both plugins properly
export default withBundleAnalyzer(
    withPWA({
        reactStrictMode: false,
        eslint: {
            ignoreDuringBuilds: true,
        },
    })
);