import { createClient } from '@/lib/supabase/server'
import { sumIntake, computeGaps } from '@/lib/nutrition'
import IntakeLogClient from '@/components/nutrition/IntakeLogClient'
import type { IntakeLog, NutritionGoals } from '@/types'

export default async function LogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const [goalsRes, logsRes] = await Promise.all([
    supabase.from('nutrition_goals').select('*').eq('user_id', user.id).single(),
    supabase.from('intake_logs').select('*').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`).order('logged_at'),
  ])

  const goals = goalsRes.data as NutritionGoals | null
  const logs = (logsRes.data ?? []) as IntakeLog[]
  const actual = sumIntake(logs)
  const gaps = goals ? computeGaps(goals, actual) : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Log</h1>
      <IntakeLogClient initialLogs={logs} goals={goals} actual={actual} gaps={gaps} userId={user.id} />
    </div>
  )
}
