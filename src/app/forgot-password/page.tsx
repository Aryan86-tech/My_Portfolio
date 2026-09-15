"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Snowflake, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 mb-4 shadow-lg shadow-cyan-950">
            <Snowflake className="w-7 h-7 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black font-mono tracking-tight text-slate-100">
            RESET PASSWORD
          </h1>
          <p className="text-xs font-mono text-cyan-400/90 mt-1 uppercase tracking-widest">
            Enter your email to recover your access
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-mono text-zinc-300">
              Recovery instructions have been dispatched to <strong>{email}</strong>. Check your inbox.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 hover:underline pt-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="warrior@winterarc.com"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-zinc-600 font-mono outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-black py-3 rounded-xl shadow-lg shadow-cyan-950/60 text-sm transition-all"
            >
              SEND RECOVERY LINK
            </button>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
