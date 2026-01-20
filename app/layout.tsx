import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";  // ← add this import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mero Baazar - किसान देखि उपभोक्तासम्म",
  description: "नेपालका किसानहरूले सिधै बिक्री गर्ने ताजा तरकारी, फलफूल र अन्य कृषि उत्पादन",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        {/* Toast notifications appear here globally */}
        <Toaster
          position="top-center"              // or "top-right" / "bottom-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Default options for all toasts
            className: "",
            duration: 5000,
            style: {
              background: "#4B7321",         // your brand green
              color: "white",
              borderRadius: "12px",
              padding: "16px 24px",
              fontSize: "16px",
              fontWeight: "500",
              maxWidth: "400px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
            success: {
              style: {
                background: "#4B7321",
                color: "white",
              },
              iconTheme: {
                primary: "white",
                secondary: "#4B7321",
              },
            },
            error: {
              style: {
                background: "#ef4444",
                color: "white",
              },
            },
          }}
        />
      </body>
    </html>
  );
}