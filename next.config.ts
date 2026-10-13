import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'nodemailer', 'razorpay'],
};

export default nextConfig;
