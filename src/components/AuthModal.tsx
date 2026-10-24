"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Lock, Mail, Key, X, CheckCircle, Shield } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserChanged: (user: any) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Registration successful! Please check your email to confirm.",
        });
        if (data.user) onUserChanged(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: "success", text: "Signed in successfully!" });
        if (data.user) {
          onUserChanged(data.user);
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Authentication error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onUserChanged(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-zinc-100 font-bold">
            <Shield className="h-4 w-4 text-amber-500" />
            <span>{currentUser ? "TERMINAL ACCOUNT & KEYS" : "AUTHENTICATE TERMINAL"}</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {currentUser ? (
          /* Signed In State */
          <div className="mt-4 space-y-4">
            <div className="rounded border border-zinc-800 bg-zinc-900/60 p-3">
              <div className="text-[10px] text-zinc-500">AUTHENTICATED AS</div>
              <div className="font-bold text-zinc-200 mt-0.5">{currentUser.email}</div>
              <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>Supabase Cloud Sync Active</span>
              </div>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-900/30 p-3 space-y-2">
              <div className="text-[10px] text-zinc-400 font-bold">SAVED ENCRYPTED BROKERS</div>
              <div className="flex items-center justify-between text-[11px] text-zinc-300">
                <span>Alpaca Markets:</span>
                <span className="text-emerald-400">Configured</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-300">
                <span>Delta Exchange:</span>
                <span className="text-emerald-400">Configured (India)</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-300">
                <span>Deribit Options:</span>
                <span className="text-emerald-400">Public Live</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full rounded border border-rose-500/30 bg-rose-500/10 py-2 text-rose-400 hover:bg-rose-500/20 font-bold transition-colors"
            >
              Sign Out of Terminal
            </button>
          </div>
        ) : (
          /* Login / Register Form */
          <form onSubmit={handleAuth} className="mt-4 space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@fund.com"
                  className="w-full rounded border border-zinc-800 bg-zinc-900 py-2 pl-8 pr-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded border border-zinc-800 bg-zinc-900 py-2 pl-8 pr-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {message && (
              <div
                className={`rounded p-2 text-[11px] ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-amber-500 py-2 font-bold text-zinc-950 hover:bg-amber-400 transition-colors"
            >
              {loading ? "AUTHENTICATING..." : isSignUp ? "CREATE TERMINAL ACCOUNT" : "SIGN IN"}
            </button>

            <div className="flex justify-between items-center pt-2 text-[11px]">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
                className="text-amber-400 hover:underline"
              >
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Register"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
