import Link from "next/link";
import { Compass } from "lucide-react";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "linear-gradient(135deg, #f5f3ff, #fdf2f8, #fff7ed)",
        }}
      >
        <div style={{ textAlign: "center", padding: "24px" }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Compass style={{ width: 48, height: 48, color: "#fff" }} />
          </div>
          <p
            style={{
              fontSize: 64,
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            404
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#171717", margin: "8px 0" }}>
            Page not found
          </h1>
          <p style={{ color: "#737373", marginBottom: 24 }}>
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
