/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['shared-types', 'workflow-contracts', 'prompts', 'brand-presets', 'video-templates'],
  experimental: {
    serverComponentsExternalPackages: ['playwright-core', 'three']
  }
};

export default nextConfig;
