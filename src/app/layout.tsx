import "./globals.css";
import Script from "next/script";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body>

        {/* 🔥 Google Maps Script */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
          strategy="afterInteractive"
        />

        {children}

      </body>
    </html>
  );
}