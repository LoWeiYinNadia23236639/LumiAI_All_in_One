import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Keep ffmpeg-static external so its binary path resolves correctly at runtime.
  serverExternalPackages: ["ffmpeg-static"],
};

export default withNextIntl(nextConfig);
