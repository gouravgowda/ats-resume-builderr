import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://app.gowdahub.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ATS Resume Builder — ATS-Parseable PDF Resumes",
    template: "%s — ATS Resume Builder",
  },
  description:
    "Build a single-column resume as a real selectable-text PDF, verify parse accuracy with a parse-back check, score keyword overlap against any job description, and rewrite weak bullets.",
  keywords: [
    "ATS resume builder",
    "ATS friendly resume",
    "resume parser check",
    "job description keyword match",
    "resume score",
    "PDF resume",
  ],
  authors: [{ name: "ATS Builder" }],
  openGraph: {
    title: "ATS Resume Builder — ATS-Parseable PDF Resumes",
    description:
      "Real selectable-text PDFs, parse-back verification, JD keyword scoring, and bullet rewriting.",
    url: SITE_URL,
    siteName: "ATS Builder",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ATS Resume Builder — ATS-Parseable PDF Resumes",
    description:
      "Real selectable-text PDFs, parse-back verification, JD keyword scoring, and bullet rewriting.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
