import Link from 'next/link'
import { Plus, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { sumIntake, computeGaps } from '@/lib/nutrition'
import NutrientGapChart from '@/components/nutrition/NutrientGapChart'
import OnboardingModal from '@/components/onboarding/OnboardingModal'
import type { IntakeLog, NutritionGoals } from '@/types'

// ── helpers ─────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function computeStreak(loggedAts: string[]): number {
  const unique = [...new Set(loggedAts.map(d => d.split('T')[0]))].sort().reverse()
  if (unique.length === 0) return 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (unique[0] !== today && unique[0] !== yesterday) return 0
  let n = 1
  for (let i = 1; i < unique.length; i++) {
    const diff = Math.round((new Date(unique[i - 1]).getTime() - new Date(unique[i]).getTime()) / 86400000)
    if (diff === 1) n++
    else break
  }
  return n
}

function weeklyAverage(logs: { logged_at: string; calories?: number | null; protein_g?: number | null }[]) {
  const map = new Map<string, { cal: number; pro: number }>()
  for (const l of logs) {
    const day = l.logged_at.split('T')[0]
    const prev = map.get(day) ?? { cal: 0, pro: 0 }
    map.set(day, { cal: prev.cal + (l.calories ?? 0), pro: prev.pro + (l.protein_g ?? 0) })
  }
  const days = map.size
  if (days === 0) return { avgCal: 0, avgPro: 0, days: 0 }
  const totals = [...map.values()].reduce((s, d) => ({ cal: s.cal + d.cal, pro: s.pro + d.pro }), { cal: 0, pro: 0 })
  return { avgCal: Math.round(totals.cal / days), avgPro: Math.round(totals.pro / days), days }
}

function nextStep(pantryCount: number, hasLogsEver: boolean, hasGoals: boolean) {
  if (pantryCount === 0) return {
    title: 'Stock your pantry',
    body: 'Scan a supermarket receipt and we\'ll add everything automatically — takes about 30 seconds.',
    cta: 'Scan a receipt',
    href: '/pantry',
  }
  if (!hasLogsEver) return {
    title: 'Log your first meal',
    body: 'Start tracking what you eat to see your nutrition trends over time.',
    cta: 'Log a meal',
    href: '/log',
  }
  if (!hasGoals) return {
    title: 'Set a calorie goal',
    body: 'Give PantryIQ a target so we can tailor every meal suggestion to your needs.',
    cta: 'Set goals',
    href: '/goals',
  }
  return null
}

// ── page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const [goalsRes, logsRes, weekLogsRes, recentLogsRes, pantryRes] = await Promise.all([
    supabase.from('nutrition_goals').select('*').eq('user_id', user.id).single(),
    supabase.from('intake_logs').select('*').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`),
    supabase.from('intake_logs').select('logged_at, calories, protein_g').eq('user_id', user.id).gte('logged_at', sevenDaysAgo),
    supabase.from('intake_logs').select('logged_at').eq('user_id', user.id).gte('logged_at', thirtyDaysAgo).order('logged_at', { ascending: false }),
    supabase.from('pantry_items').select('id, name, expiry_date').eq('user_id', user.id),
  ])

  const goals = goalsRes.data as NutritionGoals | null
  const logs = (logsRes.data ?? []) as IntakeLog[]
  const weekLogs = weekLogsRes.data ?? []
  const recentLogs = (recentLogsRes.data ?? []) as { logged_at: string }[]
  const pantryItems = pantryRes.data ?? []
  const pantryCount = pantryItems.length

  const actual = sumIntake(logs)
  const gaps = goals ? computeGaps(goals, actual) : []
  const streak = computeStreak(recentLogs.map(l => l.logged_at))
  const weekly = weeklyAverage(weekLogs)

  const hasLogsEver = recentLogs.length > 0
  const isNewUser = pantryCount === 0 && !hasLogsEver
  const step = nextStep(pantryCount, hasLogsEver, !!goals)

  const expiringItems = (pantryItems as { id: string; name: string; expiry_date?: string | null }[])
    .filter(p => p.expiry_date && p.expiry_date <= in7days)
    .sort((a, b) => (a.expiry_date ?? '').localeCompare(b.expiry_date ?? ''))

  // Whether to show each section
  const showEmptyLogState = pantryCount > 0 && logs.length === 0
  const showStats = logs.length > 0

  return (
    <div className="space-y-5">

      {/* ── Greeting row ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good {greeting()}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {logs.length > 0
              ? `${logs.length} meal${logs.length !== 1 ? 's' : ''} logged today.`
              : 'Nothing logged yet today.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {streak >= 2 && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
              🔥 {streak} days
            </span>
          )}
          <Link href="/log"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-medium transition-colors shadow-sm">
            <Plus size={13} /> Log meal
          </Link>
        </div>
      </div>

      {/* ── Next step card ───────────────────────────────────────────── */}
      {step && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white">
          <p className="text-xs font-semibold opacity-70 uppercase tracking-widest mb-1.5">Next step</p>
          <h2 className="text-base font-bold mb-1">{step.title}</h2>
          <p className="text-sm opacity-90 mb-4 leading-relaxed max-w-sm">{step.body}</p>
          <Link href={step.href}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-700 rounded-full text-sm font-semibold hover:bg-emerald-50 transition-colors">
            {step.cta} <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Today's log: friendly empty state ───────────────────────── */}
      {showEmptyLogState && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
          <p className="text-sm font-medium text-gray-600 mb-1">Nothing logged yet today</p>
          <p className="text-xs text-gray-400 mb-4">How was breakfast? Log your first meal to start tracking.</p>
          <Link href="/log"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-medium transition-colors">
            <Plus size={14} /> Log a meal
          </Link>
        </div>
      )}

      {/* ── Today's stat cards ───────────────────────────────────────── */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Calories" value={`${actual.calories}`} unit="kcal"
            sub={goals ? `of ${goals.calories} goal` : 'no goal set'}
            accent={goals ? Math.min(actual.calories / goals.calories, 1.2) : null} />
          <StatCard label="Protein" value={actual.protein_g.toFixed(1)} unit="g"
            sub={goals ? `of ${goals.protein_g}g goal` : ''}
            accent={goals ? Math.min(actual.protein_g / goals.protein_g, 1.2) : null} />
          <StatCard label="Carbs" value={actual.carbs_g.toFixed(1)} unit="g"
            sub={goals ? `of ${goals.carbs_g}g goal` : ''}
            accent={goals ? Math.min(actual.carbs_g / goals.carbs_g, 1.2) : null} />
          <StatCard label="Pantry items" value={String(pantryCount)} unit="" sub="in stock" accent={null} />
        </div>
      )}

      {/* ── This week summary ────────────────────────────────────────── */}
      {weekly.days >= 2 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            This week &mdash; {weekly.days}-day average
          </p>
          <div className="flex items-stretch gap-6 flex-wrap">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {weekly.avgCal}
                <span className="text-sm font-normal text-gray-400 ml-1">kcal / day</span>
              </p>
              {goals && (
                <p className={`text-xs mt-0.5 font-medium ${weekly.avgCal > goals.calories ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {weekly.avgCal > goals.calories ? '+' : ''}{weekly.avgCal - goals.calories} vs goal
                </p>
              )}
            </div>

            {weekly.avgPro > 0 && (
              <>
                <div className="w-px self-stretch bg-gray-100" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {weekly.avgPro}
                    <span className="text-sm font-normal text-gray-400 ml-1">g protein / day</span>
                  </p>
                  {goals && (
                    <p className={`text-xs mt-0.5 font-medium ${weekly.avgPro >= goals.protein_g ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {weekly.avgPro >= goals.protein_g ? '✓ On target' : `${goals.protein_g - weekly.avgPro}g below goal`}
                    </p>
                  )}
                </div>
              </>
            )}

            {goals && (
              <>
                <div className="w-px self-stretch bg-gray-100 hidden md:block" />
                <div className="flex-1 min-w-32 self-center hidden md:block">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                    <span>Calorie target</span>
                    <span>{Math.round((weekly.avgCal / goals.calories) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${weekly.avgCal > goals.calories ? 'bg-rose-400' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (weekly.avgCal / goals.calories) * 100)}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Expiry warning ───────────────────────────────────────────── */}
      {expiringItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-900">
              ⏰ {expiringItems.length} item{expiringItems.length !== 1 ? 's' : ''} expiring this week
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {expiringItems.slice(0, 4).map(i => i.name).join(', ')}
              {expiringItems.length > 4 ? ` +${expiringItems.length - 4} more` : ''}
            </p>
          </div>
          <Link href="/meals" className="shrink-0 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
            Get meal ideas →
          </Link>
        </div>
      )}

      {/* ── Nutrient gap chart ───────────────────────────────────────── */}
      {gaps.length > 0 && showStats && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Today&apos;s nutrient progress</h2>
          <NutrientGapChart gaps={gaps} />
        </div>
      )}

      {/* ── Set goals nudge ──────────────────────────────────────────── */}
      {!goals && pantryCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          Set your daily nutrition goals to unlock personalised meal suggestions and gap tracking.{' '}
          <Link href="/goals" className="underline font-semibold">Set goals →</Link>
        </div>
      )}

      <OnboardingModal isNewUser={isNewUser} />
    </div>
  )
}

// ── components ───────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, sub, accent }: {
  label: string
  value: string
  unit: string
  sub: string
  accent: number | null  // 0–1.2 fill ratio, null = no bar
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {accent !== null && (
        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${accent > 1 ? 'bg-rose-400' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(100, accent * 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
