import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");
    clearError();

    if (!email || !password) {
      setClientError("Please fill in all fields");
      return;
    }

    const res = await login({ email, password });
    if (res.success) {
      navigate("/");
    }
  };

  const displayError = clientError || error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-md space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back to Life OS
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your workspace.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-lg">Sign In</CardTitle>
              <CardDescription>
                Enter your registered email and password to sign in.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Banner */}
              {displayError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{displayError}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-xs font-medium text-foreground"
                    htmlFor="password"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}