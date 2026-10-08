"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { coverLetterApi } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { AppNav } from "@/app/dashboard/page";
import Link from "next/link";

interface CoverLetterData {
  id: string;
  resume_id: string;
  cover_letter: string;
  jd_text: string;
  company_name: string | null;
  created_at: string;
}

export default function CoverLetterPage() {
  const params = useParams<{ resumeId: string }>();
  const resumeId = params.resumeId;
  const { user } = useRequireAuth();

  const [jdText, setJdText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<CoverLetterData | null>(null);
  const [previousLetters, setPreviousLetters] = useState<CoverLetterData[]>([]);
  const [loadingPrevious, setLoadingPrevious] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await coverLetterApi.list(resumeId);
        setPreviousLetters(res.data);
      } catch {
        // ignore list errors on load
      } finally {
        setLoadingPrevious(false);
      }
    })();
  }, [user, resumeId]);

  async function handleGenerate() {
    if (!jdText.trim()) return;
    setGenerating(true);
    setError("");
    setResult(null);
    try {
      const res = await coverLetterApi.generate(
        resumeId,
        jdText,
        companyName.trim() || undefined
      );
      setResult(res.data);
      setPreviousLetters((prev) => [res.data, ...prev]);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
            "Failed to generate cover letter. Please try again.")
          : "Failed to generate cover letter. Please try again.";
      setError(message);
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload(text: string, companyName: string | null) {
    const filename = companyName
      ? `cover-letter-${companyName.toLowerCase().replace(/\s+/g, "-")}.txt`
      : "cover-letter.txt";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <AppNav />
      <main className="container" style={{ padding: "2rem 1.5rem", maxWidth: "860px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <Link href="/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.8rem", textDecoration: "none" }}>
              Dashboard
            </Link>
            <span style={{ color: "var(--text-muted)", margin: "0 0.4rem" }}>/</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Cover Letter</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link href={`/builder/${resumeId}`} className="btn btn-ghost btn-sm">Edit resume</Link>
            <Link href={`/builder/${resumeId}/score`} className="btn btn-ghost btn-sm">Score</Link>
          </div>
        </div>

        {/* ── Generate Cover Letter ── */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Generate cover letter</h2>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Paste a job description to generate a tailored cover letter using your resume data. The AI will only reference information from your resume.
          </p>

          <div className="form-group" style={{ marginBottom: "0.875rem" }}>
            <label className="form-label" htmlFor="cl-jd">Job description *</label>
            <textarea
              id="cl-jd"
              className="form-input"
              style={{ minHeight: "120px" }}
              placeholder="Paste the full job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label" htmlFor="cl-company">Company name (optional)</label>
            <input
              id="cl-company"
              type="text"
              className="form-input"
              placeholder="e.g. Google, Microsoft..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleGenerate}
            disabled={generating || !jdText.trim()}
          >
            {generating ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Generating cover letter...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Generate Cover Letter
              </>
            )}
          </button>

          {error && <div className="alert alert-error" style={{ marginTop: "0.75rem" }}>{error}</div>}
        </div>

        {/* ── Generated Result ── */}
        {result && (
          <div className="card animate-fade-in" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Generated cover letter
                  {result.company_name && (
                    <span style={{ fontWeight: 400, color: "var(--text-secondary)", marginLeft: "0.5rem" }}>
                      for {result.company_name}
                    </span>
                  )}
                </h2>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(result.cover_letter)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDownload(result.cover_letter, result.company_name)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download .txt
                </button>
              </div>
            </div>
            <div
              style={{
                background: "var(--bg-elevated)",
                borderRadius: 8,
                padding: "1.25rem",
                border: "1px solid var(--bg-border)",
                whiteSpace: "pre-wrap",
                fontSize: "0.875rem",
                lineHeight: 1.7,
                color: "var(--text-primary)",
              }}
            >
              {result.cover_letter}
            </div>
          </div>
        )}

        {/* ── Previous Cover Letters ── */}
        <div className="card">
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Previous cover letters</h2>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            All cover letters generated for this resume.
          </p>

          {loadingPrevious ? (
            <div className="skeleton" style={{ height: "60px", borderRadius: 8 }} />
          ) : previousLetters.length === 0 ? (
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", fontStyle: "italic" }}>
              No cover letters generated yet. Use the form above to create one.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {previousLetters.map((cl) => (
                <PreviousCoverLetter
                  key={cl.id}
                  data={cl}
                  formatDate={formatDate}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function PreviousCoverLetter({
  data,
  formatDate,
  onCopy,
  onDownload,
}: {
  data: CoverLetterData;
  formatDate: (iso: string) => string;
  onCopy: (text: string) => void;
  onDownload: (text: string, company: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        borderRadius: 8,
        padding: "0.875rem",
        border: "1px solid var(--bg-border)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
            {data.company_name || "Cover Letter"}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.75rem" }}>
            {formatDate(data.created_at)}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.375rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onCopy(data.cover_letter)} style={{ fontSize: "0.75rem" }}>
            Copy
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => onDownload(data.cover_letter, data.company_name)} style={{ fontSize: "0.75rem" }}>
            Download
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(!expanded)} style={{ fontSize: "0.75rem" }}>
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>
      {expanded && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: "0.75rem",
            whiteSpace: "pre-wrap",
            fontSize: "0.825rem",
            lineHeight: 1.65,
            color: "var(--text-secondary)",
            borderTop: "1px solid var(--bg-border)",
            paddingTop: "0.75rem",
          }}
        >
          {data.cover_letter}
        </div>
      )}
    </div>
  );
}
