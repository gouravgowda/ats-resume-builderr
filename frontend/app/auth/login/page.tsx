"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authApi } from "@/lib/api";
import { LogoMark } from "@/components/LogoMark";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      // Sign in with Firebase Auth (email + password)
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // Best effort: make sure the profile document exists in Firestore
      await authApi.me().catch(() => undefined);
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      setServerError(firebaseErrorMessage(e));
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Continue building your resume.">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="form-input"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && <span className="form-error">{errors.email.message}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            className="form-input"
            type="password"
            placeholder="Min. 8 characters"
            {...register("password")}
          />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
        </div>
        {serverError && (
          <div className="alert alert-error" style={{ fontSize: "0.85rem" }}>{serverError}</div>
        )}
        <button
          id="login-submit"
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ marginTop: "0.5rem", justifyContent: "center" }}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          No account?{" "}
          <Link href="/auth/register" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

/** Map Firebase auth error codes to friendly messages. */
function firebaseErrorMessage(err: { code?: string; message?: string }): string {
  switch (err.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid credentials. Check your email and password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    default:
      return err.message || "Login failed. Check your credentials.";
  }
}

function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "var(--bg-base)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <LogoMark size={28} />
            <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: "var(--text-primary)" }}>ATS Builder</span>
          </Link>
          <h1 style={{ marginTop: "1.5rem", fontSize: "1.5rem", color: "var(--text-primary)" }}>{title}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>{subtitle}</p>
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  );
}
