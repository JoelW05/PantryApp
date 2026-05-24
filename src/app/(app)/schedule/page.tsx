import { createClient } from '@/lib/supabase/server'
import ScheduleClient from '@/components/schedule/ScheduleClient'
import type { ScheduleBlock } from '@/types'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 7)

  const { data } = await supabase
    .from('schedule_blocks')
    .select('*')
    .eq('user_id', user.id)
    .gte('start_time', `${today}T00:00:00`)
    .lte('start_time', tomorrow.toISOString())
    .order('start_time')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        <p className="text-gray-500 mt-1 text-sm">Add your free cooking windows so meal suggestions fit your day.</p>
      </div>
      <ScheduleClient initialBlocks={(data ?? []) as ScheduleBlock[]} userId={user.id} />
    </div>
  )
}
