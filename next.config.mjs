/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Allow images from Supabase Storage
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
        ],
    },
};

export default nextConfig;
