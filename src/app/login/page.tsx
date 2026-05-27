"use client";
import { ArrowRight, Github, Globe, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignUp) {
      // Sign up
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, displayName }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Failed to create account");
          setLoading(false);
          return;
        }

        // Auto sign in after signup
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        router.push("/dashboard");
      } catch (err) {
        setError("An error occurred. Please try again.");
        setLoading(false);
      }
    } else {
      // Sign in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    }
  };

  const handleOAuthSignIn = (provider: "google" | "github") => {
    setLoading(true);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600/20 via-purple-600/10 to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              WanderWise
            </span>
          </Link>
          <div>
            <h2 className="text-4xl font-bold text-foreground leading-tight mb-4">
              Your personal
              <br />
              AI travel agent
              <br />
              awaits.
            </h2>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              One conversation. A complete, intelligent travel plan built just
              for you.
            </p>
          </div>
          <p className="text-xs text-faint-foreground">
            &copy; 2026 WanderWise
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              WanderWise
            </span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {isSignUp
              ? "Join us to start planning amazing trips"
              : "Enter your credentials to continue"}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder={isSignUp ? "At least 8 characters" : "••••••••"}
              />
              {isSignUp && (
                <p className="text-xs text-muted-foreground mt-1">
                  Use at least 8 characters
                </p>
              )}
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded bg-input border-border text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-muted-foreground">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-medium py-3 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative mt-6 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-background text-muted-foreground">
                or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn("github")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError("");
                  }}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError("");
                  }}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  Create one
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
