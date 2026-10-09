"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authApi } from "@/lib/api";
import { LogoMark } from "@/components/LogoMark";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords do not match.",
  path: ["confirm"],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
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
      // Create the account in Firebase Auth
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      // Best effort: create the profile document in Firestore via backend
      await authApi.me().catch(() => undefined);
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      setServerError(firebaseErrorMessage(e));
    }
  };

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
          <h1 style={{ marginTop: "1.5rem", fontSize: "1.5rem", color: "var(--text-primary)" }}>Create an account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Start building ATS-parseable resumes.
          </p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input id="reg-email" className="form-input" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" className="form-input" type="password" placeholder="Min. 8 characters" {...register("password")} />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
              <input id="reg-confirm" className="form-input" type="password" placeholder="Repeat password" {...register("confirm")} />
              {errors.confirm && <span className="form-error">{errors.confirm.message}</span>}
            </div>
            {serverError && <div className="alert alert-error" style={{ fontSize: "0.85rem" }}>{serverError}</div>}
            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ marginTop: "0.5rem", justifyContent: "center" }}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Already have an account?{" "}
              <Link href="/auth/login" style={{ color: "var(--accent)", textDecoration: "none" }}>Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function firebaseErrorMessage(err: { code?: string; message?: string }): string {
  switch (err.code) {
    case "auth/email-already-in-use":
      return "Email already registered. Try signing in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters.";
    default:
      return err.message || "Registration failed.";
  }
}
