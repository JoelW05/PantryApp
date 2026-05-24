'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
        router.push('/')
        router.refresh()
        return
      }

      // ── Signup ──────────────────────────────────────────────────────────
      // Try the server-side route first (auto-confirms, no email needed)
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const json = await res.json().catch(() => ({ error: 'Unexpected server error' }))
        if (!res.ok) throw new Error(json.error ?? 'Sign up failed')

        // Server created the account — sign in now
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw new Error(signInError.message)
        router.push('/')
        router.refresh()
        return
      } catch (serverErr) {
        // If the error is a user-facing validation error, show it
        const msg = serverErr instanceof Error ? serverErr.message : ''
        if (msg && msg !== 'Service role key not configured') {
          throw serverErr
        }
        // Otherwise (key not configured) fall back to standard signUp below
      }

      // Fallback: standard Supabase signUp (sends confirmation email)
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw new Error(error.message)
      if (data.session) {
        router.push('/')
        router.refresh()
      } else {
        setEmailSent(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Email confirmation sent screen ──────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-sm text-gray-500 mb-2">We sent a confirmation link to</p>
          <p className="text-sm font-semibold text-gray-900 mb-5">{email}</p>
          <p className="text-xs text-gray-400 mb-6">
            Click the link in the email to activate your account, then come back here to sign in.
          </p>
          <button
            onClick={() => { setEmailSent(false); setMode('login') }}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors">
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  // ── Login / Signup form ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">PantryIQ</h1>
          <p className="text-gray-500 mt-2 text-sm">Your smart nutrition &amp; meal planner</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <div className="text-red-700 text-sm bg-red-50 border border-red-300 rounded-lg px-3 py-2.5 font-medium">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors">
            {loading
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>

          <button
            type="button"
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }}
            className="w-full text-xs text-gray-500 hover:text-gray-800 text-center py-1 transition-colors">
            {mode === 'login' ? 'No account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
