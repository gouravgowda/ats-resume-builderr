"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resumeApi } from "@/lib/api";
import { useRequireAuth, logout } from "@/lib/auth";
import { LogoMark } from "@/components/LogoMark";

interface ResumeSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_tailored_copy_of: string | null;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await resumeApi.list();
        setResumes(res.data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (editingTitleId && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitleId]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await resumeApi.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDuplicate(id: string) {
    setDuplicatingId(id);
    try {
      const res = await resumeApi.duplicate(id);
      setResumes((prev) => [res.data, ...prev]);
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = "";
    setImporting(true);
    try {
      const res = await resumeApi.importPdf(file);
      const created: ResumeSummary = res.data;
      setResumes((prev) => [created, ...prev]);
      router.push(`/builder/${created.id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to import PDF. Please try again.";
      alert(message);
    } finally {
      setImporting(false);
    }
  }

  function startRename(r: ResumeSummary) {
    setEditingTitleId(r.id);
    setEditingTitleValue(r.title);
  }

  const commitRename = useCallback(async () => {
    if (!editingTitleId) return;
    const id = editingTitleId;
    const newTitle = editingTitleValue.trim();
    setEditingTitleId(null);
    if (!newTitle) return;
    const original = resumes.find((r) => r.id === id);
    if (original && newTitle === original.title) return;
    setResumes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, title: newTitle } : r))
    );
    try {
      await resumeApi.rename(id, newTitle);
    } catch {
      if (original) {
        setResumes((prev) =>
          prev.map((r) => (r.id === id ? { ...r, title: original.title } : r))
        );
      }
    }
  }, [editingTitleId, editingTitleValue, resumes]);

  function cancelRename() {
    setEditingTitleId(null);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename();
    } else if (e.key === "Escape") {
      cancelRename();
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const filtered = resumes
    .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const da = new Date(a.updated_at).getTime();
      const db = new Date(b.updated_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <AppNav />
      <main className="container" style={{ padding: "2rem 1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <span className="kicker" style={{ marginBottom: "0.5rem" }}>Dashboard</span>
            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
              Your resumes
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Build, score, and export ATS-parseable resumes.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              className="btn btn-secondary"
              id="import-pdf-btn"
              onClick={() => importInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? (
                "Importing..."
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Import PDF
                </>
              )}
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".pdf"
              onChange={handleImport}
              style={{ display: "none" }}
            />
            <Link href="/builder/new" className="btn btn-primary" id="create-resume-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New resume
            </Link>
          </div>
        </div>

        {loading || authLoading ? (
          <div style={{ borderTop: "1px solid var(--bg-border)" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: "64px", marginTop: "0.75rem" }} />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div style={{ borderTop: "2px solid var(--ink)", paddingTop: "2.5rem", maxWidth: "480px" }}>
            <p className="mono-label" style={{ marginBottom: "0.75rem" }}>No resumes yet</p>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 600, marginBottom: "0.5rem", fontFamily: "var(--font-serif)" }}>Start with a blank page or an import.</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
              Build a single-column resume, run the parse check, then score it against a job post.
            </p>
            <Link href="/builder/new" className="btn btn-primary" style={{ justifyContent: "center" }}>
              Create resume
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-muted)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                >
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resumes..."
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem 0.5rem 2.25rem",
                    background: "#FFFDF7",
                    border: "1px solid #D3CCB4",
                    borderRadius: "3px",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
                style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5h10"/><path d="M11 9h7"/><path d="M11 13h4"/><path d="M3 17l3 3 3-3"/><path d="M6 18V4"/>
                </svg>
                {sortOrder === "newest" ? "Newest first" : "Oldest first"}
              </button>
            </div>

            {filtered.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "center", padding: "2rem 0" }}>
                No resumes match &ldquo;{searchQuery}&rdquo;
              </p>
            ) : (
              <div
                style={{
                  borderTop: "1px solid var(--bg-border)",
                }}
              >
                {filtered.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.875rem 0.25rem",
                      borderBottom: "1px solid var(--bg-border)",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                        {editingTitleId === r.id ? (
                          <input
                            ref={titleInputRef}
                            type="text"
                            value={editingTitleValue}
                            onChange={(e) => setEditingTitleValue(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={handleTitleKeyDown}
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: 600,
                              background: "#FFFDF7",
                              border: "1px solid var(--ink)",
                              borderRadius: "3px",
                              color: "var(--text-primary)",
                              padding: "0.125rem 0.375rem",
                              outline: "none",
                              width: "100%",
                              maxWidth: "320px",
                            }}
                          />
                        ) : (
                          <h3
                            style={{ fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.3, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                            onClick={() => startRename(r)}
                            title="Click to rename"
                          >
                            {r.title}
                          </h3>
                        )}
                        {r.is_tailored_copy_of && (
                          <span className="badge badge-accent" style={{ flexShrink: 0 }}>Tailored</span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        Updated {formatDate(r.updated_at)}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.375rem", alignItems: "center", flexWrap: "wrap" }}>
                      <Link
                        href={`/builder/${r.id}`}
                        className="btn btn-secondary btn-sm"
                        id={`edit-resume-${r.id}`}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/builder/${r.id}/score`}
                        className="btn btn-ghost btn-sm"
                        id={`score-resume-${r.id}`}
                      >
                        Score
                      </Link>
                      <Link
                        href={`/builder/${r.id}/cover-letter`}
                        className="btn btn-ghost btn-sm"
                        id={`cover-letter-resume-${r.id}`}
                      >
                        Cover letter
                      </Link>
                      <button
                        className="btn btn-ghost btn-sm"
                        id={`duplicate-resume-${r.id}`}
                        onClick={() => handleDuplicate(r.id)}
                        disabled={duplicatingId === r.id}
                        title="Duplicate"
                      >
                        {duplicatingId === r.id ? "..." : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        )}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        id={`delete-resume-${r.id}`}
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                      >
                        {deletingId === r.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export function AppNav() {
  const router = useRouter();
  function handleLogout() {
    logout(router);
  }
  return (
    <nav
      style={{
        borderBottom: "1px solid var(--bg-border)",
        background: "var(--bg-base)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}
      >
        <Link
          href="/dashboard"
          style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}
        >
          <LogoMark size={24} />
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: "1.05rem", color: "var(--text-primary)" }}>ATS Builder</span>
        </Link>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm" id="logout-btn">
          Sign out
        </button>
      </div>
    </nav>
  );
}
