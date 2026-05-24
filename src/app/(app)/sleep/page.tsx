import { createClient } from '@/lib/supabase/server'
import SleepClient from '@/components/SleepClient'
import type { SleepLog, IntakeLog } from '@/types'

export default async function SleepPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [sleepRes, logsRes] = await Promise.all([
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).gte('sleep_start', thirtyDaysAgo.toISOString()).order('sleep_start'),
    supabase.from('intake_logs').select('*').eq('user_id', user.id).gte('logged_at', thirtyDaysAgo.toISOString()),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sleep</h1>
        <p className="text-gray-500 mt-1 text-sm">Track your sleep and see how your diet may be affecting it.</p>
      </div>
      <SleepClient
        initialLogs={(sleepRes.data ?? []) as SleepLog[]}
        intakeLogs={(logsRes.data ?? []) as IntakeLog[]}
        userId={user.id}
      />
    </div>
  )
}
