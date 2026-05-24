'use client'
import { useState, useEffect } from 'react'
import { X, ReceiptText, UtensilsCrossed, Target, ChevronRight, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'pantryiq_onboarding_v1'

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to PantryIQ',
    body: 'Your AI-powered pantry that turns what you have into meals you\'ll love — and helps you waste less.',
    cta: 'Get started',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    emoji: '🛒',
    title: 'Start with your receipt',
    body: 'Scan a supermarket receipt and we\'ll automatically add everything to your pantry. It takes about 30 seconds.',
    cta: 'Go to pantry →',
    href: '/pantry',
    gradient: 'from-sky-400 to-blue-500',
  },
  {
    emoji: '✨',
    title: 'Get instant meal ideas',
    body: 'Once your pantry is stocked, our AI suggests personalised recipes based on what you already have — and highlights items expiring soon.',
    cta: 'See meal ideas →',
    href: '/meals',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    emoji: '🎯',
    title: 'Set your goals',
    body: 'Tell us your nutrition targets and allergens. We\'ll personalise every suggestion to match your dietary needs.',
    cta: 'Set goals →',
    href: '/goals',
    gradient: 'from-rose-400 to-pink-500',
  },
]

export default function OnboardingModal({ isNewUser }: { isNewUser: boolean }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isNewUser) return
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (!dismissed) setOpen(true)
    } catch {
      // localStorage may not be available (SSR or private mode)
    }
  }, [isNewUser])

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    setOpen(false)
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      dismiss()
    }
  }

  if (!open) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Gradient hero */}
        <div className={`bg-gradient-to-br ${current.gradient} p-8 flex items-center justify-center relative`}>
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors">
            <X size={14} />
          </button>
          <span className="text-6xl drop-shadow-sm">{current.emoji}</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{current.title}</h2>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{current.body}</p>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 justify-center py-1">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)}
                className={`rounded-full transition-all ${i === step ? 'w-5 h-2 bg-emerald-500' : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'}`} />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors">
                Back
              </button>
            )}
            {current.href ? (
              <a href={current.href} onClick={dismiss}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium text-center transition-colors flex items-center justify-center gap-1.5">
                {current.cta} <ChevronRight size={14} />
              </a>
            ) : (
              <button onClick={next}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                {isLast ? (
                  <><Sparkles size={14} /> {current.cta}</>
                ) : (
                  <>{current.cta} <ChevronRight size={14} /></>
                )}
              </button>
            )}
          </div>

          <button onClick={dismiss} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">
            Skip introduction
          </button>
        </div>
      </div>
    </div>
  )
}
