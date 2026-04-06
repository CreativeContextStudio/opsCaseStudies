import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@astrolab/db', '@astrolab/types', '@astrolab/ui'],
}

export default nextConfig
