import type { NextConfig } from "next";

// Import bundle analyzer (only used when ANALYZE=true)
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",

  images: {
    // Modern remotePatterns configuration (replaces deprecated domains)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kdl-image.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"], // Modern formats for better performance
    minimumCacheTTL: 60 * 60 * 24 * 7, // Cache for 1 week
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ...existing webpack configuration...
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // Core React libraries (highest priority)
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "react",
            priority: 30,
            chunks: "all",
            enforce: true,
          },

          // AWS SDK (heavy library, separate chunk)
          aws: {
            test: /[\\/]node_modules[\\/]@aws-sdk[\\/]/,
            name: "aws-sdk",
            priority: 25,
            chunks: "all",
          },

          // UI framework libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|class-variance-authority|clsx|tailwind-merge)[\\/]/,
            name: "ui-libs",
            priority: 20,
            chunks: "all",
          },

          // Form and utility libraries
          utils: {
            test: /[\\/]node_modules[\\/](react-hook-form|axios|use-debounce|ulid|nprogress|react-spinners)[\\/]/,
            name: "utils",
            priority: 15,
            chunks: "all",
          },

          // Students feature bundle
          students: {
            test: /[\\/]components[\\/]entities[\\/]students[\\/]|[\\/]app[\\/]\(main\)[\\/]students[\\/]|[\\/]app[\\/]\(profile\)[\\/]student[\\/]/,
            name: "students-chunk",
            priority: 10,
            chunks: "all",
            minChunks: 1,
          },

          // Teachers feature bundle
          teachers: {
            test: /[\\/]components[\\/]entities[\\/]teachers[\\/]|[\\/]app[\\/]\(main\)[\\/]teachers[\\/]|[\\/]app[\\/]\(profile\)[\\/]teacher[\\/]/,
            name: "teachers-chunk",
            priority: 10,
            chunks: "all",
            minChunks: 1,
          },

          // Courses feature bundle
          courses: {
            test: /[\\/]components[\\/]entities[\\/]courses[\\/]|[\\/]app[\\/]\(main\)[\\/]courses[\\/]/,
            name: "courses-chunk",
            priority: 10,
            chunks: "all",
            minChunks: 1,
          },

          // Invoices feature bundle
          invoices: {
            test: /[\\/]components[\\/]entities[\\/]invoices[\\/]|[\\/]app[\\/]\(main\)[\\/]invoices[\\/]|[\\/]app[\\/]\(profile\)[\\/]invoice[\\/]/,
            name: "invoices-chunk",
            priority: 10,
            chunks: "all",
            minChunks: 1,
          },

          // Create Invoice/Enrollments feature bundle (main route: create-invoice, components: enrollments)
          enrollments: {
            test: /[\\/]components[\\/]entities[\\/]enrollments[\\/]|[\\/]app[\\/]\(main\)[\\/]create-invoice[\\/]|[\\/]app[\\/]\(profile\)[\\/]enrollment[\\/]/,
            name: "enrollments-chunk",
            priority: 10,
            chunks: "all",
            minChunks: 1,
          },

          // Parents feature bundle
          parents: {
            test: /[\\/]components[\\/]entities[\\/]parents[\\/]|[\\/]app[\\/]\(main\)[\\/]parents[\\/]|[\\/]app[\\/]\(profile\)[\\/]parent[\\/]/,
            name: "parents-chunk",
            priority: 10,
            chunks: "all",
            minChunks: 1,
          },

          // Schedule and Today features
          schedule: {
            test: /[\\/]components[\\/]entities[\\/](schedule|today)[\\/]|[\\/]app[\\/]\(main\)[\\/](schedule|today|my-schedules)[\\/]/,
            name: "schedule-chunk",
            priority: 10,
            chunks: "all",
            minChunks: 1,
          },

          // Shared UI components
          sharedUI: {
            test: /[\\/]components[\\/](ui|layout|shared|auth)[\\/]|[\\/]components[\\/]entities[\\/](discounts|feedbacks|sessions)[\\/]/,
            name: "shared-ui",
            priority: 8,
            chunks: "all",
            minChunks: 2,
          },

          // Additional main features (feedback, management-fee, notifications, receipts, sessions)
          additionalFeatures: {
            test: /[\\/]app[\\/]\(main\)[\\/](feedback|management-fee|notifications|receipts|sessions)[\\/]/,
            name: "additional-features",
            priority: 7,
            chunks: "all",
            minChunks: 1,
          },

          // Context and hooks
          context: {
            test: /[\\/](context|hooks)[\\/]/,
            name: "context-hooks",
            priority: 8,
            chunks: "all",
          },

          // Auth pages
          auth: {
            test: /[\\/]app[\\/]\(auth\)[\\/]/,
            name: "auth-chunk",
            priority: 7,
            chunks: "all",
          },

          // Remaining vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 5,
            chunks: "all",
            minChunks: 2,
          },

          // Default chunk for anything else
          default: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
